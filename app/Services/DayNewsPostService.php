<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\DayNewsPost;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\DB;

final class DayNewsPostService
{
    public function __construct(
        private readonly AdvertisementService $advertisementService
    ) {}

    public function createPost(User $user, Workspace $workspace, array $data): DayNewsPost
    {
        return DB::transaction(function () use ($user, $workspace, $data) {
            $type = $data['type'];
            $category = $data['category'] ?? null;
            $isFree = $this->isPostFree($workspace, $type, $category);

            $post = DayNewsPost::create([
                'workspace_id' => $workspace->id,
                'author_id' => $user->id,
                'type' => $type,
                'category' => $category,
                'title' => $data['title'],
                'slug' => $data['slug'] ?? null,
                'content' => $data['content'],
                'excerpt' => $data['excerpt'] ?? null,
                'featured_image' => $data['featured_image'] ?? null,
                'metadata' => $data['metadata'] ?? null,
                'status' => $isFree ? 'published' : 'draft',
                'published_at' => $isFree ? now() : null,
            ]);

            if (! empty($data['region_ids'])) {
                $post->regions()->sync($data['region_ids']);
            }

            return $post;
        });
    }

    public function updatePost(DayNewsPost $post, array $data): DayNewsPost
    {
        return DB::transaction(function () use ($post, $data) {
            $post->update([
                'type' => $data['type'] ?? $post->type,
                'category' => $data['category'] ?? $post->category,
                'title' => $data['title'] ?? $post->title,
                'content' => $data['content'] ?? $post->content,
                'excerpt' => $data['excerpt'] ?? $post->excerpt,
                'featured_image' => $data['featured_image'] ?? $post->featured_image,
                'metadata' => $data['metadata'] ?? $post->metadata,
            ]);

            if (isset($data['region_ids'])) {
                $post->regions()->sync($data['region_ids']);
            }

            return $post->fresh();
        });
    }

    public function publishPost(DayNewsPost $post): DayNewsPost
    {
        return DB::transaction(function () use ($post) {
            $post->update([
                'status' => 'published',
                'published_at' => now(),
            ]);

            if ($post->type === 'ad' && $post->payment?->isPaid()) {
                $adDays = $post->payment->ad_days ?? 7;
                $post->update([
                    'expires_at' => now()->addDays($adDays),
                ]);

                $regionIds = $post->regions->pluck('id')->toArray();

                $this->advertisementService->createAdvertisement(
                    advertable: $post,
                    platform: 'day_news',
                    config: [
                        'placement' => $post->metadata['ad_placement'] ?? 'sidebar',
                        'regions' => $regionIds,
                        'starts_at' => now(),
                        'expires_at' => now()->addDays($adDays),
                    ]
                );
            }

            return $post->fresh();
        });
    }

    public function isPostFree(Workspace $workspace, string $type, ?string $category): bool
    {
        if ($category && in_array($category, config('services.day_news.free_categories', []))) {
            return true;
        }

        if ($type === 'ad') {
            return false;
        }

        $publishedPostsCount = DayNewsPost::forWorkspace($workspace->id)
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->count();

        return $publishedPostsCount === 0;
    }

    public function calculateCost(string $type, ?int $adDays = null): int
    {
        if ($type === 'ad') {
            $days = $adDays ?? 7;

            return config('services.day_news.ad_price_per_day') * $days;
        }

        return config('services.day_news.post_price');
    }

    public function expireAds(): int
    {
        $expiredPosts = DayNewsPost::where('type', 'ad')
            ->where('status', 'published')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->get();

        foreach ($expiredPosts as $post) {
            $post->update(['status' => 'expired']);

            foreach ($post->advertisements as $ad) {
                $ad->markAsInactive();
            }
        }

        return $expiredPosts->count();
    }

    public function deletePost(DayNewsPost $post): bool
    {
        return DB::transaction(function () use ($post) {
            foreach ($post->advertisements as $ad) {
                $ad->markAsInactive();
            }

            return $post->delete();
        });
    }
}
