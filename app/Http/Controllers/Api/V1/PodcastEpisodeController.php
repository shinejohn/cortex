<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StorePodcastEpisodeRequest;
use App\Http\Requests\Api\V1\UpdatePodcastEpisodeRequest;
use App\Http\Resources\Api\V1\PodcastEpisodeResource;
use App\Models\PodcastEpisode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class PodcastEpisodeController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = PodcastEpisode::query()->with(['podcast']);

        if ($request->has('podcast_id')) {
            $query->where('podcast_id', $request->podcast_id);
        }

        $episodes = $query->orderBy('published_at', 'desc')->paginate($request->get('per_page', 20));

        return $this->paginated($episodes);
    }

    public function show(PodcastEpisode $podcastEpisode): JsonResponse
    {
        return $this->success(new PodcastEpisodeResource($podcastEpisode->load('podcast')));
    }

    public function store(StorePodcastEpisodeRequest $request): JsonResponse
    {
        $episode = PodcastEpisode::create($request->validated());
        return $this->success(new PodcastEpisodeResource($episode), 'Episode created successfully', 201);
    }

    public function update(UpdatePodcastEpisodeRequest $request, PodcastEpisode $podcastEpisode): JsonResponse
    {
        $this->authorize('update', $podcastEpisode);
        $podcastEpisode->update($request->validated());
        return $this->success(new PodcastEpisodeResource($podcastEpisode), 'Episode updated successfully');
    }

    public function destroy(PodcastEpisode $podcastEpisode): JsonResponse
    {
        $this->authorize('delete', $podcastEpisode);
        $podcastEpisode->delete();
        return $this->noContent();
    }

    public function play(Request $request, PodcastEpisode $podcastEpisode): JsonResponse
    {
        $podcastEpisode->increment('listens_count');
        return $this->success(null, 'Play recorded');
    }
}


