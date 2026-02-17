<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\DayNewsPost;
use App\Models\Region;
use App\Models\Tag;
use App\Services\Creator\AiCreatorAssistantService;
use App\Services\Creator\ContentModeratorService;
use App\Services\News\ImageStorageService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

final class ArticleCreatorController extends Controller
{
    public function __construct(
        private readonly AiCreatorAssistantService $assistant,
        private readonly ContentModeratorService $moderator,
        private readonly ImageStorageService $imageStorage,
    ) {}

    /**
     * GET /articles/create
     */
    public function create(Request $request): Response
    {
        $user = auth()->user();
        $regions = Region::orderBy('name')->get(['id', 'name', 'type', 'metadata']);
        $categories = config('news-workflow.publishing.category', 'local_news');
        $categories = is_array($categories) ? $categories : [$categories];
        $allCategories = [
            'local_news', 'business', 'government', 'crime', 'sports',
            'lifestyle', 'education', 'health', 'real_estate', 'opinion',
        ];
        $tags = Tag::orderBy('name')->pluck('name', 'id');

        return Inertia::render('Articles/Create', [
            'regions' => $regions,
            'categories' => $allCategories,
            'availableTags' => $tags,
            'defaultRegionId' => $user->default_region_id ?? null,
            'contentType' => 'article',
        ]);
    }

    /**
     * POST /articles
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:500',
            'content' => 'required|string|min:100|max:50000',
            'excerpt' => 'sometimes|string|max:500',
            'category' => 'required|string',
            'region_id' => 'required|uuid|exists:regions,id',
            'tags' => 'sometimes|array',
            'tags.*' => 'string',
            'featured_image_url' => 'sometimes|url|max:2000',
            'featured_image_alt' => 'sometimes|string|max:500',
            'seo_metadata' => 'sometimes|array',
            'seo_metadata.meta_description' => 'sometimes|string|max:160',
            'seo_metadata.slug' => 'sometimes|string|max:200',
            'seo_metadata.keywords' => 'sometimes|array',
            'session_id' => 'sometimes|uuid',
            'status' => 'sometimes|string|in:draft,submit_for_review',
        ]);

        $postData = [
            'title' => $validated['title'],
            'content' => $validated['content'],
            'excerpt' => $validated['excerpt'] ?? mb_substr(strip_tags($validated['content']), 0, 160),
            'category' => $validated['category'],
            'author_id' => auth()->id(),
            'type' => 'article',
            'source_type' => 'human_created',
            'status' => 'draft',
        ];

        if (! empty($validated['featured_image_url'])) {
            try {
                $storage = $this->imageStorage->downloadAndStore(
                    $validated['featured_image_url'],
                    'article-'.Str::random(8)
                );
                $postData['featured_image_path'] = $storage['storage_path'];
                $postData['featured_image_disk'] = $storage['storage_disk'];
            } catch (Exception $e) {
                $postData['featured_image'] = $validated['featured_image_url'];
            }
        }

        if (! empty($validated['seo_metadata'])) {
            $postData['metadata'] = [
                'meta_description' => $validated['seo_metadata']['meta_description'] ?? null,
                'slug_override' => $validated['seo_metadata']['slug'] ?? null,
                'keywords' => $validated['seo_metadata']['keywords'] ?? [],
            ];
        }

        $post = DayNewsPost::create($postData);

        if (! empty($validated['tags'])) {
            foreach ($validated['tags'] as $tagName) {
                $tag = Tag::firstOrCreate(['name' => $tagName]);
                $post->tags()->attach($tag->id);
            }
        }

        $post->regions()->attach($validated['region_id']);

        $moderationLog = $this->moderator->moderate(
            contentType: 'day_news_post',
            contentId: (string) $post->id,
            content: $validated['title']."\n\n".$validated['content'],
            metadata: [
                'title' => $validated['title'],
                'category' => $validated['category'],
                'region_id' => $validated['region_id'],
                'user_id' => auth()->id(),
            ],
            trigger: 'on_create'
        );

        if ($moderationLog->isApproved() && ($validated['status'] ?? '') === 'submit_for_review') {
            $post->update(['status' => 'published', 'published_at' => now()]);
        }

        if (! empty($validated['session_id'])) {
            \App\Models\AiCreatorSession::where('id', $validated['session_id'])
                ->where('user_id', auth()->id())
                ->update([
                    'status' => 'submitted',
                    'published_content_id' => (string) $post->id,
                    'published_content_type' => 'day_news_post',
                ]);
        }

        $redirectRoute = $post->status === 'published'
            ? route('posts.show', $post->slug)
            : route('posts.edit', $post);

        return redirect()->to($redirectRoute)
            ->with('success', 'Article created successfully.');
    }
}
