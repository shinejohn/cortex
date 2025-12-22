<?php

declare(strict_types=1);

namespace App\Services\DayNews;

use App\Models\DayNewsPost;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class AuthorService
{
    /**
     * Calculate author trust score
     */
    public function calculateTrustScore(User $user): float
    {
        $publishedPosts = $user->authoredDayNewsPosts()->published()->count();
        $totalViews = $user->authoredDayNewsPosts()->published()->sum('view_count');
        $totalComments = $user->authoredDayNewsPosts()->published()
            ->withCount('comments')
            ->get()
            ->sum('comments_count');
        $totalLikes = $user->authoredDayNewsPosts()->published()
            ->withCount('ratings')
            ->get()
            ->sum('ratings_count');

        // Weighted scoring
        $score = ($publishedPosts * 10) + ($totalViews * 0.01) + ($totalComments * 5) + ($totalLikes * 3);

        // Normalize to 0-100 scale
        $normalizedScore = min(100, $score / 100);

        return round($normalizedScore, 2);
    }

    /**
     * Update author trust score and tier
     */
    public function updateAuthorMetrics(User $user): void
    {
        $trustScore = $this->calculateTrustScore($user);

        $trustTier = match (true) {
            $trustScore >= 75 => 'platinum',
            $trustScore >= 50 => 'gold',
            $trustScore >= 25 => 'silver',
            default => 'bronze',
        };

        $user->update([
            'trust_score' => $trustScore,
            'trust_tier' => $trustTier,
        ]);
    }

    /**
     * Get author by slug or ID
     */
    public function getAuthorByIdentifier(string $identifier): ?User
    {
        return User::where('author_slug', $identifier)
            ->orWhere('id', $identifier)
            ->first();
    }

    /**
     * Get author analytics
     */
    public function getAuthorAnalytics(User $user, int $days = 30): array
    {
        $startDate = now()->subDays($days);

        $posts = $user->authoredDayNewsPosts()
            ->published()
            ->where('published_at', '>=', $startDate)
            ->get();

        $totalViews = $posts->sum('view_count');
        $totalComments = $posts->sum(fn ($post) => $post->comments()->count());
        $totalLikes = $posts->sum(fn ($post) => $post->ratings()->count());

        $viewsOverTime = $posts->groupBy(function ($post) {
            return $post->published_at->format('Y-m-d');
        })->map(fn ($dayPosts) => $dayPosts->sum('view_count'))->toArray();

        $topPosts = $posts->sortByDesc('view_count')->take(5)->values();

        return [
            'total_posts' => $posts->count(),
            'total_views' => $totalViews,
            'total_comments' => $totalComments,
            'total_likes' => $totalLikes,
            'average_views_per_post' => $posts->count() > 0 ? round($totalViews / $posts->count(), 2) : 0,
            'views_over_time' => $viewsOverTime,
            'top_posts' => $topPosts->map(fn ($post) => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'views' => $post->view_count,
                'published_at' => $post->published_at->toISOString(),
            ]),
        ];
    }

    /**
     * Generate author slug
     */
    public function generateAuthorSlug(User $user): string
    {
        $baseSlug = \Illuminate\Support\Str::slug($user->name);
        $slug = $baseSlug;
        $count = 1;

        while (User::where('author_slug', $slug)->where('id', '!=', $user->id)->exists()) {
            $slug = $baseSlug . '-' . $count;
            $count++;
        }

        return $slug;
    }
}

