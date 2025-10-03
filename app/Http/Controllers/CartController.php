<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class CartController extends Controller
{
    /**
     * Display the cart
     */
    public function index(Request $request): Response
    {
        $cart = $this->getOrCreateCart($request);
        $cart->load(['items.product.store', 'items.store']);

        return Inertia::render('cart/index', [
            'cart' => [
                'id' => $cart->id,
                'items' => $cart->items->map(fn ($item) => [
                    'id' => $item->id,
                    'quantity' => $item->quantity,
                    'price' => (float) $item->price,
                    'total' => (float) $item->total,
                    'product' => [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'slug' => $item->product->slug,
                        'images' => $item->product->images,
                        'is_in_stock' => $item->product->isInStock(),
                    ],
                    'store' => [
                        'id' => $item->store->id,
                        'name' => $item->store->name,
                        'slug' => $item->store->slug,
                    ],
                ]),
                'items_count' => $cart->items_count,
                'total' => (float) $cart->total,
            ],
        ]);
    }

    /**
     * Add item to cart
     */
    public function add(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $product = Product::with('store')->findOrFail($validated['product_id']);

        // Check if product is in stock
        if (! $product->isInStock()) {
            return response()->json([
                'error' => 'Product is out of stock',
            ], 400);
        }

        // Check if requested quantity is available
        if ($product->track_inventory && $validated['quantity'] > $product->quantity) {
            return response()->json([
                'error' => "Only {$product->quantity} items available",
            ], 400);
        }

        try {
            DB::beginTransaction();

            $cart = $this->getOrCreateCart($request);

            // Check if item already exists in cart
            $cartItem = CartItem::where('cart_id', $cart->id)
                ->where('product_id', $product->id)
                ->first();

            if ($cartItem) {
                // Update quantity
                $newQuantity = $cartItem->quantity + $validated['quantity'];

                // Check stock again for new total
                if ($product->track_inventory && $newQuantity > $product->quantity) {
                    DB::rollBack();

                    return response()->json([
                        'error' => "Only {$product->quantity} items available",
                    ], 400);
                }

                $cartItem->update(['quantity' => $newQuantity]);
            } else {
                // Create new cart item
                $cartItem = CartItem::create([
                    'cart_id' => $cart->id,
                    'product_id' => $product->id,
                    'store_id' => $product->store_id,
                    'quantity' => $validated['quantity'],
                    'price' => $product->price,
                ]);
            }

            DB::commit();

            // Reload cart with items
            $cart->load(['items.product', 'items.store']);

            return response()->json([
                'message' => 'Product added to cart',
                'cart' => [
                    'items_count' => $cart->items_count,
                    'total' => $cart->total,
                ],
            ]);
        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => 'Failed to add item to cart',
            ], 500);
        }
    }

    /**
     * Update cart item quantity
     */
    public function update(Request $request, CartItem $cartItem): Response
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $cart = $this->getOrCreateCart($request);

        // Verify cart ownership
        if ($cartItem->cart_id !== $cart->id) {
            abort(403);
        }

        $product = $cartItem->product;

        // Check stock availability
        if ($product->track_inventory && $validated['quantity'] > $product->quantity) {
            return back()->withErrors([
                'quantity' => "Only {$product->quantity} items available",
            ]);
        }

        $cartItem->update(['quantity' => $validated['quantity']]);

        $cart->load(['items.product.store', 'items.store']);

        return Inertia::render('cart/index', [
            'cart' => [
                'id' => $cart->id,
                'items' => $cart->items->map(fn ($item) => [
                    'id' => $item->id,
                    'quantity' => $item->quantity,
                    'price' => (float) $item->price,
                    'total' => (float) $item->total,
                    'product' => [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'slug' => $item->product->slug,
                        'images' => $item->product->images,
                        'is_in_stock' => $item->product->isInStock(),
                    ],
                    'store' => [
                        'id' => $item->store->id,
                        'name' => $item->store->name,
                        'slug' => $item->store->slug,
                    ],
                ]),
                'items_count' => $cart->items_count,
                'total' => (float) $cart->total,
            ],
        ]);
    }

    /**
     * Remove item from cart
     */
    public function remove(Request $request, CartItem $cartItem): Response
    {
        $cart = $this->getOrCreateCart($request);

        // Verify cart ownership
        if ($cartItem->cart_id !== $cart->id) {
            abort(403);
        }

        $cartItem->delete();

        $cart->load(['items.product.store', 'items.store']);

        return Inertia::render('cart/index', [
            'cart' => [
                'id' => $cart->id,
                'items' => $cart->items->map(fn ($item) => [
                    'id' => $item->id,
                    'quantity' => $item->quantity,
                    'price' => (float) $item->price,
                    'total' => (float) $item->total,
                    'product' => [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'slug' => $item->product->slug,
                        'images' => $item->product->images,
                        'is_in_stock' => $item->product->isInStock(),
                    ],
                    'store' => [
                        'id' => $item->store->id,
                        'name' => $item->store->name,
                        'slug' => $item->store->slug,
                    ],
                ]),
                'items_count' => $cart->items_count,
                'total' => (float) $cart->total,
            ],
        ]);
    }

    /**
     * Clear all items from cart
     */
    public function clear(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);
        $cart->items()->delete();

        return response()->json([
            'message' => 'Cart cleared',
            'cart' => [
                'items_count' => 0,
                'total' => 0,
            ],
        ]);
    }

    /**
     * Get cart count for header display
     */
    public function count(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);

        return response()->json([
            'count' => $cart->items_count,
        ]);
    }

    /**
     * Get cart items for dropdown
     */
    public function items(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);
        $cart->load(['items.product.store', 'items.store']);

        return response()->json([
            'items' => $cart->items->map(fn ($item) => [
                'id' => $item->id,
                'quantity' => $item->quantity,
                'price' => (float) $item->price,
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'images' => $item->product->images,
                ],
                'store' => [
                    'slug' => $item->store->slug,
                ],
            ]),
            'total' => (float) $cart->total,
        ]);
    }

    /**
     * Get or create cart for current user/session
     */
    private function getOrCreateCart(Request $request): Cart
    {
        if ($request->user()) {
            $cart = Cart::firstOrCreate(
                ['user_id' => $request->user()->id],
                ['session_id' => session()->getId()]
            );
        } else {
            $cart = Cart::firstOrCreate(
                ['session_id' => session()->getId()],
                ['user_id' => null]
            );
        }

        return $cart;
    }
}
