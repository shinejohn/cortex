<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AdCampaign;
use App\Models\AdCreative;
use App\Models\AdPlacement;
use App\Models\AdImpression;
use App\Models\AdClick;
use App\Models\AdInventory;
use App\Models\Community;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

final class AdServerService
{
    /**
     * Get an ad to display for a given placement and community
     */
    public function getAd(string $platform, string $slot, ?int $communityId = null, ?string $sessionId = null): ?array
    {
        $placement = $this->getPlacement($platform, $slot);
        if (!$placement || !$placement->is_active) {
            return null;
        }

        // Get eligible campaigns targeting this community/platform
        $creative = $this->selectCreative($placement, $communityId, $sessionId);
        if (!$creative) {
            return null;
        }

        // Record impression
        $impression = $this->recordImpression($creative, $placement, $communityId, $sessionId);

        return [
            'creative_id' => $creative->uuid,
            'impression_id' => $impression->id,
            'format' => $creative->format,
            'headline' => $creative->headline,
            'body' => $creative->body,
            'image_url' => $creative->image_url,
            'video_url' => $creative->video_url,
            'audio_url' => $creative->audio_url,
            'click_url' => route('ads.click', ['impression' => $impression->id]),
            'cta_text' => $creative->cta_text,
            'width' => $placement->width,
            'height' => $placement->height,
        ];
    }

    /**
     * Select best creative based on targeting, budget, and rotation
     */
    protected function selectCreative(AdPlacement $placement, ?int $communityId, ?string $sessionId): ?AdCreative
    {
        $cacheKey = "ad_eligible_{$placement->id}_" . ($communityId ?? 'all');

        $eligibleCreatives = Cache::remember($cacheKey, 60, function () use ($placement, $communityId) {
            return AdCreative::query()
                ->where('status', 'active')
                ->where('format', $placement->format)
                ->whereHas('campaign', function ($query) use ($communityId, $placement) {
                    $query->where('status', 'active')
                        ->where('start_date', '<=', now())
                        ->where('end_date', '>=', now())
                        ->whereRaw('spent < budget')
                        ->where(function ($q) use ($communityId) {
                            if ($communityId) {
                                $q->whereNull('targeting')
                                    ->orWhereJsonContains('targeting->communities', $communityId);
                            } else {
                                $q->whereNull('targeting');
                            }
                        })
                        ->where(function ($q) use ($placement) {
                            $q->whereNull('platforms')
                                ->orWhereJsonContains('platforms', $placement->platform);
                        });
                })
                ->with('campaign')
                ->get();
        });

        if ($eligibleCreatives->isEmpty()) {
            return null;
        }

        // Apply frequency capping if session provided
        if ($sessionId) {
            $recentImpressions = AdImpression::where('session_id', $sessionId)
                ->where('impressed_at', '>', now()->subHour())
                ->pluck('creative_id')
                ->toArray();

            $eligibleCreatives = $eligibleCreatives->filter(function ($creative) use ($recentImpressions) {
                // Allow max 3 impressions per hour per session
                return collect($recentImpressions)
                    ->filter(fn($id) => $id === $creative->id)
                    ->count() < 3;
            });
        }

        if ($eligibleCreatives->isEmpty()) {
            return null;
        }

        // Weighted random selection based on remaining budget
        $totalWeight = $eligibleCreatives->sum(fn($c) => $c->campaign->remaining_budget);
        if ($totalWeight <= 0) {
            return $eligibleCreatives->first();
        }

        $random = mt_rand(0, (int)($totalWeight * 100)) / 100;
        $cumulative = 0;
        foreach ($eligibleCreatives as $creative) {
            $cumulative += $creative->campaign->remaining_budget;
            if ($random <= $cumulative) {
                return $creative;
            }
        }

        return $eligibleCreatives->first();
    }

