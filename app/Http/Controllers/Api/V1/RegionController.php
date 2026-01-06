<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreRegionRequest;
use App\Http\Requests\Api\V1\UpdateRegionRequest;
use App\Http\Resources\Api\V1\RegionResource;
use App\Models\Region;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Regions
 * 
 * Region management endpoints for geographic regions and content organization.
 */
final class RegionController extends BaseController
{
    /**
     * List all regions.
     * 
     * @queryParam type string Filter by region type. Example: city
     * @queryParam parent_id string Filter by parent region. Example: 550e8400-e29b-41d4-a716-446655440000
     * @queryParam is_active boolean Filter by active status. Example: true
     * @queryParam search string Search by name. Example: Miami
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
        $query = Region::query();

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }

        $regions = $query->with(['parent', 'children'])->paginate($request->get('per_page', 20));

        return $this->paginated($regions);
    }

    /**
     * Get region details.
     * 
     * @urlParam region string required The region UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "name": "Miami",
     *     "type": "city"
     *   }
     * }
     * 
     * @unauthenticated
     */
    public function show(Region $region): JsonResponse
    {
        return $this->success(new RegionResource($region->load(['parent', 'children', 'zipcodes'])));
    }

    /**
     * Create region.
     * 
     * @bodyParam name string required The region name. Example: Miami
     * @bodyParam slug string The region slug (auto-generated if not provided). Example: miami
     * @bodyParam type string The region type. Example: city
     * @bodyParam parent_id string The parent region UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 201 {
     *   "success": true,
     *   "message": "Region created successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function store(StoreRegionRequest $request): JsonResponse
    {
        $this->authorize('create', Region::class);

        $region = Region::create($request->validated());

        return $this->success(new RegionResource($region), 'Region created successfully', 201);
    }

    /**
     * Update region.
     * 
     * @urlParam region string required The region UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam name string The region name. Example: Updated Name
     * @bodyParam is_active boolean Whether the region is active. Example: true
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Region updated successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function update(UpdateRegionRequest $request, Region $region): JsonResponse
    {
        $this->authorize('update', $region);

        $region->update($request->validated());

        return $this->success(new RegionResource($region), 'Region updated successfully');
    }

    /**
     * Search regions.
     * 
     * @queryParam q string required Search query. Example: Miami
     * 
     * @response 200 {
     *   "success": true,
     *   "data": [...]
     * }
     * 
     * @unauthenticated
     */
    public function search(Request $request): JsonResponse
    {
        $query = Region::query();

        if ($request->has('q')) {
            $query->where('name', 'like', '%'.$request->q.'%')
                ->orWhere('slug', 'like', '%'.$request->q.'%');
        }

        $regions = $query->where('is_active', true)->limit(20)->get();

        return $this->success(RegionResource::collection($regions));
    }

    /**
     * Get region content.
     * 
     * Returns aggregated content (posts, events, businesses) for a region.
     * 
     * @urlParam region string required The region UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "posts": [],
     *     "events": [],
     *     "businesses": []
     *   }
     * }
     * 
     * @unauthenticated
     */
    public function content(Region $region): JsonResponse
    {
        // TODO: Return aggregated content for region
        return $this->success([
            'posts' => [],
            'events' => [],
            'businesses' => [],
        ]);
    }
}

