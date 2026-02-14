<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\TicketOrder;
use App\Models\TicketPlan;
use App\Notifications\TicketOrderConfirmationNotification;
use App\Services\PromoCodeService;
use App\Services\QRCodeService;
use App\Services\TicketPaymentService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class TicketOrderController extends Controller
{
    public function __construct(
        private readonly TicketPaymentService $ticketPaymentService,
        private readonly QRCodeService $qrCodeService
    ) {}

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
            }

            $fees = $subtotal > 0 ? $subtotal * 0.1 : 0;
            $discount = 0;
            $promoCode = null;

            // Use PromoCodeService for promo code validation
            if (isset($validated['promo_code']['code'])) {
                $promoCodeService = app(PromoCodeService::class);
                $validation = $promoCodeService->validateCode(
                    $validated['promo_code']['code'],
                    $subtotal,
                    $validated['event_id'] ?? null
                );

                if ($validation['valid']) {
                    $discount = $validation['discount'];
                    $promoCode = $validation['promo_code'];
                }
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
                'promo_code' => $promoCode ? ['code' => $promoCode->code, 'discount' => $discount] : null,
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

            // Record promo code usage if applicable
            if ($promoCode && $discount > 0) {
                $promoCodeService = app(PromoCodeService::class);
                $promoCodeService->applyCode($promoCode, $order, $request->user());
            }

            // Generate QR codes for completed orders (free tickets)
            if ($isFree) {
                foreach ($order->items as $item) {
                    $this->qrCodeService->generateForTicketOrderItem($item);
                }
                // Send confirmation email for free tickets
                $order->user->notify(new TicketOrderConfirmationNotification($order));

                return response()->json($order->load(['items.ticketPlan', 'event']), 201);
            }

            // Create Stripe checkout session for paid orders
            $successUrl = route('tickets.checkout.success', ['order' => $order->id]);
            $cancelUrl = route('tickets.checkout.cancel', ['order' => $order->id]);

            $reserved = false;
            try {
                $this->ticketPaymentService->reserveInventory($order);
                $reserved = true;
                $session = $this->ticketPaymentService->createCheckoutSession($order, $successUrl, $cancelUrl);

                return response()->json([
                    'order' => $order->load(['items.ticketPlan', 'event']),
                    'checkout_session' => [
                        'id' => $session->id,
                        'url' => $session->url,
                    ],
                ], 201);
            } catch (Exception $e) {
                if ($reserved) {
                    $this->ticketPaymentService->releaseInventory($order);
                }

                $order->update([
                    'status' => 'cancelled',
                    'payment_status' => 'failed',
                ]);

                return response()->json([
                    'error' => 'Failed to create checkout session: '.$e->getMessage(),
                ], 500);
            }
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

    /**
     * Handle successful ticket checkout
     */
    public function checkoutSuccess(Request $request, TicketOrder $ticketOrder): RedirectResponse
    {
        // Verify the order belongs to the user
        if ($request->user() && $ticketOrder->user_id !== $request->user()->id) {
            abort(403);
        }

        // If order is already completed, redirect to my tickets
        if ($ticketOrder->status === 'completed') {
            return redirect()->route('tickets.my-tickets')->with('success', 'Your tickets have been confirmed!');
        }

        // Check payment status
        if ($ticketOrder->payment_status === 'completed') {
            $ticketOrder->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            // Generate QR codes for all ticket items
            foreach ($ticketOrder->items as $item) {
                if (! $item->qr_code) {
                    $this->qrCodeService->generateForTicketOrderItem($item);
                }
            }

            // Send confirmation email
            $ticketOrder->user->notify(new TicketOrderConfirmationNotification($ticketOrder));

            return redirect()->route('tickets.my-tickets')->with('success', 'Your tickets have been confirmed!');
        }

        // If payment is still pending, show pending message
        return redirect()->route('tickets.my-tickets')->with('info', 'Your payment is being processed. You will receive a confirmation email shortly.');
    }

    /**
     * Handle cancelled ticket checkout
     */
    public function checkoutCancel(Request $request, TicketOrder $ticketOrder): RedirectResponse
    {
        $this->ticketPaymentService->releaseInventory($ticketOrder);

        $ticketOrder->update([
            'status' => 'cancelled',
            'payment_status' => 'cancelled',
        ]);

        return redirect()->route('events.tickets.selection', ['event' => $ticketOrder->event_id])
            ->with('error', 'Your order was cancelled. Please try again if you wish to purchase tickets.');
    }
}
