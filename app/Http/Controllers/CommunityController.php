<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommunityThreadReplyRequest;
use App\Models\Community;
use App\Models\CommunityThread;
use App\Models\CommunityThreadReply;
use App\Models\CommunityThreadReplyLike;
use App\Models\CommunityThreadView;
use App\Models\Event;
use App\Models\Performer;
use App\Models\User;
use App\Models\Venue;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia; // Added missing import for User model
use Inertia\Response;

// Added missing import for Carbon

final class CommunityController extends Controller
{
    /**
     * Display the community index page
     */
    public function index(Request $request): Response
    {
        $communitiesQuery = Community::active()
            ->with(['threads' => fn ($q) => $q->latest()->limit(5)]);

        $communities = $communitiesQuery->withCount(['activeMembers', 'threads'])->get()->map(function ($community) {
            return [
                'id' => $community->id,
                'slug' => $community->slug,
                'name' => $community->name,
                'description' => $community->description,
                'image' => $community->image,
                'memberCount' => $community->active_members_count,
                'threadCount' => $community->threads_count,
                'categories' => $community->categories ?? [],
                'threadTypes' => $community->thread_types ?? [
                    'Discussion',
                    'Question',
                    'Announcement',
                    'Resource',
                    'Event',
                ],
                'popularTags' => $community->popular_tags ?? [],
            ];
        });
        // Get showcase data from featured communities or recent events
        $showcaseData = $this->getShowcaseData();

        return Inertia::render('community/index', [
            'communities' => $communities,
            'showcaseData' => $showcaseData,
        ]);
    }

    /**
     * Show a specific community page
     */
    public function show(Request $request, string $id): Response
    {
        $community = Community::where('id', $id)
            ->active()
            ->withCount(['activeMembers', 'threads'])
            ->firstOrFail();

        // Build the threads query
        $query = CommunityThread::where('community_id', $community->id)
            ->with(['author', 'community'])
            ->withCount(['replies', 'views']);

        // Apply filters
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('tag')) {
            $query->whereJsonContains('tags', $request->tag);
        }

        if ($request->filled('author')) {
            $query->whereHas('author', function ($q) use ($request) {
                $q->where('name', $request->author);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%")
                    ->orWhere('preview', 'like', "%{$search}%");
            });
        }

        // Apply date range filter
        if ($request->filled('date_range')) {
            $dateRange = $request->date_range;
            $cutoffDate = match ($dateRange) {
                'today' => now()->subDay(),
                'week' => now()->subWeek(),
                'month' => now()->subMonth(),
                'year' => now()->subYear(),
                default => null,
            };

            if ($cutoffDate) {
                $query->where('created_at', '>=', $cutoffDate);
            }
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'recent');
        match ($sortBy) {
            'popular' => $query->orderBy('views', 'desc'),
            'unanswered' => $query->having('replies_count', 0)->orderBy('created_at', 'desc'),
            default => $query->orderBy('is_pinned', 'desc')->orderBy('created_at', 'desc'),
        };

        $threads = $query->paginate(20)->withQueryString();

        // Transform threads data
        $threadsData = $threads->through(function ($thread) {
            return [
                'id' => $thread->id,
                'title' => $thread->title,
                'preview' => $thread->preview ?? mb_substr(strip_tags($thread->content), 0, 200).'...',
                'type' => $thread->type,
                'tags' => $thread->tags ?? [],
                'views' => $thread->views,
                'replyCount' => $thread->replies_count,
                'viewsCount' => $thread->views_count,
                'isPinned' => $thread->is_pinned,
                'isLocked' => $thread->is_locked,
                'createdAt' => $thread->created_at->toISOString(),
                'author' => [
                    'id' => $thread->author->id,
                    'name' => $thread->author->name,
                    'avatar' => $thread->author->avatar,
                    'role' => 'Community Member', // Could be enhanced with user roles
                ],
            ];
        });

