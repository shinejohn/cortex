# Backend API Controllers - Leveraging Inertia Logic

## Why Not Inertia for Mobile?

**Inertia.js is designed for web applications:**
- Returns HTML pages with embedded JSON data
- Requires a browser to render the HTML
- React Native cannot render HTML pages
- Mobile apps need pure JSON APIs

**However**, we can create API controllers that **reuse the same data transformation logic** from your existing Inertia controllers!

## Strategy: Share Logic Between Inertia & API

Instead of duplicating code, we can:
1. Extract data transformation logic into shared methods
2. Use the same logic in both Inertia controllers (web) and API controllers (mobile)
3. Return JSON from API controllers, HTML from Inertia controllers

## Example: PostController API Version

Here's how to create an API controller that leverages your existing `PublicPostController` logic:

### Option 1: Extract Shared Logic to a Service

```php
<?php
// app/Services/DayNewsPostService.php

namespace App\Services;

use App\Models\DayNewsPost;
use App\Services\AdvertisementService;
use App\Services\SeoService;

final class DayNewsPostService
{
    public function __construct(
        private readonly AdvertisementService $advertisementService,
        private readonly SeoService $seoService
    ) {}

    /**
     * Get post data formatted for both Inertia and API
     */
    public function getPostData(DayNewsPost $post, ?Region $region = null): array
    {
        // Get comments (same logic as PublicPostController)
        $comments = $post->comments()
            ->where('is_active', true)
            ->whereNull('parent_id')
            ->with(['user', 'replies.user', 'replies.likes'])
            ->withCount(['likes', 'replies'])
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'user' => [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                        'avatar' => $comment->user->profile_photo_url ?? null,
                    ],
                    'created_at' => $comment->created_at->toISOString(),
                    'time_ago' => $comment->created_at->diffForHumans(),
                    'likes_count' => $comment->likes_count,
                    'replies_count' => $comment->replies_count,
                    'is_pinned' => $comment->is_pinned,
                    'replies' => $comment->replies->map(function ($reply) {
                        return [
                            'id' => $reply->id,
                            'content' => $reply->content,
                            'user' => [
                                'id' => $reply->user->id,
                                'name' => $reply->user->name,
                                'avatar' => $reply->user->profile_photo_url ?? null,
                            ],
                            'created_at' => $reply->created_at->toISOString(),
                            'time_ago' => $reply->created_at->diffForHumans(),
                            'likes_count' => $reply->likes()->count(),
                        ];
                    }),
                ];
            });

        // Get related posts (same logic)
        $regionIds = $post->regions->pluck('id')->toArray();
        $relatedPosts = DayNewsPost::published()
            ->where('id', '!=', $post->id)
            ->where(function ($q) use ($regionIds, $post) {
                $q->whereHas('regions', function ($regionQuery) use ($regionIds) {
                    $regionQuery->whereIn('regions.id', $regionIds);
                })
                ->when($post->category, function ($categoryQuery) use ($post) {
                    $categoryQuery->orWhere('category', $post->category);
                });
            })
            ->with(['author', 'writerAgent', 'regions', 'workspace'])
            ->orderBy('published_at', 'desc')
            ->limit(5)
            ->get();

        // Format post data (same structure as Inertia)
        return [
            'post' => [
                'id' => $post->id,
                'type' => $post->type,
                'category' => $post->category,
                'title' => $post->title,
                'slug' => $post->slug,
                'content' => $post->content,
                'excerpt' => $post->excerpt,
                'featured_image' => $post->featured_image,
                'metadata' => $post->metadata,
                'view_count' => $post->view_count,
                'published_at' => $post->published_at?->toISOString(),
                'author' => $post->author ? [
                    'id' => $post->author->id,
                    'name' => $post->author->name,
                ] : null,
                'writer_agent' => $post->writerAgent ? [
                    'id' => $post->writerAgent->id,
                    'name' => $post->writerAgent->name,
                    'avatar' => $post->writerAgent->avatar_url,
                    'bio' => $post->writerAgent->bio,
                ] : null,
                'workspace' => $post->workspace ? [
                    'id' => $post->workspace->id,
                    'name' => $post->workspace->name,
                ] : null,
                'regions' => $post->regions->map(fn ($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                ]),
            ],
            'comments' => $comments,
            'commentsCount' => $post->comments()->where('is_active', true)->count(),
            'relatedPosts' => $relatedPosts->map(fn ($relatedPost) => [
                'id' => $relatedPost->id,
                'type' => $relatedPost->type,
                'category' => $relatedPost->category,
                'title' => $relatedPost->title,
                'slug' => $relatedPost->slug,
                'excerpt' => $relatedPost->excerpt,
                'featured_image' => $relatedPost->featured_image,
                'published_at' => $relatedPost->published_at?->toISOString(),
                'view_count' => $relatedPost->view_count,
                'author' => $relatedPost->author ? [
                    'id' => $relatedPost->author->id,
                    'name' => $relatedPost->author->name,
                ] : null,
                'writer_agent' => $relatedPost->writerAgent ? [
                    'id' => $relatedPost->writerAgent->id,
                    'name' => $relatedPost->writerAgent->name,
                    'avatar' => $relatedPost->writerAgent->avatar_url,
                ] : null,
                'workspace' => $relatedPost->workspace ? [
                    'id' => $relatedPost->workspace->id,
                    'name' => $relatedPost->workspace->name,
                ] : null,
                'regions' => $relatedPost->regions->map(fn ($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                ]),
            ]),
            'advertisements' => $this->getAdvertisements($post, $region),
        ];
    }

    private function getAdvertisements(DayNewsPost $post, ?Region $region): array
    {
        $region = $region ?? $post->regions->first();
        
        $bannerAds = $this->advertisementService->getActiveAds('day_news', $region, 'banner')->take(1);
        $sidebarAds = $this->advertisementService->getActiveAds('day_news', $region, 'sidebar')->take(3);
        $inlineAds = $this->advertisementService->getActiveAds('day_news', $region, 'inline')->take(3);

        return [
            'banner' => $bannerAds->map(fn ($ad) => [
                'id' => $ad->id,
                'placement' => $ad->placement,
                'advertable' => [
                    'id' => $ad->advertable->id,
                    'title' => $ad->advertable->title,
                    'excerpt' => $ad->advertable->excerpt,
                    'featured_image' => $ad->advertable->featured_image,
                    'slug' => $ad->advertable->slug,
                ],
                'expires_at' => $ad->expires_at->toISOString(),
            ]),
            'sidebar' => $sidebarAds->map(fn ($ad) => [
                'id' => $ad->id,
                'placement' => $ad->placement,
                'advertable' => [
                    'id' => $ad->advertable->id,
                    'title' => $ad->advertable->title,
                    'excerpt' => $ad->advertable->excerpt,
                    'featured_image' => $ad->advertable->featured_image,
                    'slug' => $ad->advertable->slug,
                ],
                'expires_at' => $ad->expires_at->toISOString(),
            ]),
            'inline' => $inlineAds->map(fn ($ad) => [
                'id' => $ad->id,
                'placement' => $ad->placement,
                'advertable' => [
                    'id' => $ad->advertable->id,
                    'title' => $ad->advertable->title,
                    'excerpt' => $ad->advertable->excerpt,
                    'featured_image' => $ad->advertable->featured_image,
                    'slug' => $ad->advertable->slug,
                ],
                'expires_at' => $ad->expires_at->toISOString(),
            ]),
        ];
    }
}
```

