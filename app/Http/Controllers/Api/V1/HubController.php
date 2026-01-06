<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreHubRequest;
use App\Http\Requests\Api\V1\UpdateHubRequest;
use App\Http\Resources\Api\V1\HubResource;
use App\Models\Hub;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class HubController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Hub::query()->with(['workspace', 'createdBy'])->where('is_active', true);

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $hubs = $query->orderBy('name')->paginate($request->get('per_page', 20));

        return $this->paginated($hubs);
    }

    public function show(Hub $hub): JsonResponse
    {
        return $this->success(new HubResource($hub->load(['workspace', 'createdBy'])));
    }

    public function store(StoreHubRequest $request): JsonResponse
    {
        $hub = Hub::create([
            'workspace_id' => $request->workspace_id,
            'created_by' => $request->user()->id,
            'name' => $request->name,
            'slug' => \Illuminate\Support\Str::slug($request->name),
            'description' => $request->description,
        ]);

        return $this->success(new HubResource($hub), 'Hub created successfully', 201);
    }

    public function update(UpdateHubRequest $request, Hub $hub): JsonResponse
    {
        $this->authorize('update', $hub);
        $hub->update($request->validated());
        return $this->success(new HubResource($hub), 'Hub updated successfully');
    }
}


