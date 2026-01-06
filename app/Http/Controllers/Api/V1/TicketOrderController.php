<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreTicketOrderRequest;
use App\Http\Resources\Api\V1\TicketOrderResource;
use App\Models\TicketOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class TicketOrderController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $orders = TicketOrder::where('user_id', $request->user()->id)
            ->with(['items.ticketPlan'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return $this->paginated($orders);
    }

    public function show(TicketOrder $ticketOrder): JsonResponse
    {
        $this->authorize('view', $ticketOrder);
        return $this->success(new TicketOrderResource($ticketOrder->load(['items.ticketPlan'])));
    }

    public function store(StoreTicketOrderRequest $request): JsonResponse
    {
        // TODO: Implement ticket order creation with payment processing
        return $this->error('Ticket ordering not yet implemented', 'NOT_IMPLEMENTED');
    }
}


