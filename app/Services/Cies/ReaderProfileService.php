<?php

declare(strict_types=1);

namespace App\Services\Cies;

use App\Models\ReaderEngagement;
use App\Models\ReaderProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class ReaderProfileService
{
    /**
     * Track an engagement (view, vote, click) and update profile
     */
    public function trackEngagement(User $user, string $contentType, string $contentId, string $engagementType): void
    {
        DB::transaction(function () use ($user, $contentType, $contentId, $engagementType) {
            // 1. Log the raw engagement
            ReaderEngagement::create([
                'user_id' => $user->id,
                'content_type' => $contentType,
                'content_id' => $contentId,
                'engagement_type' => $engagementType,
                'engaged_at' => now(),
            ]);

            // 2. Update the aggregated profile
            $profile = ReaderProfile::firstOrCreate(['user_id' => $user->id]);

            // Increment counters
            $this->updateCounters($profile, $engagementType);

            // Update interests (simplified logic)
            // In a real system, we'd pull the tags from the Content object
            $this->updateInterestGraph($profile, $contentType);

            $profile->last_active_at = now();
            $profile->save();
        });
    }

    private function updateCounters(ReaderProfile $profile, string $type): void
    {
        switch ($type) {
            case 'view':
                $profile->increment('total_articles_read');
                break;
            case 'vote':
                $profile->increment('total_polls_voted');
                break;
            case 'comment':
                $profile->increment('total_comments');
                break;
            case 'share':
                $profile->increment('total_shares');
                break;
        }

        // Simple engagement score calc
        $profile->engagement_score =
            ($profile->total_articles_read * 1) +
            ($profile->total_polls_voted * 5) +
            ($profile->total_comments * 10) +
            ($profile->total_shares * 15);
    }

    private function updateInterestGraph(ReaderProfile $profile, string $contentType): void
    {
        // Placeholder: Needs content topic tags to be effective
        // For MVP, just tracking content types
        $types = $profile->preferred_content_types ?? [];
        if (!isset($types[$contentType])) {
            $types[$contentType] = 0;
        }
        $types[$contentType]++;
        $profile->preferred_content_types = $types;
    }
}
