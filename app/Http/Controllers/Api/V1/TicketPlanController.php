<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreTicketPlanRequest;
use App\Http\Requests\Api\V1\UpdateTicketPlanRequest;
use App\Http\Resources\Api\V1\TicketPlanResource;
use App\Models\Event;
use App\Models\TicketPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class TicketPlanController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = TicketPlan::query()->with(['event'])->active();

        if ($request->has('event_id')) {
            $query->where('event_id', $request->event_id);
        }

        $plans = $query->orderBySortOrder()->paginate($request->get('per_page', 20));

        return $this->paginated($plans);
    }

    public function show(TicketPlan $ticketPlan): JsonResponse
    {
        return $this->success(new TicketPlanResource($ticketPlan->load('event')));
    }

    public function store(StoreTicketPlanRequest $request, Event $event): JsonResponse
    {
        $this->authorize('update', $event);
        $plan = $event->ticketPlans()->create($request->validated());
        return $this->success(new TicketPlanResource($plan), 'Ticket plan created successfully', 201);
    }

    public function update(UpdateTicketPlanRequest $request, TicketPlan $ticketPlan): JsonResponse
    {
        $this->authorize('update', $ticketPlan->event);
        $ticketPlan->update($request->validated());
        return $this->success(new TicketPlanResource($ticketPlan), 'Ticket plan updated successfully');
    }

    public function destroy(TicketPlan $ticketPlan): JsonResponse
    {
        $this->authorize('delete', $ticketPlan->event);
        $ticketPlan->delete();
        return $this->noContent();
    }
}

