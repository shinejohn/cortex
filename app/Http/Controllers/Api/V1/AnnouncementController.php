<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreAnnouncementRequest;
use App\Http\Requests\Api\V1\UpdateAnnouncementRequest;
use App\Http\Resources\Api\V1\AnnouncementResource;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AnnouncementController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Announcement::query()->with(['user', 'workspace', 'regions']);

        if ($request->has('region_id')) {
            $query->whereHas('regions', fn($q) => $q->where('regions.id', $request->region_id));
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            $query->published();
        }

        $announcements = $query->orderBy('published_at', 'desc')->paginate($request->get('per_page', 20));

        return $this->paginated($announcements);
    }

    public function show(Announcement $announcement): JsonResponse
    {
        $announcement->increment('views_count');
        return $this->success(new AnnouncementResource($announcement->load(['user', 'workspace', 'regions'])));
    }

    public function store(StoreAnnouncementRequest $request): JsonResponse
    {
        $announcement = Announcement::create($request->validated());

        if ($request->has('region_ids')) {
            $announcement->regions()->attach($request->region_ids);
        }

        return $this->success(new AnnouncementResource($announcement), 'Announcement created successfully', 201);
    }

    public function update(UpdateAnnouncementRequest $request, Announcement $announcement): JsonResponse
    {
        $this->authorize('update', $announcement);
        $announcement->update($request->validated());

        if ($request->has('region_ids')) {
            $announcement->regions()->sync($request->region_ids);
        }

        return $this->success(new AnnouncementResource($announcement), 'Announcement updated successfully');
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        $this->authorize('delete', $announcement);
        $announcement->delete();
        return $this->noContent();
    }
}


