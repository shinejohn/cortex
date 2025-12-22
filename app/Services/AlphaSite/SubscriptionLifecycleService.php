<?php

declare(strict_types=1);

namespace App\Services\AlphaSite;

use App\Models\Business;
use App\Models\BusinessSubscription;
use Carbon\Carbon;

/**
 * Manages the 90-day trial lifecycle and subscription states
 */
final class SubscriptionLifecycleService
{
    /**
     * Initialize a new business with a 90-day trial
     */
    public function initializeTrial(Business $business): BusinessSubscription
    {
        return BusinessSubscription::create([
            'business_id' => $business->id,
            'tier' => 'trial',
            'status' => 'active',
            'trial_started_at' => now(),
            'trial_expires_at' => now()->addDays(90),
            'ai_services_enabled' => ['concierge'], // Basic AI during trial
        ]);
    }

    /**
     * Check and process expired trials (run via scheduled job)
     */
    public function processExpiredTrials(): int
    {
        $expiredTrials = BusinessSubscription::where('tier', 'trial')
            ->where('status', 'active')
            ->where('trial_expires_at', '<', now())
            ->whereNull('trial_converted_at')
            ->get();

        foreach ($expiredTrials as $subscription) {
            $this->downgradeToBasic($subscription);
        }

        return $expiredTrials->count();
    }

    /**
     * Downgrade a business to basic state
     */
    public function downgradeToBasic(BusinessSubscription $subscription): void
    {
        $subscription->update([
            'tier' => 'basic',
            'status' => 'expired',
            'downgraded_at' => now(),
            'ai_services_enabled' => [],
        ]);

        // Update business to basic display state
        $subscription->business->update([
            'subscription_tier' => 'basic',
            'ai_services_enabled' => false,
        ]);

        // Clear cached premium content
        $this->clearPremiumContent($subscription->business);
    }

    /**
     * Convert trial to paid subscription
     */
    public function convertToPaid(
        BusinessSubscription $subscription,
        string $tier,
        string $stripeSubscriptionId,
        array $aiServices = []
    ): void {
        $subscription->update([
            'tier' => $tier,
            'status' => 'active',
            'trial_converted_at' => now(),
            'subscription_started_at' => now(),
            'subscription_expires_at' => now()->addMonth(),
            'stripe_subscription_id' => $stripeSubscriptionId,
            'ai_services_enabled' => $aiServices,
        ]);

        $subscription->business->update([
            'subscription_tier' => $tier,
            'ai_services_enabled' => true,
            'claimed_at' => now(),
        ]);
    }

    /**
     * Upgrade subscription and add AI services
     */
    public function addAIService(BusinessSubscription $subscription, string $service): void
    {
        $currentServices = $subscription->ai_services_enabled ?? [];
        
        if (!in_array($service, $currentServices)) {
            $currentServices[] = $service;
            $subscription->update([
                'ai_services_enabled' => $currentServices,
            ]);
        }
    }

    /**
     * Get the display state for a business
     */
    public function getDisplayState(Business $business): string
    {
        $subscription = $business->subscription;

        if (!$subscription) {
            return 'basic';
        }

        // Active trial within 90 days
        if ($subscription->tier === 'trial' && 
            $subscription->status === 'active' &&
            $subscription->trial_expires_at > now()) {
            return 'premiere';
        }

        // Paid subscription
        if (in_array($subscription->tier, ['standard', 'premium', 'enterprise']) &&
            $subscription->status === 'active') {
            return 'premium';
        }

        return 'basic';
    }

    /**
     * Get days remaining in trial
     */
    public function getTrialDaysRemaining(BusinessSubscription $subscription): int
    {
        if ($subscription->tier !== 'trial') {
            return 0;
        }

        return max(0, now()->diffInDays($subscription->trial_expires_at, false));
    }

    /**
     * Clear premium content when downgrading
     */
    private function clearPremiumContent(Business $business): void
    {
        // Keep basic info, remove premium features
        $business->update([
            'homepage_content' => null,
            'seo_metadata' => $this->getBasicSeoMetadata($business),
        ]);

        // Clear caches
        cache()->forget("alphasite:business:{$business->slug}");
        cache()->forget("alphasite:business:{$business->alphasite_subdomain}");
    }

    /**
     * Get minimal SEO metadata for basic listings
     */
    private function getBasicSeoMetadata(Business $business): array
    {
        return [
            'title' => "{$business->name} - {$business->city}, {$business->state}",
            'description' => "{$business->name} located in {$business->city}, {$business->state}. Claim this business on AlphaSite.",
        ];
    }
}

