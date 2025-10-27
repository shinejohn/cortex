<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Store;
use App\Services\StripeConnectService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class OrderController extends Controller
{
    public function __construct(
        private StripeConnectService $stripeService
    ) {}

    /**
     * Display a listing of orders for the current workspace's stores
     */
    public function index(Request $request): Response
    {
        $workspace = $request->user()->currentWorkspace;

        if (! $workspace) {
            abort(403, 'No workspace selected');
        }

        $orders = Order::whereHas('store', fn ($q) => $q->where('workspace_id', $workspace->id))
            ->with(['store', 'items.product', 'user'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->when($request->filled('payment_status'), fn ($q) => $q->where('payment_status', $request->payment_status))
            ->latest()
            ->paginate(20)
            ->through(fn ($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_email' => $order->customer_email,
                'customer_name' => $order->customer_name,
                'total' => $order->total,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'created_at' => $order->created_at,
                'store' => [
                    'id' => $order->store->id,
                    'name' => $order->store->name,
                    'slug' => $order->store->slug,
                ],
                'items_count' => $order->items->count(),
            ]);

        return Inertia::render('event-city/orders/index', [
            'orders' => $orders,
            'filters' => $request->only('status', 'payment_status'),
        ]);
    }

    /**
     * Display the specified order
     */
    public function show(Request $request, Order $order): Response
    {
        $order->load(['store', 'items.product', 'user']);

        // Check authorization
        if (! $request->user()->isMemberOfWorkspace($order->store->workspace_id)
            && $order->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('event-city/orders/show', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_email' => $order->customer_email,
                'customer_name' => $order->customer_name,
                'subtotal' => $order->subtotal,
                'tax' => $order->tax,
                'shipping' => $order->shipping,
                'total' => $order->total,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'shipping_address' => $order->shipping_address,
                'billing_address' => $order->billing_address,
                'notes' => $order->notes,
                'paid_at' => $order->paid_at,
                'created_at' => $order->created_at,
                'items' => $order->items->map(fn ($item) => [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'product_description' => $item->product_description,
                    'price' => $item->price,
                    'quantity' => $item->quantity,
                    'total' => $item->total,
                    'product' => $item->product ? [
                        'id' => $item->product->id,
                        'slug' => $item->product->slug,
                        'images' => $item->product->images,
                    ] : null,
                ]),
                'store' => [
                    'id' => $order->store->id,
                    'name' => $order->store->name,
                    'slug' => $order->store->slug,
                    'logo' => $order->store->logo,
                ],
            ],
            'is_store_owner' => $request->user()->isMemberOfWorkspace($order->store->workspace_id),
        ]);
    }

    /**
     * Create checkout session from cart
     */
    public function checkout(Request $request): JsonResponse
    {
        // Get cart using same logic as CartController
        $cart = $this->getOrCreateCart($request);
        $cart->load(['items.product.store', 'items.store']);

        if ($cart->items->isEmpty()) {
            return response()->json([
                'error' => 'Cart is empty',
            ], 400);
        }

        // Check if cart items are from multiple stores - only single store checkout supported
        $storeIds = $cart->items->pluck('store_id')->unique();
        if ($storeIds->count() > 1) {
            return response()->json([
                'error' => 'Cart contains items from multiple stores. Please checkout one store at a time.',
            ], 400);
        }

        $store = $cart->items->first()->store;

        if (! $store->canAcceptPayments()) {
            return response()->json([
                'error' => 'Store cannot accept payments at this time',
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Prepare line items and validate stock
            $lineItems = [];
            $subtotal = 0;

            foreach ($cart->items as $cartItem) {
                $product = $cartItem->product;

                if (! $product->isInStock()) {
                    return response()->json([
                        'error' => "Product {$product->name} is out of stock",
                    ], 400);
                }

                if ($product->track_inventory && $product->quantity < $cartItem->quantity) {
                    return response()->json([
                        'error' => "Not enough stock for {$product->name}",
                    ], 400);
                }

                $productData = [
                    'name' => $product->name,
                    'images' => $product->images ? [asset('storage/'.$product->images[0])] : [],
                ];

                if (! empty($product->description)) {
                    $productData['description'] = $product->description;
                }

                $lineItems[] = [
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => $productData,
                        'unit_amount' => (int) ($product->price * 100),
                    ],
                    'quantity' => $cartItem->quantity,
                ];

                $subtotal += $product->price * $cartItem->quantity;
            }

            // Create order
            $order = Order::create([
                'store_id' => $store->id,
                'user_id' => $request->user()?->id,
                'customer_email' => $request->user()?->email ?? $request->email,
                'customer_name' => $request->user()?->name ?? $request->name,
                'subtotal' => $subtotal,
                'tax' => 0,
                'shipping' => 0,
                'total' => $subtotal,
                'status' => 'pending',
                'payment_status' => 'pending',
            ]);

            // Create order items from cart
            foreach ($cart->items as $cartItem) {
                $product = $cartItem->product;

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_description' => $product->description,
                    'price' => $product->price,
                    'quantity' => $cartItem->quantity,
                    'total' => $product->price * $cartItem->quantity,
                ]);
            }

            // Create Stripe checkout session
            $session = $this->stripeService->createCheckoutSession(
                $store,
                $lineItems,
                route('checkout.success', ['order' => $order->id]),
                route('checkout.cancel', ['order' => $order->id])
            );

            $order->update(['stripe_payment_intent_id' => $session->payment_intent]);

            // Clear cart after successful checkout session creation
            $cart->items()->delete();

            DB::commit();

            return response()->json([
                'session_id' => $session->id,
                'url' => $session->url,
            ]);
        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => 'Failed to create checkout session: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle successful checkout
     */
    public function success(Request $request, Order $order): Response
    {
        return Inertia::render('event-city/checkout/success', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'total' => $order->total,
            ],
        ]);
    }

    /**
     * Handle cancelled checkout
     */
    public function cancel(Request $request, Order $order): Response
    {
        return Inertia::render('event-city/checkout/cancel', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
            ],
        ]);
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        if (! $request->user()->isMemberOfWorkspace($order->store->workspace_id)) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'status' => ['required', 'in:pending,processing,completed,cancelled'],
        ]);

        $order->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order,
        ]);
    }

    /**
     * Get or create cart for current user/session
     */
    private function getOrCreateCart(Request $request): \App\Models\Cart
    {
        if ($request->user()) {
            $cart = \App\Models\Cart::firstOrCreate(
                ['user_id' => $request->user()->id],
                ['session_id' => session()->getId()]
            );
        } else {
            $cart = \App\Models\Cart::firstOrCreate(
                ['session_id' => session()->getId()],
                ['user_id' => null]
            );
        }

        return $cart;
    }
}