### Option 2: Create API Controller Using the Service

```php
<?php
// app/Http/Controllers/Api/DayNews/PostController.php

namespace App\Http\Controllers\Api\DayNews;

use App\Http\Controllers\Controller;
use App\Models\DayNewsPost;
use App\Models\Region;
use App\Services\DayNewsPostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class PostController extends Controller
{
    public function __construct(
        private readonly DayNewsPostService $postService
    ) {}

    /**
     * List posts with filters
     */
    public function index(Request $request): JsonResponse
    {
        $currentRegion = $request->attributes->get('detected_region');
        
        $postsQuery = DayNewsPost::published()
            ->with(['author', 'regions', 'workspace'])
            ->orderBy('published_at', 'desc');

        // Filter by category
        if ($request->has('category')) {
            $postsQuery->where('category', $request->input('category'));
        }

        // Filter by region
        if ($request->has('region')) {
            $postsQuery->whereHas('regions', function ($q) use ($request) {
                $q->where('regions.id', $request->input('region'));
            });
        } elseif ($currentRegion) {
            $postsQuery->whereHas('regions', function ($q) use ($currentRegion) {
                $q->where('regions.id', $currentRegion->id);
            });
        }

        // Search
        if ($request->has('search')) {
            $search = $request->input('search');
            $postsQuery->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->input('per_page', 20), 50);
        $posts = $postsQuery->paginate($perPage);

        return response()->json([
            'data' => $posts->map(fn ($post) => $this->formatPost($post)),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    /**
     * Get post by ID
     */
    public function show(int $id): JsonResponse
    {
        $post = DayNewsPost::where('id', $id)
            ->published()
            ->with(['author', 'writerAgent', 'regions', 'workspace', 'comments.user'])
            ->withCount(['comments' => function ($q) {
                $q->where('is_active', true);
            }])
            ->firstOrFail();

        $post->incrementViewCount();

        $region = $post->regions->first();
        $data = $this->postService->getPostData($post, $region);

        return response()->json(['data' => $data['post']]);
    }

    /**
     * Get post by slug
     */
    public function showBySlug(string $slug): JsonResponse
    {
        $post = DayNewsPost::where('slug', $slug)
            ->published()
            ->with(['author', 'writerAgent', 'regions', 'workspace', 'comments.user'])
            ->withCount(['comments' => function ($q) {
                $q->where('is_active', true);
            }])
            ->firstOrFail();

        $post->incrementViewCount();

        $region = $post->regions->first();
        $data = $this->postService->getPostData($post, $region);

        return response()->json(['data' => $data['post']]);
    }

    /**
     * Track post view
     */
    public function trackView(int $id): JsonResponse
    {
        $post = DayNewsPost::findOrFail($id);
        $post->incrementViewCount();

        return response()->json(['success' => true]);
    }

    private function formatPost(DayNewsPost $post): array
    {
        return [
            'id' => $post->id,
            'type' => $post->type,
            'category' => $post->category,
            'title' => $post->title,
            'slug' => $post->slug,
            'content' => $post->content,
            'excerpt' => $post->excerpt,
            'featured_image' => $post->featured_image,
            'published_at' => $post->published_at?->toISOString(),
            'view_count' => $post->view_count,
            'author' => $post->author ? [
                'id' => $post->author->id,
                'name' => $post->author->name,
            ] : null,
            'writer_agent' => $post->writerAgent ? [
                'id' => $post->writerAgent->id,
                'name' => $post->writerAgent->name,
                'avatar' => $post->writerAgent->avatar_url,
            ] : null,
            'regions' => $post->regions->map(fn ($r) => [
                'id' => $r->id,
                'name' => $r->name,
            ]),
        ];
    }
}
```

