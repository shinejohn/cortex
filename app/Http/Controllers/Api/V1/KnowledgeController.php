<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DayNewsPost;
use App\Models\Event;
use App\Models\Business;
use App\Models\Venue;
use App\Models\Performer;
use App\Models\Region;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

/**
 * Knowledge Graph API Controller
 * 
 * Provides structured knowledge data for AI training and real-time AI assistants.
 * Automatically filters content based on the current domain/app.
 */
final class KnowledgeController extends Controller
{
    /**
     * Get comprehensive community knowledge
     * 
     * @return JsonResponse
     */
    public function community(): JsonResponse
    {
        $cacheKey = 'knowledge:community:' . request()->getHost();
        
        $data = Cache::remember($cacheKey, 3600, function () {
            return [
                'community' => [
                    'name' => $this->getCommunityName(),
                    'platform' => $this->getPlatformName(),
                    'url' => request()->getSchemeAndHttpHost(),
                    'updated_at' => now()->toIso8601String(),
                ],
                'statistics' => $this->getStatistics(),
                'regions' => $this->getRegions(),
                'content_types' => $this->getContentTypes(),
            ];
        });

        return response()->json($data);
    }

    /**
     * Get all articles/posts
     * 
     * @return JsonResponse
     */
    public function articles(): JsonResponse
    {
        $cacheKey = 'knowledge:articles:' . request()->getHost();
        
        $data = Cache::remember($cacheKey, 1800, function () {
            $articles = DayNewsPost::published()
                ->with(['author', 'region', 'tags'])
                ->orderBy('published_at', 'desc')
                ->limit(1000)
                ->get()
                ->map(function ($post) {
                    return [
                        '@type' => 'NewsArticle',
                        'id' => $post->id,
                        'headline' => $post->title,
                        'articleBody' => $post->content,
                        'description' => $post->excerpt,
                        'url' => url("/posts/{$post->slug}"),
                        'datePublished' => $post->published_at?->toIso8601String(),
                        'dateModified' => $post->updated_at->toIso8601String(),
                        'author' => $post->author ? [
                            '@type' => 'Person',
                            'name' => $post->author->name,
                        ] : null,
                        'articleSection' => $post->region?->name,
                        'keywords' => $post->tags->pluck('name')->toArray(),
                        'image' => $post->featured_image,
                    ];
                });

            return [
                '@context' => 'https://schema.org',
                '@type' => 'ItemList',
                'numberOfItems' => $articles->count(),
                'itemListElement' => $articles->values(),
            ];
        });

        return response()->json($data);
    }

    /**
     * Get all events
     * 
     * @return JsonResponse
     */
    public function events(): JsonResponse
    {
        $cacheKey = 'knowledge:events:' . request()->getHost();
        
        $data = Cache::remember($cacheKey, 1800, function () {
            $events = Event::with(['venue', 'performer'])
                ->where('event_date', '>=', now()->subMonths(3))
                ->orderBy('event_date', 'desc')
                ->limit(1000)
                ->get()
                ->map(function ($event) {
                    return [
                        '@type' => 'Event',
                        'id' => $event->id,
                        'name' => $event->title,
                        'description' => $event->description,
                        'url' => url("/events/{$event->id}"),
                        'startDate' => $event->event_date,
                        'endDate' => $event->end_date ?? $event->event_date,
                        'location' => $event->venue ? [
                            '@type' => 'Place',
                            'name' => $event->venue->name,
                            'address' => $event->venue->address,
                        ] : null,
                        'performer' => $event->performer ? [
                            '@type' => 'Person',
                            'name' => $event->performer->name,
                        ] : null,
                        'image' => $event->image,
                        'eventStatus' => 'EventScheduled',
                    ];
                });

            return [
                '@context' => 'https://schema.org',
                '@type' => 'ItemList',
                'numberOfItems' => $events->count(),
                'itemListElement' => $events->values(),
            ];
        });

        return response()->json($data);
    }

    /**
     * Get all businesses
     * 
     * @return JsonResponse
     */
    public function businesses(): JsonResponse
    {
        $cacheKey = 'knowledge:businesses:' . request()->getHost();
        
        $data = Cache::remember($cacheKey, 3600, function () {
            $businesses = Business::with(['reviews'])
                ->where('status', 'active')
                ->limit(1000)
                ->get()
                ->map(function ($business) {
                    return [
                        '@type' => 'LocalBusiness',
                        'id' => $business->id,
                        'name' => $business->name,
                        'description' => $business->description,
                        'url' => url("/businesses/{$business->slug}"),
                        'address' => [
                            '@type' => 'PostalAddress',
                            'streetAddress' => $business->address,
                            'addressLocality' => $business->city,
                            'addressRegion' => $business->state,
                            'postalCode' => $business->zip,
                        ],
                        'geo' => $business->latitude && $business->longitude ? [
                            '@type' => 'GeoCoordinates',
                            'latitude' => $business->latitude,
                            'longitude' => $business->longitude,
                        ] : null,
                        'telephone' => $business->phone,
                        'image' => $business->logo,
                        'aggregateRating' => $business->reviews_count > 0 ? [
                            '@type' => 'AggregateRating',
                            'ratingValue' => $business->average_rating,
                            'reviewCount' => $business->reviews_count,
                        ] : null,
                    ];
                });

            return [
                '@context' => 'https://schema.org',
                '@type' => 'ItemList',
                'numberOfItems' => $businesses->count(),
                'itemListElement' => $businesses->values(),
            ];
        });

        return response()->json($data);
    }

