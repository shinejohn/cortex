<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreProductRequest;
use App\Http\Requests\Api\V1\UpdateProductRequest;
use App\Http\Resources\Api\V1\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ProductController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()->with(['store'])->where('is_active', true);

        if ($request->has('store_id')) {
            $query->where('store_id', $request->store_id);
        }

        $products = $query->orderBy('name')->paginate($request->get('per_page', 20));

        return $this->paginated($products);
    }

    public function show(Product $product): JsonResponse
    {
        return $this->success(new ProductResource($product->load('store')));
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = Product::create($request->validated());
        return $this->success(new ProductResource($product), 'Product created successfully', 201);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);
        $product->update($request->validated());
        return $this->success(new ProductResource($product), 'Product updated successfully');
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->authorize('delete', $product);
        $product->delete();
        return $this->noContent();
    }
}


