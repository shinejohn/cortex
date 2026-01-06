<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StorePerformerRequest;
use App\Http\Requests\Api\V1\UpdatePerformerRequest;
use App\Http\Resources\Api\V1\PerformerResource;
use App\Models\Performer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Performers
 * 
 * Performer management endpoints for artists and entertainers.
 */
final class PerformerController extends BaseController
{
    /**
     * List performers.
     * 
     * @queryParam genre string Filter by genre. Example: rock
     * @queryParam available_for_booking boolean Filter by booking availability. Example: true
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
        $query = Performer::query();

        if ($request->has('genre')) {
            $query->whereJsonContains('genres', $request->genre);
        }

        if ($request->has('available_for_booking')) {
            $query->where('available_for_booking', $request->boolean('available_for_booking'));
        }

        $performers = $query->orderBy('name')->paginate($request->get('per_page', 20));

        return $this->paginated($performers);
    }

    /**
     * Get performer details.
     * 
     * @urlParam performer string required The performer UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "name": "Artist Name",
     *     "genres": ["rock", "pop"]
     *   }
     * }
     * 
     * @unauthenticated
     */
    public function show(Performer $performer): JsonResponse
    {
        return $this->success(new PerformerResource($performer));
    }

    /**
     * Create performer.
     * 
     * @bodyParam name string required The performer name. Example: Artist Name
     * @bodyParam genres array Array of genres. Example: ["rock", "pop"]
     * @bodyParam bio string The performer biography.
     * @bodyParam available_for_booking boolean Whether available for booking. Example: true
     * 
     * @response 201 {
     *   "success": true,
     *   "message": "Performer created successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function store(StorePerformerRequest $request): JsonResponse
    {
        $performer = Performer::create($request->validated());

        return $this->success(new PerformerResource($performer), 'Performer created successfully', 201);
    }

    /**
     * Update performer.
     * 
     * @urlParam performer string required The performer UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam name string The performer name. Example: Updated Name
     * @bodyParam genres array Array of genres.
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Performer updated successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function update(UpdatePerformerRequest $request, Performer $performer): JsonResponse
    {
        $this->authorize('update', $performer);

        $performer->update($request->validated());

        return $this->success(new PerformerResource($performer), 'Performer updated successfully');
    }

    /**
     * Get performer's shows.
     * 
     * @urlParam performer string required The performer UUID. Example: 550e8400-e29b-41d4-a716-446655440000
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
    public function shows(Request $request, Performer $performer): JsonResponse
    {
        $shows = $performer->upcomingShows()
            ->orderBy('show_date')
            ->paginate($request->get('per_page', 20));

        return $this->paginated($shows);
    }

    /**
     * Get featured performers.
     * 
     * @queryParam limit integer Number of performers to return. Example: 10
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
        $performers = Performer::where('is_verified', true)
            ->orderBy('rating', 'desc')
            ->limit($request->get('limit', 10))
            ->get();

        return $this->success(PerformerResource::collection($performers));
    }

    /**
     * Get trending performers.
     * 
     * @queryParam limit integer Number of performers to return. Example: 10
     * 
     * @response 200 {
     *   "success": true,
     *   "data": [...]
     * }
     * 
     * @unauthenticated
     */
    public function trending(Request $request): JsonResponse
    {
        $performers = Performer::orderBy('trending_score', 'desc')
            ->limit($request->get('limit', 10))
            ->get();

        return $this->success(PerformerResource::collection($performers));
    }
}

