<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\Api\V1\OrderResource;
use App\Models\Cart;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class OrderController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['items', 'store'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return $this->paginated($orders);
    }

    public function show(Order $order): JsonResponse
    {
        $this->authorize('view', $order);
        return $this->success(new OrderResource($order->load(['items', 'store'])));
    }

    public function create(Request $request): JsonResponse
    {
        $cart = Cart::where('user_id', $request->user()->id)->firstOrFail();
        
        if ($cart->items->isEmpty()) {
            return $this->error('Cart is empty', 'EMPTY_CART');
        }

        // TODO: Implement order creation logic with payment processing
        return $this->error('Order creation not yet implemented', 'NOT_IMPLEMENTED');
    }
}


