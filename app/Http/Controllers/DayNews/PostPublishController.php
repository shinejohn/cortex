<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Models\DayNewsPost;
use App\Services\DayNewsPaymentService;
use App\Services\DayNewsPostService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class PostPublishController extends Controller
{
    public function __construct(
        private readonly DayNewsPostService $postService,
        private readonly DayNewsPaymentService $paymentService
    ) {}

    public function show(Request $request, DayNewsPost $post): Response
    {
        $this->authorize('publish', $post);

        $post->load(['regions', 'payment', 'workspace']);

        $isFree = $this->postService->isPostFree(
            workspace: $post->workspace,
            type: $post->type,
            category: $post->category
        );

        $cost = $isFree ? 0 : $this->postService->calculateCost(
            type: $post->type,
            adDays: $post->metadata['ad_days'] ?? null
        );

        return Inertia::render('day-news/posts/publish', [
            'post' => [
                'id' => $post->id,
                'type' => $post->type,
                'category' => $post->category,
                'title' => $post->title,
                'excerpt' => $post->excerpt,
                'content' => $post->content,
                'featured_image' => $post->featured_image,
                'metadata' => $post->metadata,
                'regions' => $post->regions->map(fn ($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                ]),
            ],
            'pricing' => [
                'is_free' => $isFree,
                'cost' => $cost / 100,
                'reason' => $isFree ? $this->getFreeReason($post) : null,
            ],
        ]);
    }

    public function store(Request $request, DayNewsPost $post): RedirectResponse
    {
        $this->authorize('publish', $post);

        $post->load(['workspace']);

        $isFree = $this->postService->isPostFree(
            workspace: $post->workspace,
            type: $post->type,
            category: $post->category
        );

        if ($isFree) {
            $this->postService->publishPost($post);

            return redirect()
                ->route('day-news.posts.index')
                ->with('success', 'Post published successfully!');
        }

        $session = $this->paymentService->createCheckoutSession(
            post: $post,
            workspace: $post->workspace,
            successUrl: route('day-news.posts.payment.success').'?session_id={CHECKOUT_SESSION_ID}',
            cancelUrl: route('day-news.posts.edit', $post)
        );

        return Inertia::location($session->url);
    }

    private function getFreeReason(DayNewsPost $post): string
    {
        if ($post->category && in_array($post->category, config('services.day_news.free_categories', []))) {
            return 'Free category: '.ucfirst(str_replace('_', ' ', $post->category));
        }

        $publishedCount = DayNewsPost::forWorkspace($post->workspace_id)
            ->where('status', 'published')
            ->count();

        if ($publishedCount === 0) {
            return 'First post is free';
        }

        return 'Free post';
    }
}
