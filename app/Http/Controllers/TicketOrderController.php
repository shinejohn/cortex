<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\TicketOrder;
use App\Models\TicketPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class TicketOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TicketOrder::query()
            ->with(['event', 'items.ticketPlan']);

        if ($request->user()) {
            $query->forUser($request->user()->id);
        }

        if ($request->has('event_id')) {
            $query->forEvent($request->query('event_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        $orders = $query->latest()->paginate(10);

        return response()->json($orders);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_id' => 'required|uuid|exists:events,id',
            'items' => 'required|array|min:1',
            'items.*.ticket_plan_id' => 'required|uuid|exists:ticket_plans,id',
            'items.*.quantity' => 'required|integer|min:1',
            'promo_code' => 'nullable|array',
            'billing_info' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $subtotal = 0;
            $orderItems = [];

            foreach ($validated['items'] as $item) {
                $ticketPlan = TicketPlan::find($item['ticket_plan_id']);

                if ($ticketPlan->available_quantity < $item['quantity']) {
                    return response()->json([
                        'error' => "Not enough tickets available for {$ticketPlan->name}",
                    ], 400);
                }

                $totalPrice = $ticketPlan->price * $item['quantity'];
                $subtotal += $totalPrice;

                $orderItems[] = [
                    'ticket_plan_id' => $ticketPlan->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $ticketPlan->price,
                    'total_price' => $totalPrice,
                ];

                $ticketPlan->decrement('available_quantity', $item['quantity']);
            }

            $fees = $subtotal > 0 ? $subtotal * 0.1 : 0;
            $discount = 0;

            if (isset($validated['promo_code']['code']) && $validated['promo_code']['code'] === 'JAZZ10') {
                $discount = $subtotal * 0.1;
            }

            $total = round($subtotal + $fees - $discount, 2);
            $isFree = $total <= 0;

            $order = TicketOrder::create([
                'event_id' => $validated['event_id'],
                'user_id' => $request->user()->id,
                'status' => $isFree ? 'completed' : 'pending',
                'subtotal' => $subtotal,
                'fees' => $fees,
                'discount' => $discount,
                'total' => $total,
                'promo_code' => $validated['promo_code'] ?? null,
                'billing_info' => $validated['billing_info'] ?? null,
                'payment_status' => $isFree ? 'completed' : 'pending',
                'completed_at' => $isFree ? now() : null,
            ]);

            foreach ($orderItems as $item) {
                $order->items()->create([
                    ...$item,
                    'ticket_order_id' => $order->id,
                ]);
            }

            return response()->json($order->load(['items.ticketPlan', 'event']), 201);
        });
    }

    public function show(TicketOrder $ticketOrder): JsonResponse
    {
        $ticketOrder->load(['event', 'items.ticketPlan', 'user']);

        return response()->json($ticketOrder);
    }

    public function update(Request $request, TicketOrder $ticketOrder): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'string|in:pending,completed,cancelled',
            'payment_status' => 'string|in:pending,completed,failed',
            'payment_intent_id' => 'nullable|string',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'completed' && ! $ticketOrder->completed_at) {
            $validated['completed_at'] = now();
        }

        $ticketOrder->update($validated);

        return response()->json($ticketOrder);
    }

    public function destroy(TicketOrder $ticketOrder): JsonResponse
    {
        if ($ticketOrder->status === 'completed') {
            return response()->json(['error' => 'Cannot delete completed orders'], 400);
        }

        DB::transaction(function () use ($ticketOrder) {
            foreach ($ticketOrder->items as $item) {
                $item->ticketPlan->increment('available_quantity', $item->quantity);
            }

            $ticketOrder->delete();
        });

        return response()->json(['message' => 'Order deleted successfully']);
    }
}