        return Inertia::render('community/show', [
            'community' => [
                'id' => $community->id,
                'name' => $community->name,
                'description' => $community->description,
                'image' => $community->image,
                'memberCount' => $community->active_members_count,
                'categories' => $community->categories ?? [],
                'threadTypes' => $community->thread_types ?? [
                    'Discussion',
                    'Question',
                    'Announcement',
                    'Resource',
                    'Event',
                ],
                'popularTags' => $community->popular_tags ?? [],
            ],
            'threads' => $threadsData,
            'filters' => $request->only(['type', 'tag', 'author', 'search', 'date_range']),
            'sort' => ['sort_by' => $sortBy],
        ]);
    }

    /**
     * Create a new community thread
     */
    public function createThread(Request $request, string $id): Response
    {
        $this->authorize('create', CommunityThread::class);

        $community = Community::where('id', $id)->active()->firstOrFail();

        return Inertia::render('community/create-thread', [
            'community' => [
                'id' => $community->id,
                'name' => $community->name,
                'threadTypes' => $community->thread_types ?? [
                    'Discussion',
                    'Question',
                    'Announcement',
                    'Resource',
                    'Event',
                ],
                'popularTags' => $community->popular_tags ?? [],
            ],
        ]);
    }

    /**
     * Store a new community thread
     */
    public function storeThread(Request $request, string $id)
    {
        $this->authorize('create', CommunityThread::class);

        $community = Community::where('id', $id)->active()->firstOrFail();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|string|in:Discussion,Question,Announcement,Resource,Event',
            'tags' => 'array|max:10',
            'tags.*' => 'string|max:50',
        ]);

        $thread = CommunityThread::create([
            ...$validated,
            'preview' => mb_substr(strip_tags($validated['content']), 0, 200).'...',
            'community_id' => $community->id,
            'author_id' => $request->user()->id,
        ]);

        return redirect()->route('community.show', $community->id)
            ->with('success', 'Thread created successfully!');
    }

    /**
     * Show a specific thread
     */
    public function showThread(Request $request, string $id, string $threadId): Response
    {
        $community = Community::where('id', $id)->active()->firstOrFail();
        $thread = CommunityThread::where('id', $threadId)
            ->where('community_id', $community->id)
            ->with(['author', 'community'])
            ->withCount(['views', 'replies'])
            ->firstOrFail();

        // Record a view for the thread
        $this->recordThreadView($thread, $request);

        // Get replies with nested structure (parent replies with their children)
        $replies = $thread->replies()
            ->with(['author', 'replies.author'])
            ->withCount('likes') // Eager load likes count for replies
            ->whereNull('reply_to_id') // Only get top-level replies
            ->orderBy('created_at', 'asc')
            ->get();

        // Transform replies to frontend format
        $repliesData = $replies->map(function ($reply) use ($request) {
            return $this->transformReplyToFrontend($reply, $request->user());
        });

        return Inertia::render('community/thread', [
            'community' => [
                'id' => $community->id,
                'name' => $community->name,
            ],
            'thread' => [
                'id' => $thread->id,
                'title' => $thread->title,
                'content' => $thread->content,
                'type' => $thread->type,
                'tags' => $thread->tags ?? [],
                'viewsCount' => $thread->views_count,
                'replyCount' => $thread->replies_count,
                'isPinned' => $thread->is_pinned,
                'isLocked' => $thread->is_locked,
                'createdAt' => $thread->created_at->toISOString(),
                'author' => [
                    'id' => $thread->author->id,
                    'name' => $thread->author->name,
                    'avatar' => $thread->author->avatar,
                    'role' => 'Community Member',
                ],
            ],
            'replies' => $repliesData,
        ]);
    }

    /**
     * Store a new reply to a thread
     */
    public function storeReply(StoreCommunityThreadReplyRequest $request, string $threadId): RedirectResponse
    {
        $thread = CommunityThread::with('community')->findOrFail($threadId);

        // Check if thread is locked
        if ($thread->is_locked) {
            return back()->with('error', 'This thread is locked and cannot accept new replies.');
        }

        CommunityThreadReply::create([
            'thread_id' => $thread->id,
            'user_id' => auth()->id(),
            'content' => $request->validated()['content'],
            'reply_to_id' => $request->validated()['reply_to_id'] ?? null,
        ]);

        return back()->with('success', 'Reply posted successfully!');
    }

    /**
     * Update an existing reply
     */
    public function updateReply(StoreCommunityThreadReplyRequest $request, string $replyId): RedirectResponse
    {
        $reply = CommunityThreadReply::where('id', $replyId)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $reply->update([
            'content' => $request->validated()['content'],
            'is_edited' => true,
            'edited_at' => now(),
        ]);

        return back()->with('success', 'Reply updated successfully!');
    }

    /**
     * Delete a reply
     */
    public function destroyReply(string $replyId): RedirectResponse
    {
        $reply = CommunityThreadReply::where('id', $replyId)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $reply->delete();

        return back()->with('success', 'Reply deleted successfully!');
    }

    /**
     * Like/unlike a reply
     */
    public function likeReply(string $replyId): RedirectResponse
    {
        $reply = CommunityThreadReply::findOrFail($replyId);
        $user = auth()->user();

        if (! $user) {
            return back()->with('error', 'You must be logged in to like a reply.');
        }

        // Toggle like: if user already liked, unlike; otherwise, like
        $like = CommunityThreadReplyLike::where('reply_id', $reply->id)
            ->where('user_id', $user->id)
            ->first();

        if ($like) {
            $like->delete();
            $message = 'Reply unliked!';
        } else {
            CommunityThreadReplyLike::create([
                'reply_id' => $reply->id,
                'user_id' => $user->id,
            ]);
            $message = 'Reply liked!';
        }

        return back()->with('success', $message);
    }

    /**
     * Get showcase data for the community index page
     */
    private function getShowcaseData(): array
    {
        // Get recent events with images for showcase
        $events = Event::published()
            ->upcoming()
            ->whereNotNull('image')
            ->with(['venue', 'performer'])
            ->take(3)
            ->get();

        // Get overall stats for the showcase
        $totalEvents = Event::published()->upcoming()->count();
        $totalVenues = Venue::count();
        $totalPerformers = Performer::count();

        $showcaseItems = [];

        foreach ($events as $index => $event) {
            $showcaseItems[] = [
                'id' => $index + 1,
                'image' => $event->image,
                'title' => $event->title,
                'eventUrl' => "/events/{$event->id}",
                'stats' => [
                    'events' => $totalEvents,
                    'venues' => $totalVenues,
                    'performers' => $totalPerformers,
                ],
            ];
        }

        // If no events, provide default showcase
        if (empty($showcaseItems)) {
            $showcaseItems = [
                [
                    'id' => 1,
                    'image' => 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
                    'title' => 'Community Events',
                    'eventUrl' => '/events',
                    'stats' => [
                        'events' => $totalEvents,
                        'venues' => $totalVenues,
                        'performers' => $totalPerformers,
                    ],
                ],
            ];
        }

        return $showcaseItems;
    }

    /**
     * Transform a reply model to frontend format
     */
    private function transformReplyToFrontend(CommunityThreadReply $reply, ?User $user = null): array
    {
        return [
            'id' => $reply->id,
            'content' => $reply->content,
            'images' => $reply->images ?? [],
            'likesCount' => $reply->likes_count, // Use the computed attribute
            'isLiked' => $user ? $reply->likes()->where('user_id', $user->id)->exists() : false,
            'isSolution' => $reply->is_solution,
            'isPinned' => $reply->is_pinned,
            'isEdited' => $reply->is_edited,
            'editedAt' => $reply->edited_at?->toISOString(),
            'createdAt' => $reply->created_at->toISOString(),
            'author' => [
                'id' => $reply->author->id,
                'name' => $reply->author->name,
                'avatar' => $reply->author->avatar ?? 'https://api.dicebear.com/9.x/glass/svg?seed='.$reply->author->id,
                'role' => 'Community Member',
            ],
            'replyToId' => $reply->reply_to_id,
            'replies' => $reply->replies->map(function ($childReply) use ($user) {
                return $this->transformReplyToFrontend($childReply, $user);
            })->toArray(),
        ];
    }

    /**
     * Record a view for a given thread.
     */
    private function recordThreadView(CommunityThread $thread, Request $request): void
    {
        $userId = $request->user()?->id;
        $sessionId = session()->getId();

        // Check if a view already exists for this user/session within a reasonable timeframe (e.g., last hour)
        $existingView = CommunityThreadView::where('thread_id', $thread->id)
            ->when($userId, fn ($query) => $query->where('user_id', $userId))
            ->when(! $userId, fn ($query) => $query->where('session_id', $sessionId))
            ->where('created_at', '>=', Carbon::now()->subHour())
            ->first();

        if (! $existingView) {
            CommunityThreadView::create([
                'thread_id' => $thread->id,
                'user_id' => $userId,
                'session_id' => $sessionId,
                'viewed_at' => Carbon::now(),
            ]);
        }
    }
}
