<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Performer;
use App\Models\Region;
use App\Models\Venue;
use App\Services\AdvertisementService;
use App\Services\LocationService;
use App\Services\SeoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

final class HomePageController extends Controller
{
    public function __construct(
        private readonly AdvertisementService $advertisementService,
        private readonly LocationService $locationService
    ) {}

    public function index(Request $request)
    {
        // Get featured events from the database (defensive check for missing table)
        $featuredEvents = [];
        if (Schema::hasTable('events')) {
            try {
                $featuredEvents = Event::published()
                    ->upcoming()
                    ->with(['venue', 'performer'])
                    ->take(4)
                    ->get()
                    ->map(function ($event) {
                        return [
                            'id' => $event->id,
                            'title' => $event->title,
                            'date' => $event->event_date->format('F j, Y'),
                            'venue' => $event->venue?->name ?? 'TBA',
                            'price' => $event->is_free ? 'Free' : '$'.number_format((float) ($event->price_min ?? 0)),
                            'category' => $event->category,
                            'image' => $event->image,
                        ];
                    })
                    ->toArray();
            } catch (\Exception $e) {
                // If query fails (e.g., table doesn't exist), return empty array
                $featuredEvents = [];
            }
        }

        // Get featured venues from the database (defensive check for missing table)
        $featuredVenues = [];
        if (Schema::hasTable('venues')) {
            try {
                $featuredVenues = Venue::active()
                    ->orderBy('average_rating', 'desc')
                    ->take(4)
                    ->get()
                    ->map(function ($venue) {
                        return [
                            'id' => $venue->id,
                            'name' => $venue->name,
                            'location' => $venue->address,
                            'capacity' => number_format($venue->capacity),
                            'venueType' => $venue->venue_type,
                            'rating' => round((float) ($venue->average_rating ?? 0), 1),
                            'reviewCount' => (string) $venue->total_reviews,
                            'image' => is_array($venue->images) && count($venue->images) > 0
                                ? $venue->images[0]
                                : 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
                        ];
                    })
                    ->toArray();
            } catch (\Exception $e) {
                // If query fails (e.g., table doesn't exist), return empty array
                $featuredVenues = [];
            }
        }

        // Get featured performers from the database (defensive check for missing table)
        $featuredPerformers = [];
        if (Schema::hasTable('performers')) {
            try {
                $featuredPerformers = Performer::active()
                    ->verified()
                    ->with('upcomingShows')
                    ->orderBy('average_rating', 'desc')
                    ->take(4)
                    ->get()
                    ->map(function ($performer) {
                        $upcomingShow = $performer->upcomingShows->first();

                        return [
                            'id' => $performer->id,
                            'name' => $performer->name,
                            'homeCity' => $performer->home_city,
                            'genres' => is_array($performer->genres) ? $performer->genres : [$performer->genres],
                            'rating' => round((float) ($performer->average_rating ?? 0), 1),
                            'reviewCount' => (string) $performer->total_reviews,
                            'image' => $performer->profile_image ?? 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
                            'upcomingShow' => $upcomingShow ? [
                                'date' => $upcomingShow->date->format('F j, Y'),
                                'venue' => $upcomingShow->venue,
                            ] : null,
                        ];
                    })
                    ->toArray();
            } catch (\Exception $e) {
                // If query fails (e.g., table doesn't exist), return empty array
                $featuredPerformers = [];
            }
        }

        // Get upcoming events from the database (next 7 days) (defensive check for missing table)
        $upcomingEvents = [];
        if (Schema::hasTable('events')) {
            try {
                $upcomingEvents = Event::published()
                    ->upcoming()
                    ->with(['venue', 'performer'])
                    ->whereBetween('event_date', [now(), now()->addDays(7)])
                    ->orderBy('event_date')
                    ->orderBy('time')
                    ->get()
                    ->map(function ($event) {
                        $eventDateTime = $event->event_date->copy();
                        if ($event->time) {
                            $timeParts = explode(':', $event->time);
                            $eventDateTime->setTime((int) $timeParts[0], (int) $timeParts[1]);
                        }

                        return [
                            'id' => $event->id,
                            'title' => $event->title,
                            'date' => $eventDateTime->format('Y-m-d\TH:i:s.000\Z'),
                            'venue' => $event->venue?->name ?? 'TBA',
                            'price' => $event->is_free ? 'Free' : '$'.number_format((float) ($event->price_min ?? 0)),
                            'category' => $event->category,
                            'image' => $event->image ?? 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop',
                        ];
                    })
                    ->toArray();
            } catch (\Exception $e) {
                // If query fails (e.g., table doesn't exist), return empty array
                $upcomingEvents = [];
            }
        }

        // Get current region for ad targeting
        $region = $request->attributes->get('detected_region');

        // Get advertisements for different placements
        $bannerAds = $this->advertisementService->getActiveAds('event_city', $region, 'banner')->take(1);
        $featuredAds = $this->advertisementService->getActiveAds('event_city', $region, 'featured')->take(1);
        $sidebarAds = $this->advertisementService->getActiveAds('event_city', $region, 'sidebar')->take(3);

        // Build SEO JSON-LD for homepage
        $seoData = [
            'title' => 'Home',
            'description' => 'Discover local events, venues, and performers. Find concerts, shows, and entertainment near you.',
            'url' => '/',
        ];

        return Inertia::render('event-city/welcome', [
            'seo' => [
                'jsonLd' => SeoService::buildJsonLd('website', $seoData, 'event-city'),
            ],
            'featuredEvents' => $featuredEvents,
            'featuredVenues' => $featuredVenues,
            'featuredPerformers' => $featuredPerformers,
            'upcomingEvents' => $upcomingEvents,
            'advertisements' => [
                'banner' => $bannerAds->map(fn ($ad) => [
                    'id' => $ad->id,
                    'placement' => $ad->placement,
                    'advertable' => [
                        'id' => $ad->advertable->id,
                        'title' => $ad->advertable->title,
                        'excerpt' => $ad->advertable->excerpt ?? null,
                        'featured_image' => $ad->advertable->featured_image ?? $ad->advertable->image ?? null,
                        'slug' => $ad->advertable->slug ?? null,
                    ],
                    'expires_at' => $ad->expires_at->toISOString(),
                ]),
                'featured' => $featuredAds->map(fn ($ad) => [
                    'id' => $ad->id,
                    'placement' => $ad->placement,
                    'advertable' => [
                        'id' => $ad->advertable->id,
                        'title' => $ad->advertable->title,
                        'excerpt' => $ad->advertable->excerpt ?? null,
                        'featured_image' => $ad->advertable->featured_image ?? $ad->advertable->image ?? null,
                        'slug' => $ad->advertable->slug ?? null,
                    ],
                    'expires_at' => $ad->expires_at->toISOString(),
                ]),
                'sidebar' => $sidebarAds->map(fn ($ad) => [
                    'id' => $ad->id,
                    'placement' => $ad->placement,
                    'advertable' => [
                        'id' => $ad->advertable->id,
                        'title' => $ad->advertable->title,
                        'excerpt' => $ad->advertable->excerpt ?? null,
                        'featured_image' => $ad->advertable->featured_image ?? $ad->advertable->image ?? null,
                        'slug' => $ad->advertable->slug ?? null,
                    ],
                    'expires_at' => $ad->expires_at->toISOString(),
                ]),
            ],
        ]);
    }
}