    /**
     * Get all venues
     * 
     * @return JsonResponse
     */
    public function venues(): JsonResponse
    {
        $cacheKey = 'knowledge:venues:' . request()->getHost();
        
        $data = Cache::remember($cacheKey, 3600, function () {
            $venues = Venue::limit(1000)
                ->get()
                ->map(function ($venue) {
                    return [
                        '@type' => 'Place',
                        'id' => $venue->id,
                        'name' => $venue->name,
                        'description' => $venue->description,
                        'url' => url("/venues/{$venue->id}"),
                        'address' => [
                            '@type' => 'PostalAddress',
                            'streetAddress' => $venue->address,
                        ],
                        'geo' => $venue->latitude && $venue->longitude ? [
                            '@type' => 'GeoCoordinates',
                            'latitude' => $venue->latitude,
                            'longitude' => $venue->longitude,
                        ] : null,
                        'maximumAttendeeCapacity' => $venue->capacity,
                        'image' => $venue->image,
                    ];
                });

            return [
                '@context' => 'https://schema.org',
                '@type' => 'ItemList',
                'numberOfItems' => $venues->count(),
                'itemListElement' => $venues->values(),
            ];
        });

        return response()->json($data);
    }

    /**
     * Get knowledge graph with relationships
     * 
     * @return JsonResponse
     */
    public function graph(): JsonResponse
    {
        $cacheKey = 'knowledge:graph:' . request()->getHost();
        
        $data = Cache::remember($cacheKey, 3600, function () {
            return [
                '@context' => 'https://schema.org',
                '@graph' => [
                    'community' => $this->community()->getData(true),
                    'relationships' => $this->buildRelationships(),
                ],
            ];
        });

        return response()->json($data);
    }

    /**
     * Get platform-specific name
     */
    private function getPlatformName(): string
    {
        $host = request()->getHost();
        
        if (str_contains($host, 'day.news') || str_contains($host, 'daynews')) {
            return 'Day News';
        }
        if (str_contains($host, 'goeventcity') || str_contains($host, 'eventcity')) {
            return 'Go Event City';
        }
        if (str_contains($host, 'downtownsguide') || str_contains($host, 'downtown')) {
            return 'Downtown Guide';
        }
        if (str_contains($host, 'golocalvoices') || str_contains($host, 'localvoices')) {
            return 'Go Local Voices';
        }
        if (str_contains($host, 'alphasite')) {
            return 'Alphasite';
        }
        
        return 'Fibonacco Community Platform';
    }

    /**
     * Get community name
     */
    private function getCommunityName(): string
    {
        // This would ideally come from a configuration or database
        return 'Springfield Community';
    }

    /**
     * Get platform statistics
     */
    private function getStatistics(): array
    {
        return [
            'articles' => DayNewsPost::published()->count(),
            'events' => Event::where('event_date', '>=', now()->subMonths(3))->count(),
            'businesses' => Business::where('status', 'active')->count(),
            'venues' => Venue::count(),
            'performers' => Performer::count(),
            'regions' => Region::active()->count(),
        ];
    }

    /**
     * Get regions
     */
    private function getRegions(): array
    {
        return Region::active()
            ->orderBy('type', 'desc')
            ->orderBy('name')
            ->get()
            ->map(function ($region) {
                return [
                    'id' => $region->id,
                    'name' => $region->name,
                    'slug' => $region->slug,
                    'type' => $region->type,
                ];
            })
            ->toArray();
    }

    /**
     * Get available content types
     */
    private function getContentTypes(): array
    {
        $platform = $this->getPlatformName();
        
        $types = [
            'Day News' => ['news_articles', 'community_posts', 'regions'],
            'Go Event City' => ['events', 'venues', 'performers', 'calendars'],
            'Downtown Guide' => ['businesses', 'reviews', 'coupons'],
            'Go Local Voices' => ['community_voices', 'opinions'],
            'Alphasite' => ['ai_insights', 'analytics'],
        ];
        
        return $types[$platform] ?? [];
    }

    /**
     * Build relationship graph
     */
    private function buildRelationships(): array
    {
        // Build relationships between entities
        // e.g., Events -> Venues, Events -> Performers, Businesses -> Reviews
        return [
            'events_to_venues' => Event::with('venue')->get()->map(fn($e) => [
                'event_id' => $e->id,
                'venue_id' => $e->venue_id,
            ])->filter(fn($r) => $r['venue_id'])->values()->toArray(),
            
            'events_to_performers' => Event::with('performer')->get()->map(fn($e) => [
                'event_id' => $e->id,
                'performer_id' => $e->performer_id,
            ])->filter(fn($r) => $r['performer_id'])->values()->toArray(),
        ];
    }
}
