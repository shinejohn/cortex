<?php

declare(strict_types=1);

namespace App\Services\AlphaSite;

use App\Models\AlphaSiteCommunity;
use App\Models\Business;
use App\Services\CacheService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * Manages community sites and business card listings
 */
final class CommunityService
{
    public function __construct(
        private readonly CacheService $cacheService,
        private readonly SubscriptionLifecycleService $subscriptionService
    ) {}

    /**
     * Get or create a community for a location
     */
    public function getOrCreateCommunity(string $city, string $state): AlphaSiteCommunity
    {
        $slug = strtolower("{$city}-{$state}");
        $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);

        return AlphaSiteCommunity::firstOrCreate(
            ['slug' => $slug],
            [
                'city' => $city,
                'state' => $state,
                'name' => "{$city}, {$state} Business Community",
                'is_active' => true,
            ]
        );
    }

    /**
     * Get businesses for community directory, sorted by subscription tier
     */
    public function getCommunityBusinesses(
        AlphaSiteCommunity $community,
        ?string $category = null,
        int $perPage = 24
    ): LengthAwarePaginator {
        $query = Business::query()
            ->with(['industry', 'subscription'])
            ->where('city', $community->city)
            ->where('state', $community->state)
            ->where('status', 'active');

        if ($category) {
            $query->whereHas('industry', fn($q) => $q->where('slug', $category));
        }

        // Sort by subscription tier (enterprise > premium > standard > basic)
        return $query
            ->orderByRaw("
                CASE 
                    WHEN subscription_tier = 'enterprise' THEN 1
                    WHEN subscription_tier = 'premium' THEN 2
                    WHEN subscription_tier = 'standard' THEN 3
                    WHEN subscription_tier = 'trial' THEN 4
                    ELSE 5
                END
            ")
            ->orderByDesc('rating')
            ->orderBy('name')
            ->paginate($perPage);
    }

    /**
     * Get business card data for display
     */
    public function getBusinessCardData(Business $business): array
    {
        $displayState = $this->subscriptionService->getDisplayState($business);

        return [
            'id' => $business->id,
            'name' => $business->name,
            'slug' => $business->slug,
            'subdomain' => $business->alphasite_subdomain,
            'industry' => $business->industry?->name,
            'rating' => $displayState !== 'basic' ? $business->rating : null,
            'reviews_count' => $displayState !== 'basic' ? $business->reviews_count : null,
            'image' => $displayState !== 'basic' ? ($business->images[0] ?? null) : null,
            'address' => $business->address,
            'city' => $business->city,
            'state' => $business->state,
            'display_state' => $displayState,
            'subscription_tier' => $business->subscription_tier,
            'is_claimable' => $displayState === 'basic' || 
                              ($displayState === 'premiere' && !$business->claimed_at),
            'url' => $this->getBusinessUrl($business, $displayState),
            'badge' => $this->getSubscriptionBadge($business->subscription_tier),
        ];
    }

    /**
     * Get URL based on display state
     */
    private function getBusinessUrl(Business $business, string $displayState): string
    {
        if ($displayState === 'basic') {
            return "/business/{$business->slug}?claim=true";
        }

        if ($business->alphasite_subdomain) {
            return "https://{$business->alphasite_subdomain}.alphasite.com";
        }

        return "/business/{$business->slug}";
    }

    /**
     * Get badge text for subscription tier
     */
    private function getSubscriptionBadge(string $tier): ?array
    {
        return match ($tier) {
            'enterprise' => ['text' => 'Enterprise', 'color' => 'gold'],
            'premium' => ['text' => 'Premium', 'color' => 'blue'],
            'standard' => ['text' => 'Verified', 'color' => 'green'],
            'trial' => ['text' => 'New', 'color' => 'purple'],
            default => null,
        };
    }

    /**
     * Get categories for a community
     */
    public function getCommunityCategories(AlphaSiteCommunity $community): Collection
    {
        return Business::query()
            ->where('city', $community->city)
            ->where('state', $community->state)
            ->where('status', 'active')
            ->whereNotNull('industry_id')
            ->with('industry')
            ->get()
            ->pluck('industry')
            ->unique('id')
            ->sortBy('name')
            ->values();
    }

    /**
     * Update community statistics
     */
    public function updateCommunityStats(AlphaSiteCommunity $community): void
    {
        $stats = Business::query()
            ->where('city', $community->city)
            ->where('state', $community->state)
            ->where('status', 'active')
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN subscription_tier IN ('premium', 'enterprise') THEN 1 ELSE 0 END) as premium,
                COUNT(DISTINCT industry_id) as categories
            ")
            ->first();

        $community->update([
            'total_businesses' => $stats->total,
            'premium_businesses' => $stats->premium,
            'total_categories' => $stats->categories,
        ]);
    }
}

