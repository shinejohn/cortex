<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Services\EventService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class EventController extends Controller
{
    public function __construct(
        private readonly EventService $eventService
    ) {}

    /**
     * Display events for Day News
     */
    public function index(Request $request): Response
    {
        $currentRegion = $request->attributes->get('detected_region');

        // Use shared EventService
        $filters = [
            'region_id' => $currentRegion?->id,
            'category' => $request->input('category'),
            'date_from' => $request->filled('date') ? $request->date : null,
            'sort_by' => $request->get('sort', 'event_date'),
            'sort_order' => $request->get('direction', 'asc'),
        ];

        $events = $this->eventService->getUpcoming($filters, 12);

        return Inertia::render('day-news/events/index', [
            'events' => $events,
            'filters' => $request->only(['category', 'date', 'search']),
            'sort' => [
                'sort' => $filters['sort_by'],
                'direction' => $filters['sort_order'],
            ],
            'currentRegion' => $currentRegion,
        ]);
    }

    /**
     * Display a single event
     */
    public function show(Request $request, Event $event): Response
    {
        $event->load(['venue', 'performer', 'regions']);

        // Get related events using EventService
        $similarEvents = $this->eventService->getRelated($event, 6);

        return Inertia::render('day-news/events/show', [
            'event' => $event,
            'similarEvents' => $similarEvents,
        ]);
    }
}

