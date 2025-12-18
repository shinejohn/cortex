<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
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
            ->with(['author', 'writerAgent', 'regions', 'workspace'])
            ->firstOrFail();

        $post->incrementViewCount();

        // Get related posts from the same region(s)
        $regionIds = $post->regions->pluck('id')->toArray();
        $relatedPosts = DayNewsPost::published()
            ->where('id', '!=', $post->id)
            ->whereHas('regions', function ($q) use ($regionIds) {
                $q->whereIn('regions.id', $regionIds);
            })
            ->with(['author', 'writerAgent', 'regions', 'workspace'])
            ->orderBy('published_at', 'desc')
            ->limit(5)
            ->get();

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
