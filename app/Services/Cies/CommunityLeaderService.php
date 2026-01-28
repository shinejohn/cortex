<?php

declare(strict_types=1);

namespace App\Services\Cies;

use App\Models\CommunityLeader;
use App\Models\Region;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

final class CommunityLeaderService
{
    /**
     * Create or update a community leader
     */
    public function updateOrCreate(array $data): CommunityLeader
    {
        return CommunityLeader::updateOrCreate(
            [
                'email' => $data['email'] ?? null,
                'region_id' => $data['region_id'],
            ],
            $data
        );
    }

    /**
     * Get leaders by category for a region
     */
    public function getByCategory(Region $region, string $category): Collection
    {
        return CommunityLeader::where('region_id', $region->id)
            ->where('category', $category)
            ->where('is_active', true)
            ->orderBy('influence_score', 'desc')
            ->get();
    }

    /**
     * Find best sources for a specific topic
     */
    public function findExpertsForTopic(Region $region, string $topic): Collection
    {
        // Simple JSON search - in production could be improved with better search
        return CommunityLeader::where('region_id', $region->id)
            ->where('is_active', true)
            ->where(function ($query) use ($topic) {
                $query->whereJsonContains('expertise_topics', $topic)
                    ->orWhere('title', 'like', "%{$topic}%")
                    ->orWhere('notes', 'like', "%{$topic}%");
            })
            ->orderBy('influence_score', 'desc')
            ->limit(5)
            ->get();
    }

    /**
     * Record an interaction/contact attempt
     */
    public function logInteraction(CommunityLeader $leader, bool $responded = false): void
    {
        $leader->increment('times_contacted');
        $leader->update(['last_contacted_at' => now()]);

        if ($responded) {
            $leader->increment('times_responded');
            $leader->update(['last_responded_at' => now()]);
        }
    }

    /**
     * Update influence score based on engagement
     */
    public function updateInfluenceScore(CommunityLeader $leader): void
    {
        $score = $leader->influence_score;

        // Base score triggers
        $score += $leader->follower_count ? (int) log($leader->follower_count) : 0;
        $score += $leader->times_quoted * 5;
        $score += $leader->times_responded * 2;

        // Cap at 100
        $score = min($score, 100);

        $leader->update(['influence_score' => $score]);
    }
}
