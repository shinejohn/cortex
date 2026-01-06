<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StorePhotoAlbumRequest;
use App\Http\Requests\Api\V1\UpdatePhotoAlbumRequest;
use App\Http\Resources\Api\V1\PhotoAlbumResource;
use App\Models\PhotoAlbum;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class PhotoAlbumController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = PhotoAlbum::query()->with(['user', 'workspace']);

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $albums = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return $this->paginated($albums);
    }

    public function show(PhotoAlbum $photoAlbum): JsonResponse
    {
        $photoAlbum->increment('views_count');
        return $this->success(new PhotoAlbumResource($photoAlbum->load(['user', 'workspace', 'photos'])));
    }

    public function store(StorePhotoAlbumRequest $request): JsonResponse
    {
        $album = PhotoAlbum::create($request->validated());
        return $this->success(new PhotoAlbumResource($album), 'Album created successfully', 201);
    }

    public function update(UpdatePhotoAlbumRequest $request, PhotoAlbum $photoAlbum): JsonResponse
    {
        $this->authorize('update', $photoAlbum);
        $photoAlbum->update($request->validated());
        return $this->success(new PhotoAlbumResource($photoAlbum), 'Album updated successfully');
    }

    public function addPhotos(Request $request, PhotoAlbum $photoAlbum): JsonResponse
    {
        $this->authorize('update', $photoAlbum);
        $request->validate(['photo_ids' => ['required', 'array'], 'photo_ids.*' => ['uuid', 'exists:photos,id']]);

        $photoAlbum->photos()->syncWithoutDetaching($request->photo_ids);
        return $this->success(null, 'Photos added to album successfully');
    }
}


