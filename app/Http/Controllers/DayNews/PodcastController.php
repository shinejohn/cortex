<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Models\Podcast;
use App\Models\PodcastEpisode;
use App\Models\Region;
use App\Services\AdvertisementService;
use App\Services\DayNews\PodcastService;
use App\Services\LocationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class PodcastController extends Controller
{
    public function __construct(
        private readonly PodcastService $podcastService,
        private readonly AdvertisementService $advertisementService,
        private readonly LocationService $locationService
    ) {}

    /**
     * Get the view path based on domain/route
     */
    protected function getViewPath(Request $request, string $page): string
    {
        if ($this->isStandaloneView($request)) {
            return "local-voices/{$page}";
        }
        
        return "day-news/local-voices/{$page}";
    }

    /**
     * Get view mode for frontend
     */
    protected function getViewMode(Request $request): string
    {
        return $this->isStandaloneView($request) ? 'standalone' : 'integrated';
    }

    /**
     * Check if this is standalone view (Go Local Voices)
     */
    protected function isStandaloneView(Request $request): bool
    {
        return $request->getHost() === config('domains.local-voices')
            || $request->routeIs('localvoices.*');
    }

    /**
     * Display single podcast
     */
    public function show(Request $request, Podcast $podcast): Response
    {
        $podcast->load(['creator.user', 'regions', 'episodes' => function ($q) {
            $q->published()->orderBy('published_at', 'desc');
        }]);

        // Get advertisements
        $platform = $this->isStandaloneView($request) ? 'local_voices' : 'day_news';
        $currentRegion = $request->attributes->get('detected_region') ?? $podcast->regions->first();
        $bannerAds = $this->advertisementService->getActiveAds($platform, $currentRegion, 'banner')->take(1);
        $sidebarAds = $this->advertisementService->getActiveAds($platform, $currentRegion, 'sidebar')->take(3);
        $inlineAds = $this->advertisementService->getActiveAds($platform, $currentRegion, 'inline')->take(2);

        return Inertia::render($this->getViewPath($request, 'podcast-show'), [
            'podcast' => [
                'id' => $podcast->id,
                'title' => $podcast->title,
                'slug' => $podcast->slug,
                'description' => $podcast->description,
                'cover_image' => $podcast->cover_image,
                'category' => $podcast->category,
                'episodes_count' => $podcast->episodes_count,
                'subscribers_count' => $podcast->subscribers_count,
                'total_listens' => $podcast->total_listens,
                'created_at' => $podcast->created_at->toISOString(),
                'creator' => [
                    'id' => $podcast->creator->id,
                    'display_name' => $podcast->creator->display_name,
                    'avatar' => $podcast->creator->avatar,
                    'user_id' => $podcast->creator->user_id,
                ],
                'episodes' => $podcast->episodes->map(fn ($ep) => [
                    'id' => $ep->id,
                    'title' => $ep->title,
                    'slug' => $ep->slug,
                    'description' => $ep->description,
                    'episode_number' => $ep->episode_number,
                    'duration' => $ep->duration,
                    'formatted_duration' => $ep->formatted_duration ?? '0:00',
                    'published_at' => $ep->published_at?->toISOString(),
                    'listens_count' => $ep->listens_count,
                ]),
            ],
            'viewMode' => $this->getViewMode($request),
            'advertisements' => [
                'banner' => $bannerAds->map(fn ($ad) => $this->formatAd($ad)),
                'sidebar' => $sidebarAds->map(fn ($ad) => $this->formatAd($ad)),
                'inline' => $inlineAds->map(fn ($ad) => $this->formatAd($ad)),
            ],
        ]);
    }

    /**
     * Show podcast creation form
     */
    public function create(): Response
    {
        $profile = \App\Models\CreatorProfile::where('user_id', auth()->id())
            ->approved()
            ->firstOrFail();

        return Inertia::render($this->getViewPath(request(), 'podcast-create'), [
            'profile' => [
                'id' => $profile->id,
                'display_name' => $profile->display_name,
            ],
            'viewMode' => $this->getViewMode(request()),
        ]);
    }

    /**
     * Store new podcast
     */
    public function store(\App\Http\Requests\DayNews\StorePodcastRequest $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();

        $profile = \App\Models\CreatorProfile::where('user_id', $request->user()->id)
            ->approved()
            ->firstOrFail();

        $podcast = $this->podcastService->createPodcast(
            array_merge($validated, ['cover_image' => $request->file('cover_image')]),
            $profile->id
        );

        $routeName = $this->isStandaloneView($request) 
            ? 'localvoices.podcast.show' 
            : 'daynews.local-voices.podcast.show';
            
        return redirect()
            ->route($routeName, $podcast->slug)
            ->with('success', 'Podcast created successfully!');
    }

    /**
     * Show episode upload form
     */
    public function createEpisode(Podcast $podcast): Response
    {
        $this->authorize('update', $podcast);

        return Inertia::render($this->getViewPath(request(), 'episode-create'), [
            'podcast' => $podcast,
            'viewMode' => $this->getViewMode(request()),
        ]);
    }

    /**
     * Store episode
     */
    public function storeEpisode(\App\Http\Requests\DayNews\StorePodcastEpisodeRequest $request, Podcast $podcast): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('update', $podcast);

        $validated = $request->validated();

        $episode = PodcastEpisode::create([
            'podcast_id' => $podcast->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'show_notes' => $validated['show_notes'] ?? null,
            'episode_number' => $validated['episode_number'] ?? null,
            'status' => 'draft',
        ]);

        // Upload audio file
        $this->podcastService->uploadEpisode($episode, $request->file('audio_file'));

        $routeName = $this->isStandaloneView($request) 
            ? 'localvoices.podcast.show' 
            : 'daynews.local-voices.podcast.show';
            
        return redirect()
            ->route($routeName, ['podcast' => $podcast->slug])
            ->with('success', 'Episode uploaded successfully!');
    }

    /**
     * Display single episode
     */
    public function showEpisode(Request $request, Podcast $podcast, PodcastEpisode $episode): Response
    {
        $episode->load(['podcast.creator.user']);
        $episode->incrementListensCount();

        // Get related episodes
        $related = $podcast->episodes()
            ->published()
            ->where('id', '!=', $episode->id)
            ->limit(6)
            ->get();

        return Inertia::render($this->getViewPath($request, 'episode-show'), [
            'episode' => [
                'id' => $episode->id,
                'title' => $episode->title,
                'slug' => $episode->slug,
                'description' => $episode->description,
                'show_notes' => $episode->show_notes,
                'audio_url' => $episode->audio_url,
                'formatted_duration' => $episode->formatted_duration ?? '0:00',
                'episode_number' => $episode->episode_number,
                'published_at' => $episode->published_at?->toISOString(),
                'listens_count' => $episode->listens_count,
                'downloads_count' => $episode->downloads_count,
                'likes_count' => $episode->likes_count,
                'comments_count' => $episode->comments_count,
                'podcast' => [
                    'id' => $podcast->id,
                    'title' => $podcast->title,
                    'slug' => $podcast->slug,
                    'cover_image' => $podcast->cover_image,
                    'creator' => [
                        'id' => $podcast->creator->id,
                        'display_name' => $podcast->creator->display_name,
                        'avatar' => $podcast->creator->avatar,
                    ],
                ],
            ],
            'related' => $related->map(fn ($ep) => [
                'id' => $ep->id,
                'title' => $ep->title,
                'slug' => $ep->slug,
                'formatted_duration' => $ep->formatted_duration ?? '0:00',
                'published_at' => $ep->published_at?->toISOString(),
            ]),
            'viewMode' => $this->getViewMode($request),
        ]);
    }

    /**
     * Publish episode
     */
    public function publishEpisode(Podcast $podcast, PodcastEpisode $episode): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('update', $podcast);

        $this->podcastService->publishEpisode($episode);

        $routeName = $this->isStandaloneView($request) 
            ? 'localvoices.podcast.show' 
            : 'daynews.local-voices.podcast.show';
            
        return redirect()
            ->route($routeName, $podcast->slug)
            ->with('success', 'Episode published successfully!');
    }

    /**
     * Format advertisement for frontend
     */
    private function formatAd($ad): array
    {
        return [
            'id' => $ad->id,
            'placement' => $ad->placement,
            'advertable' => [
                'id' => $ad->advertable->id,
                'title' => $ad->advertable->title ?? $ad->advertable->name ?? null,
                'excerpt' => $ad->advertable->excerpt ?? $ad->advertable->description ?? null,
                'featured_image' => $ad->advertable->featured_image ?? $ad->advertable->image ?? $ad->advertable->cover_image ?? null,
                'slug' => $ad->advertable->slug ?? null,
            ],
            'expires_at' => $ad->expires_at->toISOString(),
        ];
    }
}