    /**
     * Record an impression
     */
    protected function recordImpression(
        AdCreative $creative,
        AdPlacement $placement,
        ?int $communityId,
        ?string $sessionId
    ): AdImpression {
        // Calculate cost based on campaign type
        $cost = 0;
        if ($creative->campaign->type === 'cpm') {
            $cost = (float) $placement->base_cpm / 1000;
        }

        $impression = AdImpression::create([
            'creative_id' => $creative->id,
            'placement_id' => $placement->id,
            'community_id' => $communityId,
            'session_id' => $sessionId,
            'ip_hash' => request()->ip() ? hash('sha256', request()->ip()) : null,
            'user_agent' => request()->userAgent(),
            'referrer' => request()->header('referer'),
            'cost' => $cost,
            'impressed_at' => now(),
        ]);

        // Update campaign spent (async via queue for performance)
        if ($cost > 0) {
            DB::table('ad_campaigns')
                ->where('id', $creative->campaign_id)
                ->increment('spent', $cost);
        }

        // Update inventory stats
        if ($communityId) {
            AdInventory::updateOrCreate(
                [
                    'placement_id' => $placement->id,
                    'community_id' => $communityId,
                    'date' => now()->toDateString(),
                ],
                []
            )->increment('delivered_impressions');
        }

        return $impression;
    }

    /**
     * Record a click
     */
    public function recordClick(int $impressionId): ?string
    {
        $impression = AdImpression::with('creative.campaign', 'placement')->find($impressionId);
        if (!$impression) {
            return null;
        }

        // Check for click fraud (same IP clicking multiple times)
        $existingClick = AdClick::where('impression_id', $impressionId)->exists();
        if ($existingClick) {
            return $impression->creative->click_url;
        }

        // Calculate click cost
        $cost = 0;
        if ($impression->creative->campaign->type === 'cpc') {
            $cost = (float) ($impression->placement->base_cpc ?? 0);
        }

        AdClick::create([
            'impression_id' => $impressionId,
            'creative_id' => $impression->creative_id,
            'ip_hash' => request()->ip() ? hash('sha256', request()->ip()) : null,
            'cost' => $cost,
            'clicked_at' => now(),
        ]);

        // Update campaign spent for CPC
        if ($cost > 0) {
            DB::table('ad_campaigns')
                ->where('id', $impression->creative->campaign_id)
                ->increment('spent', $cost);
        }

        return $impression->creative->click_url;
    }

    /**
     * Get placement by platform and slot
     */
    protected function getPlacement(string $platform, string $slot): ?AdPlacement
    {
        return Cache::remember(
            "placement_{$platform}_{$slot}",
            3600,
            fn() => AdPlacement::where('platform', $platform)
                ->where('slot', $slot)
                ->where('is_active', true)
                ->first()
        );
    }

    /**
     * Get campaign performance stats
     */
    public function getCampaignStats(AdCampaign $campaign): array
    {
        $impressions = AdImpression::whereIn('creative_id', $campaign->creatives->pluck('id'))
            ->count();
        $clicks = AdClick::whereIn('creative_id', $campaign->creatives->pluck('id'))
            ->count();

        return [
            'impressions' => $impressions,
            'clicks' => $clicks,
            'ctr' => $impressions > 0 ? round(($clicks / $impressions) * 100, 2) : 0,
            'spent' => (float) $campaign->spent,
            'remaining' => (float) $campaign->remaining_budget,
            'budget_utilization' => (float) $campaign->budget > 0
                ? round(((float) $campaign->spent / (float) $campaign->budget) * 100, 1)
                : 0,
        ];
    }

    /**
     * Get ads for email campaigns
     */
    public function getEmailAds(int $communityId, string $type = 'daily_digest', int $limit = 2): array
    {
        // Get sidebar ads for email
        $placement = $this->getPlacement('email', 'sidebar');
        if (!$placement) {
            return [];
        }

        $ads = [];
        for ($i = 0; $i < $limit; $i++) {
            $ad = $this->getAd('email', 'sidebar', $communityId);
            if ($ad) {
                $ads[] = $ad;
            }
        }

        return $ads;
    }
}

