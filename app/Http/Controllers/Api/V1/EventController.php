<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreEventRequest;
use App\Http\Requests\Api\V1\UpdateEventRequest;
use App\Http\Resources\Api\V1\EventResource;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Events
 * 
 * Event management endpoints for creating and managing events.
 */
final class EventController extends BaseController
{
    /**
     * List events.
     * 
     * @queryParam region_id string Filter by region ID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @queryParam venue_id string Filter by venue ID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @queryParam date_from string Filter events from date. Example: 2025-01-01
     * @queryParam date_to string Filter events to date. Example: 2025-12-31
     * @queryParam category string Filter by category. Example: music
     * @queryParam per_page integer Items per page. Example: 20
     * 
     * @response 200 {
     *   "success": true,
     *   "data": [...],
     *   "meta": {...}
     * }
     * 
     * @unauthenticated
     */
    public function index(Request $request): JsonResponse
    {
        $query = Event::query()->with(['venue', 'performer', 'regions']);

        if ($request->has('region_id')) {
            $query->whereHas('regions', fn($q) => $q->where('regions.id', $request->region_id));
        }

        if ($request->has('venue_id')) {
            $query->where('venue_id', $request->venue_id);
        }

        if ($request->has('date_from')) {
            $query->where('event_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('event_date', '<=', $request->date_to);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $events = $query->orderBy('event_date')->paginate($request->get('per_page', 20));

        return $this->paginated($events);
    }

    /**
     * Get event details.
     * 
     * @urlParam event string required The event UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "title": "Concert",
     *     "event_date": "2025-12-31"
     *   }
     * }
     * 
     * @unauthenticated
     */
    public function show(Event $event): JsonResponse
    {
        return $this->success(new EventResource($event->load(['venue', 'performer', 'regions', 'workspace'])));
    }

    /**
     * Create event.
     * 
     * @bodyParam workspace_id string required The workspace ID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam venue_id string The venue ID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam title string required The event title. Example: Summer Concert
     * @bodyParam description string The event description.
     * @bodyParam event_date string required The event date. Example: 2025-12-31
     * @bodyParam category string The event category. Example: music
     * @bodyParam region_ids array Array of region IDs.
     * 
     * @response 201 {
     *   "success": true,
     *   "message": "Event created successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function store(StoreEventRequest $request): JsonResponse
    {
        $event = Event::create($request->validated());

        if ($request->has('region_ids')) {
            $event->regions()->attach($request->region_ids);
        }

        return $this->success(new EventResource($event->load(['venue', 'performer', 'regions'])), 'Event created successfully', 201);
    }

    /**
     * Update event.
     * 
     * @urlParam event string required The event UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam title string The event title. Example: Updated Title
     * @bodyParam description string The event description.
     * @bodyParam event_date string The event date. Example: 2025-12-31
     * @bodyParam region_ids array Array of region IDs.
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Event updated successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function update(UpdateEventRequest $request, Event $event): JsonResponse
    {
        $this->authorize('update', $event);

        $event->update($request->validated());

        if ($request->has('region_ids')) {
            $event->regions()->sync($request->region_ids);
        }

        return $this->success(new EventResource($event->load(['venue', 'performer', 'regions'])), 'Event updated successfully');
    }

    /**
     * Cancel event.
     * 
     * @urlParam event string required The event UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 204
     * 
     * @authenticated
     */
    public function destroy(Event $event): JsonResponse
    {
        $this->authorize('delete', $event);

        $event->update(['status' => 'cancelled']);

        return $this->noContent();
    }

    /**
     * Get upcoming events.
     */
    public function upcoming(Request $request): JsonResponse
    {
        $events = Event::where('event_date', '>=', now())
            ->where('status', '!=', 'cancelled')
            ->orderBy('event_date')
            ->limit($request->get('limit', 20))
            ->get();

        return $this->success(EventResource::collection($events));
    }

    /**
     * Get calendar view.
     */
    public function calendar(Request $request): JsonResponse
    {
        $startDate = $request->get('start', now()->startOfMonth());
        $endDate = $request->get('end', now()->endOfMonth());

        $events = Event::whereBetween('event_date', [$startDate, $endDate])
            ->where('status', '!=', 'cancelled')
            ->get()
            ->groupBy(fn($event) => $event->event_date->format('Y-m-d'));

        return $this->success($events);
    }

    /**
     * RSVP to event.
     */
    public function rsvp(Request $request, Event $event): JsonResponse
    {
        // TODO: Implement RSVP logic
        return $this->error('RSVP not yet implemented', 'NOT_IMPLEMENTED');
    }
}

