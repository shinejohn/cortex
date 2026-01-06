<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreBusinessRequest;
use App\Http\Requests\Api\V1\UpdateBusinessRequest;
use App\Http\Resources\Api\V1\BusinessResource;
use App\Models\Business;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BusinessController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Business::query()->with(['workspace', 'regions']);

        if ($request->has('region_id')) {
            $query->whereHas('regions', fn($q) => $q->where('regions.id', $request->region_id));
        }

        if ($request->has('category')) {
            $query->whereJsonContains('categories', $request->category);
        }

        $businesses = $query->orderBy('name')->paginate($request->get('per_page', 20));

        return $this->paginated($businesses);
    }

    public function show(Business $business): JsonResponse
    {
        return $this->success(new BusinessResource($business->load(['workspace', 'regions'])));
    }

    public function store(StoreBusinessRequest $request): JsonResponse
    {
        $business = Business::create($request->validated());

        if ($request->has('region_ids')) {
            $business->regions()->attach($request->region_ids);
        }

        return $this->success(new BusinessResource($business), 'Business created successfully', 201);
    }

    public function update(UpdateBusinessRequest $request, Business $business): JsonResponse
    {
        $this->authorize('update', $business);
        $business->update($request->validated());
        return $this->success(new BusinessResource($business), 'Business updated successfully');
    }

    public function destroy(Business $business): JsonResponse
    {
        $this->authorize('delete', $business);
        $business->delete();
        return $this->noContent();
    }

    public function nearby(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'radius' => ['sometimes', 'numeric', 'min:0', 'max:50'],
        ]);

        // TODO: Implement geospatial search
        $businesses = Business::limit(20)->get();
        return $this->success(BusinessResource::collection($businesses));
    }

    public function search(Request $request): JsonResponse
    {
        $query = Business::query();

        if ($request->has('q')) {
            $query->where('name', 'like', '%'.$request->q.'%')
                ->orWhere('description', 'like', '%'.$request->q.'%');
        }

        $businesses = $query->limit(20)->get();
        return $this->success(BusinessResource::collection($businesses));
    }
}


