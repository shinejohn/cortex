<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StorePodcastRequest;
use App\Http\Requests\Api\V1\UpdatePodcastRequest;
use App\Http\Resources\Api\V1\PodcastResource;
use App\Models\Podcast;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class PodcastController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Podcast::query()->with(['creator']);

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', 'published');
        }

        $podcasts = $query->orderBy('published_at', 'desc')->paginate($request->get('per_page', 20));

        return $this->paginated($podcasts);
    }

    public function show(Podcast $podcast): JsonResponse
    {
        return $this->success(new PodcastResource($podcast->load(['creator', 'episodes', 'regions'])));
    }

    public function store(StorePodcastRequest $request): JsonResponse
    {
        $podcast = Podcast::create($request->validated());

        if ($request->has('region_ids')) {
            $podcast->regions()->attach($request->region_ids);
        }

        return $this->success(new PodcastResource($podcast), 'Podcast created successfully', 201);
    }

    public function update(UpdatePodcastRequest $request, Podcast $podcast): JsonResponse
    {
        $this->authorize('update', $podcast);
        $podcast->update($request->validated());
        return $this->success(new PodcastResource($podcast), 'Podcast updated successfully');
    }

    public function episodes(Request $request, Podcast $podcast): JsonResponse
    {
        $episodes = $podcast->episodes()->orderBy('published_at', 'desc')->paginate($request->get('per_page', 20));
        return $this->paginated($episodes);
    }
}


