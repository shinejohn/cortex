<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Performer;
use App\Models\Venue;
use Illuminate\Http\Request;
use Inertia\Inertia;

final class HomePageController extends Controller
{
    public function index(Request $request)
    {
        // Get featured events from the database
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

        // Get featured venues from the database
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

        // Get featured performers from the database
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

        // Get upcoming events from the database (next 7 days)
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

        return Inertia::render('event-city/welcome', [
            'featuredEvents' => $featuredEvents,
            'featuredVenues' => $featuredVenues,
            'featuredPerformers' => $featuredPerformers,
            'upcomingEvents' => $upcomingEvents,
        ]);
    }
}
