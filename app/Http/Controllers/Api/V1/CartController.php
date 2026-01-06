<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreCartItemRequest;
use App\Http\Resources\Api\V1\CartResource;
use App\Models\Cart;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CartController extends BaseController
{
    public function show(Request $request): JsonResponse
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
        return $this->success(new CartResource($cart->load(['items.product'])));
    }

    public function addItem(StoreCartItemRequest $request): JsonResponse
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
        $cart->items()->updateOrCreate(
            ['product_id' => $request->product_id],
            ['quantity' => $request->quantity, 'price' => $request->price]
        );
        return $this->success(new CartResource($cart->load('items')), 'Item added to cart');
    }

    public function removeItem(Request $request, string $itemId): JsonResponse
    {
        $cart = Cart::where('user_id', $request->user()->id)->firstOrFail();
        $cart->items()->where('id', $itemId)->delete();
        return $this->noContent();
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = Cart::where('user_id', $request->user()->id)->firstOrFail();
        $cart->items()->delete();
        return $this->noContent();
    }
}


