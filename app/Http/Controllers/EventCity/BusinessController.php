<?php

declare(strict_types=1);

namespace App\Http\Controllers\EventCity;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Event;
use App\Services\BusinessService;
use App\Services\EventService;
use App\Services\OrganizationService;
use App\Services\ReviewService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class BusinessController extends Controller
{
    public function __construct(
        private readonly BusinessService $businessService,
        private readonly EventService $eventService,
        private readonly ReviewService $reviewService,
        private readonly OrganizationService $organizationService
    ) {}

    /**
     * Display business directory for GoEventCity
     * Unique positioning: "Event Venues & Performer Directory"
     */
    public function index(Request $request): Response
    {
        // Use shared BusinessService with EventCity-specific filters
        $filters = [
            'category' => $request->input('category'),
            'status' => 'active',
            'is_verified' => $request->boolean('verified_only') ? true : null,
            'sort_by' => $request->get('sort', 'name'),
            'sort_order' => $request->get('direction', 'asc'),
        ];

        $businesses = $this->businessService->search(
            $request->input('search'),
            $filters,
            20,
            (int) $request->input('page', 1)
        );

        // Get featured businesses with upcoming events
        $featuredBusinesses = $this->businessService->getFeatured(6);
        $featuredWithEvents = $featuredBusinesses->map(function ($business) {
            $upcomingEvents = Event::published()
                ->upcoming()
                ->where('venue_id', $business->id)
                ->orWhereHas('organizationRelationships', function ($q) use ($business) {
                    $q->where('organization_id', $business->id)
                      ->where('relatable_type', Event::class);
                })
                ->orderBy('event_date', 'asc')
                ->limit(5)
                ->get();

            return [
                'business' => $business,
                'upcoming_events_count' => $upcomingEvents->count(),
                'next_event' => $upcomingEvents->first(),
            ];
        });

        return Inertia::render('event-city/businesses/index', [
            'businesses' => $businesses,
            'featuredBusinesses' => $featuredWithEvents,
            'filters' => $request->only(['search', 'category', 'verified_only']),
            'sort' => [
                'sort' => $filters['sort_by'] ?? 'name',
                'direction' => $filters['sort_order'] ?? 'asc',
            ],
            'platform' => 'eventcity', // For theme differentiation
        ]);
    }

    /**
     * Display a single business with EventCity-specific context
     */
    public function show(Request $request, Business $business): Response
    {
        $business = $this->businessService->find($business->id);
        
        if (!$business) {
            abort(404);
        }

        // Get upcoming events at this venue/business
        $upcomingEvents = $this->eventService->getByVenue($business, 10);
        
        // Get events related via organization relationships
        $organizationEvents = Event::published()
            ->upcoming()
            ->whereHas('organizationRelationships', function ($q) use ($business) {
                $q->where('organization_id', $business->id)
                  ->where('relatable_type', Event::class);
            })
            ->with(['venue', 'performer', 'regions'])
            ->orderBy('event_date', 'asc')
            ->limit(10)
            ->get();

        // Get reviews
        $reviews = $this->reviewService->getForModel($business, ['status' => 'approved'], 10);
        $averageRating = $this->reviewService->getAverageRating($business);

        // Get organization relationships
        $organizationContent = $this->organizationService->getOrganizationContent($business, [
            'App\Models\Event',
            'App\Models\DayNewsPost',
        ]);

        // Get related businesses (similar category, nearby)
        $relatedBusinesses = $this->businessService->getByCategory(
            $business->categories[0] ?? 'venue',
            6
        )->filter(fn ($b) => $b->id !== $business->id);

        return Inertia::render('event-city/businesses/show', [
            'business' => $business,
            'upcomingEvents' => $upcomingEvents->merge($organizationEvents),
            'reviews' => $reviews,
            'averageRating' => $averageRating,
            'organizationContent' => $organizationContent,
            'relatedBusinesses' => $relatedBusinesses,
            'platform' => 'eventcity', // For theme differentiation
        ]);
    }
}

