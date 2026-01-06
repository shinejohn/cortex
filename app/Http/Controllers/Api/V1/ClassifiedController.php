<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreClassifiedRequest;
use App\Http\Requests\Api\V1\UpdateClassifiedRequest;
use App\Http\Resources\Api\V1\ClassifiedResource;
use App\Models\Classified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ClassifiedController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Classified::query()->with(['user', 'workspace', 'images', 'regions']);

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', 'active');
        }

        $classifieds = $query->orderBy('posted_at', 'desc')->paginate($request->get('per_page', 20));

        return $this->paginated($classifieds);
    }

    public function show(Classified $classified): JsonResponse
    {
        $classified->increment('views_count');
        return $this->success(new ClassifiedResource($classified->load(['user', 'workspace', 'images', 'regions'])));
    }

    public function store(StoreClassifiedRequest $request): JsonResponse
    {
        $classified = Classified::create($request->validated());

        if ($request->has('region_ids')) {
            $classified->regions()->attach($request->region_ids);
        }

        return $this->success(new ClassifiedResource($classified), 'Classified created successfully', 201);
    }

    public function update(UpdateClassifiedRequest $request, Classified $classified): JsonResponse
    {
        $this->authorize('update', $classified);
        $classified->update($request->validated());
        return $this->success(new ClassifiedResource($classified), 'Classified updated successfully');
    }

    public function destroy(Classified $classified): JsonResponse
    {
        $this->authorize('delete', $classified);
        $classified->delete();
        return $this->noContent();
    }

    public function renew(Request $request, Classified $classified): JsonResponse
    {
        $this->authorize('update', $classified);
        $classified->update(['expires_at' => now()->addDays(30)]);
        return $this->success(new ClassifiedResource($classified), 'Classified renewed successfully');
    }
}


