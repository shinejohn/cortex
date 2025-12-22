<?php

declare(strict_types=1);

namespace App\Services\DayNews;

use App\Models\DayNewsPost;
use App\Models\Tag;
use Illuminate\Support\Facades\DB;

final class TagService
{
    /**
     * Calculate trending score for a tag
     */
    public function calculateTrendingScore(Tag $tag): int
    {
        $now = now();
        $oneWeekAgo = $now->copy()->subWeek();
        $oneMonthAgo = $now->copy()->subMonth();

        // Get recent article count (last week)
        $recentArticles = DayNewsPost::published()
            ->whereHas('tags', function ($q) use ($tag) {
                $q->where('tags.id', $tag->id);
            })
            ->where('published_at', '>=', $oneWeekAgo)
            ->count();

        // Get recent followers (last week)
        $recentFollowers = $tag->followers()
            ->where('created_at', '>=', $oneWeekAgo)
            ->count();

        // Get total article count
        $totalArticles = $tag->article_count;

        // Calculate score (weighted formula)
        $score = ($recentArticles * 10) + ($recentFollowers * 5) + ($totalArticles * 0.1);

        return (int) round($score);
    }

    /**
     * Update trending tags
     */
    public function updateTrendingTags(): void
    {
        $tags = Tag::where('article_count', '>', 0)->get();

        foreach ($tags as $tag) {
            $score = $this->calculateTrendingScore($tag);
            $isTrending = $score >= 50; // Threshold for trending

            $tag->update([
                'trending_score' => $score,
                'is_trending' => $isTrending,
            ]);
        }

        // Reset tags that are no longer trending
        Tag::where('is_trending', true)
            ->where('trending_score', '<', 50)
            ->update(['is_trending' => false]);
    }

    /**
     * Get tag analytics
     */
    public function getTagAnalytics(Tag $tag, int $days = 30): array
    {
        $startDate = now()->subDays($days);

        // Get views over time
        $views = DayNewsPost::published()
            ->whereHas('tags', function ($q) use ($tag) {
                $q->where('tags.id', $tag->id);
            })
            ->where('published_at', '>=', $startDate)
            ->selectRaw('DATE(published_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date')
            ->toArray();

        // Get engagement (simplified - would need engagement tracking)
        $engagement = [];

        // Get peak times (simplified)
        $peakTimes = DayNewsPost::published()
            ->whereHas('tags', function ($q) use ($tag) {
                $q->where('tags.id', $tag->id);
            })
            ->where('published_at', '>=', $startDate)
            ->selectRaw('DAYNAME(published_at) as day, HOUR(published_at) as hour, COUNT(*) as count')
            ->groupBy('day', 'hour')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get()
            ->map(fn ($item) => [
                'day' => $item->day,
                'time' => $item->hour . ':00',
                'score' => $item->count,
            ])
            ->toArray();

        return [
            'views' => array_values($views),
            'engagement' => $engagement,
            'periods' => array_keys($views),
            'peak_times' => $peakTimes,
        ];
    }

    /**
     * Sync tag article count
     */
    public function syncTagArticleCount(Tag $tag): void
    {
        $count = DayNewsPost::published()
            ->whereHas('tags', function ($q) use ($tag) {
                $q->where('tags.id', $tag->id);
            })
            ->count();

        $tag->update(['article_count' => $count]);
    }

    /**
     * Sync all tag article counts
     */
    public function syncAllTagCounts(): void
    {
        Tag::chunk(100, function ($tags) {
            foreach ($tags as $tag) {
                $this->syncTagArticleCount($tag);
            }
        });
    }

    /**
     * Get related tags
     */
    public function getRelatedTags(Tag $tag, int $limit = 10): array
    {
        // Find tags that appear together with this tag
        $relatedTagIds = DB::table('day_news_post_tag as pt1')
            ->join('day_news_post_tag as pt2', 'pt1.day_news_post_id', '=', 'pt2.day_news_post_id')
            ->where('pt1.tag_id', $tag->id)
            ->where('pt2.tag_id', '!=', $tag->id)
            ->select('pt2.tag_id', DB::raw('COUNT(*) as weight'))
            ->groupBy('pt2.tag_id')
            ->orderBy('weight', 'desc')
            ->limit($limit)
            ->pluck('tag_id')
            ->toArray();

        return Tag::whereIn('id', $relatedTagIds)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'slug' => $t->slug,
                'weight' => 1, // Would calculate actual weight
            ])
            ->toArray();
    }
}

