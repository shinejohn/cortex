<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreStoreRequest;
use App\Http\Requests\Api\V1\UpdateStoreRequest;
use App\Http\Resources\Api\V1\StoreResource;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class StoreController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Store::query()->with(['workspace']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', 'approved');
        }

        $stores = $query->orderBy('name')->paginate($request->get('per_page', 20));

        return $this->paginated($stores);
    }

    public function show(Store $store): JsonResponse
    {
        return $this->success(new StoreResource($store->load(['workspace', 'products'])));
    }

    public function store(StoreStoreRequest $request): JsonResponse
    {
        $store = Store::create([
            'workspace_id' => $request->workspace_id,
            'name' => $request->name,
            'slug' => \Illuminate\Support\Str::slug($request->name),
            'description' => $request->description,
            'status' => 'pending',
        ]);

        return $this->success(new StoreResource($store), 'Store created successfully', 201);
    }

    public function update(UpdateStoreRequest $request, Store $store): JsonResponse
    {
        $this->authorize('update', $store);
        $store->update($request->validated());
        return $this->success(new StoreResource($store), 'Store updated successfully');
    }

    public function products(Request $request, Store $store): JsonResponse
    {
        $products = $store->products()->where('is_active', true)->paginate($request->get('per_page', 20));
        return $this->paginated($products);
    }
}


