<?php

declare(strict_types=1);

namespace App\Services\EventCity;

use App\Models\User;
use App\Models\UserBehavioralEvent;
use App\Models\UserBehavioralProfile;
use App\Models\UserSegment;
use App\Models\UserSegmentMembership;

final class ProfileComputationService
{
    /**
     * Compute the behavioral profile for a single user.
     */
    public function computeProfile(User $user): UserBehavioralProfile
    {
        $events = UserBehavioralEvent::query()
            ->forUser($user->id)
            ->recent(90)
            ->get();

        $categoryAffinities = $this->computeCategoryAffinities($events);
        $temporalPatterns = $this->computeTemporalPatterns($events);
        $spendingPatterns = $this->computeSpendingPatterns($events);
        $geographicPreferences = $this->computeGeographicPreferences($events);
        $engagementScore = $this->computeEngagementScore($events);

        $profile = UserBehavioralProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'category_affinities' => $categoryAffinities,
                'temporal_patterns' => $temporalPatterns,
                'spending_patterns' => $spendingPatterns,
                'geographic_preferences' => $geographicPreferences,
                'engagement_score' => $engagementScore,
                'last_computed_at' => now(),
            ]
        );

        $this->assignAutoSegments($profile);

        return $profile;
    }

    /**
     * Compute profiles in batch for stale profiles.
     *
     * @return int Number of profiles processed
     */
    public function computeProfilesInBatch(int $batchSize = 100): int
    {
        $staleProfiles = UserBehavioralProfile::query()
            ->where(function ($query) {
                $query->whereNull('last_computed_at')
                    ->orWhere('last_computed_at', '<', now()->subHours(24));
            })
            ->limit($batchSize)
            ->get();

        $usersWithEvents = User::query()
            ->whereDoesntHave('behavioralProfile')
            ->whereHas('behavioralEvents')
            ->limit($batchSize - $staleProfiles->count())
            ->get();

        $processed = 0;

        foreach ($staleProfiles as $profile) {
            $this->computeProfile($profile->user);
            $processed++;
        }

        foreach ($usersWithEvents as $user) {
            $this->computeProfile($user);
            $processed++;
        }

        return $processed;
    }

    /**
     * Assign auto-computed segments to a user profile.
     */
    public function assignAutoSegments(UserBehavioralProfile $profile): void
    {
        $segments = [];
        $affinities = $profile->category_affinities ?? [];

        foreach ($affinities as $category => $score) {
            if ($score >= 0.7) {
                $segments[] = "{$category}_enthusiast";
            }
        }

        if ($profile->engagement_score >= 75) {
            $segments[] = 'power_user';
        } elseif ($profile->engagement_score >= 40) {
            $segments[] = 'active_user';
        }

        $spending = $profile->spending_patterns ?? [];
        if (isset($spending['price_range'])) {
            $segments[] = $spending['price_range'].'_spender';
        }

        $profile->update(['auto_segments' => $segments]);

        $autoSegments = UserSegment::auto()->get();

        foreach ($autoSegments as $segment) {
            $criteria = $segment->criteria ?? [];
            $matches = $this->evaluateSegmentCriteria($profile, $criteria);

            if ($matches) {
                UserSegmentMembership::updateOrCreate(
                    ['user_segment_id' => $segment->id, 'user_id' => $profile->user_id],
                    ['assigned_at' => now()]
                );
            } else {
                UserSegmentMembership::query()
                    ->where('user_segment_id', $segment->id)
                    ->where('user_id', $profile->user_id)
                    ->delete();
            }
        }
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Collection<int, UserBehavioralEvent>  $events
     * @return array<string, float>
     */
    private function computeCategoryAffinities($events): array
    {
        $categoryCounts = $events
            ->whereNotNull('category')
            ->groupBy('category')
            ->map(fn ($group) => $group->count());

        $total = $categoryCounts->sum();

        if ($total === 0) {
            return [];
        }

        return $categoryCounts->map(fn ($count) => round($count / $total, 2))->toArray();
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Collection<int, UserBehavioralEvent>  $events
     * @return array<string, mixed>
     */
    private function computeTemporalPatterns($events): array
    {
        if ($events->isEmpty()) {
            return [];
        }

        $hours = $events->map(fn ($e) => $e->occurred_at->hour);
        $days = $events->map(fn ($e) => $e->occurred_at->dayOfWeek);

        return [
            'most_active_hour' => $hours->mode()[0] ?? 12,
            'preferred_day' => $days->mode()[0] ?? 5,
            'total_events' => $events->count(),
        ];
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Collection<int, UserBehavioralEvent>  $events
     * @return array<string, mixed>
     */
    private function computeSpendingPatterns($events): array
    {
        $purchases = $events->where('event_type', 'ticket_purchase');

        if ($purchases->isEmpty()) {
            return ['price_range' => 'budget', 'purchase_count' => 0];
        }

        $avgSpend = $purchases->avg(fn ($e) => $e->context['amount'] ?? 0);

        $priceRange = match (true) {
            $avgSpend >= 100 => 'premium',
            $avgSpend >= 40 => 'mid',
            default => 'budget',
        };

        return [
            'price_range' => $priceRange,
            'purchase_count' => $purchases->count(),
            'avg_spend' => round($avgSpend, 2),
        ];
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Collection<int, UserBehavioralEvent>  $events
     * @return array<string, mixed>
     */
    private function computeGeographicPreferences($events): array
    {
        $withLocation = $events->filter(fn ($e) => $e->latitude !== null && $e->longitude !== null);

        if ($withLocation->isEmpty()) {
            return [];
        }

        return [
            'center_lat' => round($withLocation->avg('latitude'), 7),
            'center_lng' => round($withLocation->avg('longitude'), 7),
            'event_count_with_location' => $withLocation->count(),
        ];
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Collection<int, UserBehavioralEvent>  $events
     */
    private function computeEngagementScore($events): int
    {
        if ($events->isEmpty()) {
            return 0;
        }

        $weights = [
            'ticket_purchase' => 10,
            'save' => 5,
            'share' => 8,
            'event_view' => 2,
            'page_view' => 1,
            'search' => 3,
        ];

        $score = $events->sum(fn ($e) => $weights[$e->event_type] ?? 1);

        return min(100, (int) $score);
    }

    /**
     * @param  array<string, mixed>  $criteria
     */
    private function evaluateSegmentCriteria(UserBehavioralProfile $profile, array $criteria): bool
    {
        if (empty($criteria)) {
            return false;
        }

        if (isset($criteria['min_engagement_score']) && $profile->engagement_score < $criteria['min_engagement_score']) {
            return false;
        }

        if (isset($criteria['category'])) {
            $affinities = $profile->category_affinities ?? [];
            if (! isset($affinities[$criteria['category']]) || $affinities[$criteria['category']] < 0.3) {
                return false;
            }
        }

        return true;
    }
}
