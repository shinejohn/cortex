<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StorePhotoRequest;
use App\Http\Requests\Api\V1\UpdatePhotoRequest;
use App\Http\Resources\Api\V1\PhotoResource;
use App\Models\Photo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class PhotoController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Photo::query()->with(['user', 'album']);

        if ($request->has('album_id')) {
            $query->where('album_id', $request->album_id);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $photos = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return $this->paginated($photos);
    }

    public function show(Photo $photo): JsonResponse
    {
        $photo->increment('views_count');
        return $this->success(new PhotoResource($photo->load(['user', 'album', 'regions'])));
    }

    public function store(StorePhotoRequest $request): JsonResponse
    {
        $photo = Photo::create($request->validated());

        if ($request->has('region_ids')) {
            $photo->regions()->attach($request->region_ids);
        }

        return $this->success(new PhotoResource($photo), 'Photo uploaded successfully', 201);
    }

    public function update(UpdatePhotoRequest $request, Photo $photo): JsonResponse
    {
        $this->authorize('update', $photo);
        $photo->update($request->validated());
        return $this->success(new PhotoResource($photo), 'Photo updated successfully');
    }

    public function destroy(Photo $photo): JsonResponse
    {
        $this->authorize('delete', $photo);
        $photo->delete();
        return $this->noContent();
    }
}


