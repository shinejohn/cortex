<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreMemorialRequest;
use App\Http\Requests\Api\V1\UpdateMemorialRequest;
use App\Http\Resources\Api\V1\MemorialResource;
use App\Models\Memorial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class MemorialController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Memorial::query()->with(['user', 'workspace', 'regions']);

        if ($request->has('is_featured')) {
            $query->where('is_featured', $request->boolean('is_featured'));
        }

        $memorials = $query->published()->orderBy('published_at', 'desc')->paginate($request->get('per_page', 20));

        return $this->paginated($memorials);
    }

    public function show(Memorial $memorial): JsonResponse
    {
        $memorial->increment('views_count');
        return $this->success(new MemorialResource($memorial->load(['user', 'workspace', 'regions'])));
    }

    public function store(StoreMemorialRequest $request): JsonResponse
    {
        $memorial = Memorial::create($request->validated());

        if ($request->has('region_ids')) {
            $memorial->regions()->attach($request->region_ids);
        }

        return $this->success(new MemorialResource($memorial), 'Memorial created successfully', 201);
    }

    public function update(UpdateMemorialRequest $request, Memorial $memorial): JsonResponse
    {
        $this->authorize('update', $memorial);
        $memorial->update($request->validated());
        return $this->success(new MemorialResource($memorial), 'Memorial updated successfully');
    }

    public function tributes(Request $request, Memorial $memorial): JsonResponse
    {
        // TODO: Implement tribute system
        return $this->success([]);
    }
}


