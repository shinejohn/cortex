<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Models\DayNewsPost;
use App\Models\Follow;
use App\Models\Tag;
use App\Services\DayNews\TagService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class TagController extends Controller
{
    public function __construct(
        private readonly TagService $tagService
    ) {}

    /**
     * Display tag page
     */
    public function show(Request $request, string $slug): Response
    {
        $tag = Tag::where('slug', $slug)->firstOrFail();

        // Get content tagged with this tag
        $content = DayNewsPost::published()
            ->whereHas('tags', function ($q) use ($tag) {
                $q->where('tags.id', $tag->id);
            })
            ->with(['author', 'regions'])
            ->orderBy('published_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($post) {
                return [
                    'id' => (string) $post->id,
                    'type' => 'article',
                    'title' => $post->title,
                    'excerpt' => $post->excerpt,
                    'image' => $post->featured_image,
                    'published_at' => $post->published_at?->toISOString(),
                    'author' => $post->author ? [
                        'name' => $post->author->name,
                        'avatar' => $post->author->profile_photo_url ?? null,
                    ] : null,
                    'slug' => $post->slug,
                    'engagement' => [
                        'likes' => 0, // TODO: Add likes count
                        'comments' => $post->comments()->count(),
                    ],
                    'tags' => $post->tags->pluck('slug')->toArray(),
                ];
            });

        // Get related tags using TagService
        $relatedTags = $this->tagService->getRelatedTags($tag, 10);

        // Get top contributors (users who wrote articles with this tag)
        $topContributors = \App\Models\User::whereHas('posts', function ($q) use ($tag) {
            $q->whereHas('tags', function ($tagQuery) use ($tag) {
                $tagQuery->where('tags.id', $tag->id);
            });
        })
            ->withCount(['posts' => function ($q) use ($tag) {
                $q->whereHas('tags', function ($tagQuery) use ($tag) {
                    $tagQuery->where('tags.id', $tag->id);
                });
            }])
            ->orderBy('posts_count', 'desc')
            ->limit(5)
            ->get()
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->profile_photo_url ?? null,
                'articles' => $user->posts_count,
                'followers' => 0, // TODO: Add follower count
            ]);

        // Check if user is following this tag
        $isFollowing = false;
        if ($request->user()) {
            $isFollowing = Follow::where('user_id', $request->user()->id)
                ->where('followable_type', Tag::class)
                ->where('followable_id', $tag->id)
                ->exists();
        }

        // Get tag analytics
        $analytics = $this->tagService->getTagAnalytics($tag, 30);

        return Inertia::render('day-news/tags/show', [
            'tag' => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
                'description' => $tag->description ?? '',
                'article_count' => $tag->posts()->count(),
                'followers' => $tag->followers()->count(),
                'is_trending' => $tag->is_trending ?? false,
                'trending_score' => $tag->trending_score ?? 0,
                'created_at' => $tag->created_at->toISOString(),
                'related_tags' => $relatedTags,
                'top_contributors' => $topContributors,
                'analytics' => $analytics,
            ],
            'content' => $content,
            'isFollowing' => $isFollowing,
        ]);
    }
}

