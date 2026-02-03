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
        // #region agent log
        \Illuminate\Support\Facades\Log::info('HomePageController hit', ['host' => $request->getHost(), 'path' => $request->path(), 'route' => $request->route()?->getName(), 'appDomain' => config('app.current_domain')]);
        $debugLogPath = base_path('.cursor/debug.log');
        if (is_dir(dirname($debugLogPath))) {
            @file_put_contents($debugLogPath, json_encode(['location'=>'app/Http/Controllers/HomePageController.php:25','message'=>'HomePageController index called','data'=>['host'=>$request->getHost(),'path'=>$request->path(),'routeName'=>$request->route()?->getName(),'appDomain'=>config('app.current_domain')],'timestamp'=>time()*1000,'sessionId'=>'debug-session','runId'=>'run2','hypothesisId'=>'A'])."\n", FILE_APPEND);
        }
        // #endregion
        // Get featured events from the database (defensive check for missing table)
        $featuredEvents = [];
        try {
            // Double-check table exists and query it safely
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
                } catch (\Illuminate\Database\QueryException $e) {
                    // Table might not exist despite Schema::hasTable() returning true
                    // This can happen if migrations haven't been run
                    \Log::warning('Events table query failed: '.$e->getMessage());
                    $featuredEvents = [];
                }
            }
        } catch (\Illuminate\Database\QueryException $e) {
            // If table doesn't exist or query fails, return empty array
            \Log::warning('Events table check failed: '.$e->getMessage());
            $featuredEvents = [];
        } catch (\Exception $e) {
            // Catch any other exceptions
            \Log::warning('Unexpected error in HomePageController: '.$e->getMessage());
            $featuredEvents = [];
        }

        // Get featured venues from the database (defensive check for missing table)
        $featuredVenues = [];
        try {
            if (Schema::hasTable('venues')) {
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
            }
        } catch (\Illuminate\Database\QueryException $e) {
            // If table doesn't exist or query fails, return empty array
            $featuredVenues = [];
        } catch (\Exception $e) {
            // Catch any other exceptions
            $featuredVenues = [];
        }

        // Get featured performers from the database (defensive check for missing table)
        $featuredPerformers = [];
        try {
            if (Schema::hasTable('performers')) {
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
            }
        } catch (\Illuminate\Database\QueryException $e) {
            // If table doesn't exist or query fails, return empty array
            $featuredPerformers = [];
        } catch (\Exception $e) {
            // Catch any other exceptions
            $featuredPerformers = [];
        }

        // Get upcoming events from the database (next 7 days) (defensive check for missing table)
        $upcomingEvents = [];
        try {
            if (Schema::hasTable('events')) {
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
            }
        } catch (\Illuminate\Database\QueryException $e) {
            // If table doesn't exist or query fails, return empty array
            $upcomingEvents = [];
        } catch (\Exception $e) {
            // Catch any other exceptions
            $upcomingEvents = [];
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
