<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Models\ArticleComment;
use App\Models\DayNewsPost;
use App\Services\SeoService;
use Inertia\Inertia;
use Inertia\Response;

final class PublicPostController extends Controller
{
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

        // Get comments (top level only, replies loaded separately)
        $comments = $post->comments()
            ->where('is_active', true)
            ->whereNull('parent_id')
            ->with(['user', 'replies.user', 'replies.likes'])
            ->withCount(['likes', 'replies'])
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($comment) use ($post) {
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
                    'is_liked_by_user' => false, // Will be set on frontend if user is logged in
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
                            'is_liked_by_user' => false,
                        ];
                    }),
                ];
            });

        // Get related posts from the same region(s) and category
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

        // Get previous and next articles
        $previousPost = DayNewsPost::published()
            ->where('id', '<', $post->id)
            ->whereHas('regions', function ($q) use ($regionIds) {
                $q->whereIn('regions.id', $regionIds);
            })
            ->orderBy('id', 'desc')
            ->first();

        $nextPost = DayNewsPost::published()
            ->where('id', '>', $post->id)
            ->whereHas('regions', function ($q) use ($regionIds) {
                $q->whereIn('regions.id', $regionIds);
            })
            ->orderBy('id', 'asc')
            ->first();

        // Build SEO JSON-LD data
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
            'commentsCount' => $post->comments_count,
            'previousPost' => $previousPost ? [
                'id' => $previousPost->id,
                'title' => $previousPost->title,
                'slug' => $previousPost->slug,
            ] : null,
            'nextPost' => $nextPost ? [
                'id' => $nextPost->id,
                'title' => $nextPost->title,
                'slug' => $nextPost->slug,
            ] : null,
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
        ]);
    }
}
