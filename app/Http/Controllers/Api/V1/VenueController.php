<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreVenueRequest;
use App\Http\Requests\Api\V1\UpdateVenueRequest;
use App\Http\Resources\Api\V1\VenueResource;
use App\Models\Venue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class VenueController extends BaseController
{
    /**
     * List venues.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Venue::query();

        if ($request->has('verified')) {
            $query->where('verified', $request->boolean('verified'));
        }

        if ($request->has('venue_type')) {
            $query->where('venue_type', $request->venue_type);
        }

        $venues = $query->orderBy('name')->paginate($request->get('per_page', 20));

        return $this->paginated($venues);
    }

    /**
     * Get venue details.
     * 
     * @urlParam venue string required The venue UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "name": "Concert Hall",
     *     "address": "123 Main St"
     *   }
     * }
     * 
     * @unauthenticated
     */
    public function show(Venue $venue): JsonResponse
    {
        return $this->success(new VenueResource($venue));
    }

    /**
     * Create venue.
     * 
     * @bodyParam name string required The venue name. Example: Concert Hall
     * @bodyParam address string required The venue address. Example: 123 Main St
     * @bodyParam city string required The city. Example: Miami
     * @bodyParam state string required The state. Example: FL
     * @bodyParam zipcode string required The zipcode. Example: 33101
     * @bodyParam latitude float The latitude. Example: 25.7617
     * @bodyParam longitude float The longitude. Example: -80.1918
     * 
     * @response 201 {
     *   "success": true,
     *   "message": "Venue created successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function store(StoreVenueRequest $request): JsonResponse
    {
        $venue = Venue::create($request->validated());

        return $this->success(new VenueResource($venue), 'Venue created successfully', 201);
    }

    /**
     * Update venue.
     * 
     * @urlParam venue string required The venue UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam name string The venue name. Example: Updated Venue Name
     * @bodyParam address string The venue address.
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Venue updated successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function update(UpdateVenueRequest $request, Venue $venue): JsonResponse
    {
        $this->authorize('update', $venue);

        $venue->update($request->validated());

        return $this->success(new VenueResource($venue), 'Venue updated successfully');
    }

    /**
     * Get venue events.
     * 
     * @urlParam venue string required The venue UUID. Example: 550e8400-e29b-41d4-a716-446655440000
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
    public function events(Request $request, Venue $venue): JsonResponse
    {
        $events = $venue->events()
            ->where('event_date', '>=', now())
            ->orderBy('event_date')
            ->paginate($request->get('per_page', 20));

        return $this->paginated($events);
    }

    /**
     * Find nearby venues.
     * 
     * @queryParam latitude float required The latitude. Example: 25.7617
     * @queryParam longitude float required The longitude. Example: -80.1918
     * @queryParam radius float The search radius in miles. Example: 10
     * 
     * @response 200 {
     *   "success": true,
     *   "data": [...]
     * }
     * 
     * @unauthenticated
     */
    public function nearby(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'radius' => ['sometimes', 'numeric', 'min:0', 'max:50'], // miles
        ]);

        // TODO: Implement geospatial search
        $venues = Venue::limit(20)->get();

        return $this->success(VenueResource::collection($venues));
    }

    /**
     * Get featured venues.
     * 
     * @queryParam limit integer Number of venues to return. Example: 10
     * 
     * @response 200 {
     *   "success": true,
     *   "data": [...]
     * }
     * 
     * @unauthenticated
     */
    public function featured(Request $request): JsonResponse
    {
        $venues = Venue::where('verified', true)
            ->orderBy('rating', 'desc')
            ->limit($request->get('limit', 10))
            ->get();

        return $this->success(VenueResource::collection($venues));
    }
}