### Update Inertia Controller to Use Service

```php
<?php
// app/Http/Controllers/DayNews/PublicPostController.php

// ... existing code ...

public function show(string $slug): Response
{
    $post = DayNewsPost::where('slug', $slug)
        ->published()
        ->with(['author', 'writerAgent', 'regions', 'workspace', 'comments.user'])
        ->withCount(['comments' => function ($q) {
            $q->where('is_active', true);
        }])
        ->firstOrFail();

    $post->incrementViewCount();

    $region = $post->regions->first();
    $data = $this->postService->getPostData($post, $region); // Reuse service!

    // Build SEO JSON-LD
    $plainTextContent = strip_tags($post->content);
    $seoData = [
        'title' => $post->title,
        'description' => $post->excerpt,
        'image' => $post->featured_image,
        'url' => "/posts/{$post->slug}",
        'publishedAt' => $post->published_at?->toISOString(),
        'author' => $post->display_author,
        'section' => $post->category,
        'articleBody' => $plainTextContent,
    ];

    return Inertia::render('day-news/posts/show', [
        'seo' => [
            'jsonLd' => SeoService::buildJsonLd('article', $seoData, 'day-news'),
        ],
        ...$data, // Use shared data!
    ]);
}
```

## Benefits of This Approach

1. **DRY (Don't Repeat Yourself)** - Same logic for web and mobile
2. **Consistency** - Same data structure across platforms
3. **Maintainability** - Update logic in one place
4. **Type Safety** - Same data shapes = easier to maintain

## API Routes to Add

```php
// routes/api.php

Route::prefix('day-news')->group(function () {
    Route::get('/posts', [Api\DayNews\PostController::class, 'index']);
    Route::get('/posts/{id}', [Api\DayNews\PostController::class, 'show']);
    Route::get('/posts/slug/{slug}', [Api\DayNews\PostController::class, 'showBySlug']);
    Route::post('/posts/{id}/view', [Api\DayNews\PostController::class, 'trackView']);
});
```

This way, you get the best of both worlds: Inertia for web, JSON API for mobile, with shared business logic!

