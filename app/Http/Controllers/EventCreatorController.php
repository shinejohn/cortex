<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Region;
use App\Services\Creator\AiCreatorAssistantService;
use App\Services\Creator\ContentModeratorService;
use App\Services\News\VenueMatchingService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class EventCreatorController extends Controller
{
    public function __construct(
        private readonly AiCreatorAssistantService $assistant,
        private readonly ContentModeratorService $moderator,
        private readonly VenueMatchingService $venueMatching,
    ) {}

    /**
     * GET /events/create
     */
    public function create(Request $request): Response
    {
        $user = auth()->user();
        $regions = Region::orderBy('name')->get(['id', 'name', 'type', 'metadata']);
        $eventCategories = [
            'music', 'sports', 'arts', 'food', 'community', 'business',
            'education', 'health', 'government', 'holiday', 'other',
        ];

        return Inertia::render('Events/Create', [
            'regions' => $regions,
            'eventCategories' => $eventCategories,
            'defaultRegionId' => $user->default_region_id ?? null,
            'contentType' => 'event',
        ]);
    }

    /**
     * POST /events
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:500',
            'description' => 'required|string|max:10000',
            'event_date' => 'required|date',
            'event_time' => 'sometimes|string',
            'end_date' => 'sometimes|date|nullable',
            'end_time' => 'sometimes|string|nullable',
            'venue_id' => 'sometimes|uuid|nullable',
            'venue_name' => 'sometimes|string|max:500|nullable',
            'venue_address' => 'sometimes|string|max:1000|nullable',
            'category' => 'required|string',
            'subcategories' => 'sometimes|array',
            'region_id' => 'required|uuid|exists:regions,id',
            'is_free' => 'sometimes|boolean',
            'price_min' => 'sometimes|numeric|nullable',
            'price_max' => 'sometimes|numeric|nullable',
            'badges' => 'sometimes|array',
            'tags' => 'sometimes|array',
            'performer_id' => 'sometimes|uuid|nullable',
            'featured_image_url' => 'sometimes|url|nullable',
            'ticket_url' => 'sometimes|url|nullable',
            'contact_info' => 'sometimes|string|nullable',
            'session_id' => 'sometimes|uuid',
        ]);

        $eventDate = Carbon::parse($validated['event_date']);
        $venueId = $validated['venue_id'] ?? null;

        if (empty($venueId) && ! empty($validated['venue_name'])) {
            $venue = $this->venueMatching->matchOrCreate(
                $validated['venue_name'],
                $validated['venue_address'] ?? null,
                Region::find($validated['region_id'])?->name
            );
            $venueId = $venue?->id;
        }

        $event = Event::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'event_date' => $eventDate,
            'time' => $validated['event_time'] ?? $eventDate->format('g:i A'),
            'category' => $validated['category'],
            'subcategories' => $validated['subcategories'] ?? [],
            'badges' => $validated['badges'] ?? [],
            'is_free' => $validated['is_free'] ?? false,
            'price_min' => $validated['price_min'] ?? 0,
            'price_max' => $validated['price_max'] ?? 0,
            'venue_id' => $venueId,
            'performer_id' => $validated['performer_id'] ?? null,
            'source_type' => 'human_created',
            'status' => 'draft',
            'workspace_id' => auth()->user()->currentWorkspace?->id ?? null,
        ]);

        $event->regions()->attach($validated['region_id']);

        $moderationLog = $this->moderator->moderate(
            contentType: 'event',
            contentId: $event->id,
            content: $validated['title']."\n\n".$validated['description'],
            metadata: [
                'title' => $validated['title'],
                'category' => $validated['category'],
                'region_id' => $validated['region_id'],
                'user_id' => auth()->id(),
                'event_date' => $validated['event_date'],
                'venue_name' => $validated['venue_name'] ?? null,
            ],
            trigger: 'on_create'
        );

        if ($moderationLog->isApproved()) {
            $event->update(['status' => 'published']);
        }

        if (! empty($validated['session_id'])) {
            \App\Models\AiCreatorSession::where('id', $validated['session_id'])
                ->where('user_id', auth()->id())
                ->update([
                    'status' => 'submitted',
                    'published_content_id' => $event->id,
                    'published_content_type' => 'event',
                ]);
        }

        return redirect()->route('events.show', $event->id)
            ->with('success', 'Event created successfully.');
    }
}
