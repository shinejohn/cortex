<?php

declare(strict_types=1);

namespace App\Services\EventCity;

use App\Models\AdCampaign;
use App\Models\AdImpression;
use App\Models\User;
use App\Models\UserBehavioralProfile;
use Illuminate\Database\Eloquent\Collection;

final class IntentAdService
{
    /**
     * Match ad campaigns to a user based on their behavioral profile.
     *
     * @return Collection<int, AdCampaign>
     */
    public function matchAdsToUser(User $user, int $limit = 5): Collection
    {
        $profile = UserBehavioralProfile::where('user_id', $user->id)->first();

        if (! $profile) {
            return AdCampaign::query()
                ->where('status', 'active')
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->whereRaw('spent < budget')
                ->inRandomOrder()
                ->limit($limit)
                ->get();
        }

        $categoryAffinities = $profile->category_affinities ?? [];
        $topCategories = collect($categoryAffinities)
            ->sortDesc()
            ->keys()
            ->take(3)
            ->toArray();

        return AdCampaign::query()
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->whereRaw('spent < budget')
            ->where(function ($query) use ($topCategories) {
                foreach ($topCategories as $category) {
                    $query->orWhereJsonContains('targeting->categories', $category);
                }
                $query->orWhereNull('targeting');
            })
            ->orderByRaw('daily_budget DESC')
            ->limit($limit)
            ->get();
    }

    /**
     * Record an intent-based ad impression.
     */
    public function recordIntentImpression(User $user, int $adCampaignId): void
    {
        AdImpression::create([
            'ad_campaign_id' => $adCampaignId,
            'user_id' => $user->id,
            'impression_type' => 'intent',
            'context' => ['source' => 'behavioral_targeting'],
            'viewed_at' => now(),
        ]);
    }

    /**
     * Create an intent-based ad campaign with behavioral targeting.
     */
    public function createIntentCampaign(array $data): AdCampaign
    {
        $targeting = $data['targeting'] ?? [];
        $targeting['type'] = 'behavioral';
        $targeting['intent_based'] = true;

        return AdCampaign::create(array_merge($data, [
            'targeting' => $targeting,
            'type' => 'sponsored',
        ]));
    }
}
