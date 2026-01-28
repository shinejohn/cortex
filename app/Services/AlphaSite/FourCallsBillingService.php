<?php

declare(strict_types=1);

namespace App\Services\AlphaSite;

use App\Models\Business;
use App\Models\BusinessSubscription;
use App\Models\AlphaSiteFourCallsIntegration;
use App\Services\AlphaSite\FourCallsIntegrationService;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;
use Stripe\Exception\ApiErrorException;

/**
 * Service for managing 4calls.ai service subscriptions and billing
 */
final class FourCallsBillingService
{
    private StripeClient $stripe;
    private FourCallsIntegrationService $integrationService;

    public function __construct(
        FourCallsIntegrationService $integrationService
    ) {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
        $this->integrationService = $integrationService;
    }

    /**
     * Subscribe a business to a 4calls.ai service package
     */
    public function subscribe(
        Business $business,
        string $packageSlug,
        string $paymentMethodId,
        ?string $customerEmail = null
    ): array {
        $package = config("fourcalls.packages.{$packageSlug}");
        
        if (!$package) {
            throw new \InvalidArgumentException("Invalid package: {$packageSlug}");
        }

        // Get or create Stripe customer
        $subscription = $business->subscription;
        $stripeCustomerId = $subscription?->stripe_customer_id;
        
        if (!$stripeCustomerId) {
            $stripeCustomer = $this->createStripeCustomer($business, $customerEmail);
            $stripeCustomerId = $stripeCustomer->id;
        }

        // Attach payment method to customer
        $this->stripe->paymentMethods->attach($paymentMethodId, [
            'customer' => $stripeCustomerId,
        ]);

        // Set as default payment method
        $this->stripe->customers->update($stripeCustomerId, [
            'invoice_settings' => [
                'default_payment_method' => $paymentMethodId,
            ],
        ]);

        // Create or update Stripe subscription
        $stripePriceId = $package['stripe_price_id'];
        
        if (!$stripePriceId) {
            throw new \Exception("Stripe price ID not configured for package: {$packageSlug}");
        }

        if ($subscription?->stripe_subscription_id) {
            // Update existing subscription
            $stripeSubscription = $this->stripe->subscriptions->update(
                $subscription->stripe_subscription_id,
                [
                    'items' => [[
                        'id' => $subscription->stripe_subscription_id,
                        'price' => $stripePriceId,
                    ]],
                    'proration_behavior' => 'create_prorations',
                ]
            );
        } else {
            // Create new subscription
            $stripeSubscription = $this->stripe->subscriptions->create([
                'customer' => $stripeCustomerId,
                'items' => [[
                    'price' => $stripePriceId,
                ]],
                'payment_behavior' => 'default_incomplete',
                'payment_settings' => [
                    'save_default_payment_method' => 'on_subscription',
                ],
                'expand' => ['latest_invoice.payment_intent'],
                'metadata' => [
                    'business_id' => $business->id,
                    'package_slug' => $packageSlug,
                ],
            ]);
        }

        // Provision the 4calls.ai service
        $integration = $this->integrationService->provisionService($business, $packageSlug);

        // Update or create business subscription
        if ($subscription) {
            $subscription->update([
                'tier' => $packageSlug,
                'status' => 'active',
                'stripe_subscription_id' => $stripeSubscription->id,
                'stripe_customer_id' => $stripeCustomerId,
                'monthly_amount' => $package['monthly_price'],
                'billing_cycle' => 'monthly',
                'subscription_started_at' => now(),
                'subscription_expires_at' => now()->addMonth(),
                'auto_renew' => true,
                'ai_services_enabled' => array_merge(
                    $subscription->ai_services_enabled ?? [],
                    ['fourcalls_' . $packageSlug]
                ),
            ]);
        } else {
            BusinessSubscription::create([
                'business_id' => $business->id,
                'tier' => $packageSlug,
                'status' => 'active',
                'stripe_subscription_id' => $stripeSubscription->id,
                'stripe_customer_id' => $stripeCustomerId,
                'monthly_amount' => $package['monthly_price'],
                'billing_cycle' => 'monthly',
                'subscription_started_at' => now(),
                'subscription_expires_at' => now()->addMonth(),
                'auto_renew' => true,
                'ai_services_enabled' => ['fourcalls_' . $packageSlug],
            ]);
        }

        return [
            'subscription_id' => $stripeSubscription->id,
            'integration_id' => $integration->id,
            'client_secret' => $stripeSubscription->latest_invoice->payment_intent->client_secret ?? null,
            'status' => $stripeSubscription->status,
        ];
    }

    /**
     * Upgrade or downgrade subscription package
     */
    public function changePackage(
        Business $business,
        string $newPackageSlug,
        ?string $paymentMethodId = null
    ): array {
        $subscription = $business->subscription;
        
        if (!$subscription || !$subscription->stripe_subscription_id) {
            throw new \Exception('No active subscription found');
        }

        $newPackage = config("fourcalls.packages.{$newPackageSlug}");
        
        if (!$newPackage) {
            throw new \InvalidArgumentException("Invalid package: {$newPackageSlug}");
        }

        // Update payment method if provided
        if ($paymentMethodId) {
            $this->stripe->paymentMethods->attach($paymentMethodId, [
                'customer' => $subscription->stripe_customer_id,
            ]);
            
            $this->stripe->customers->update($subscription->stripe_customer_id, [
                'invoice_settings' => [
                    'default_payment_method' => $paymentMethodId,
                ],
            ]);
        }

        // Update Stripe subscription
        $stripePriceId = $newPackage['stripe_price_id'];
        
        $stripeSubscription = $this->stripe->subscriptions->retrieve($subscription->stripe_subscription_id);
        $subscriptionItemId = $stripeSubscription->items->data[0]->id;

        $this->stripe->subscriptions->update($subscription->stripe_subscription_id, [
            'items' => [[
                'id' => $subscriptionItemId,
                'price' => $stripePriceId,
            ]],
            'proration_behavior' => 'create_prorations',
            'metadata' => [
                'business_id' => $business->id,
                'package_slug' => $newPackageSlug,
            ],
        ]);

        // Update 4calls.ai service package
        $integration = $this->integrationService->changeServicePackage($business, $newPackageSlug);

        // Update business subscription
        $subscription->update([
            'tier' => $newPackageSlug,
            'monthly_amount' => $newPackage['monthly_price'],
            'subscription_expires_at' => now()->addMonth(),
        ]);

        return [
            'subscription_id' => $subscription->stripe_subscription_id,
            'integration_id' => $integration->id,
            'status' => 'updated',
        ];
    }

    /**
     * Cancel subscription
     */
    public function cancel(Business $business, bool $immediate = false): bool
    {
        $subscription = $business->subscription;
        
        if (!$subscription || !$subscription->stripe_subscription_id) {
            return false;
        }

        try {
            if ($immediate) {
                // Cancel immediately
                $this->stripe->subscriptions->cancel($subscription->stripe_subscription_id);
                $subscription->update([
                    'status' => 'cancelled',
                    'subscription_expires_at' => now(),
                ]);
                
                // Deprovision service immediately
                $this->integrationService->deprovisionService($business);
            } else {
                // Cancel at period end
                $this->stripe->subscriptions->update($subscription->stripe_subscription_id, [
                    'cancel_at_period_end' => true,
                ]);
                $subscription->update([
                    'auto_renew' => false,
                ]);
            }

            return true;
        } catch (ApiErrorException $e) {
            Log::error('Failed to cancel Stripe subscription', [
                'business_id' => $business->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Resume a cancelled subscription
     */
    public function resume(Business $business): bool
    {
        $subscription = $business->subscription;
        
        if (!$subscription || !$subscription->stripe_subscription_id) {
            return false;
        }

        try {
            $this->stripe->subscriptions->update($subscription->stripe_subscription_id, [
                'cancel_at_period_end' => false,
            ]);

            $subscription->update([
                'status' => 'active',
                'auto_renew' => true,
            ]);

            return true;
        } catch (ApiErrorException $e) {
            Log::error('Failed to resume Stripe subscription', [
                'business_id' => $business->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Get subscription details
     */
    public function getSubscriptionDetails(Business $business): ?array
    {
        $subscription = $business->subscription;
        
        if (!$subscription || !$subscription->stripe_subscription_id) {
            return null;
        }

        try {
            $stripeSubscription = $this->stripe->subscriptions->retrieve(
                $subscription->stripe_subscription_id,
                ['expand' => ['latest_invoice', 'customer']]
            );

            $integration = AlphaSiteFourCallsIntegration::where('business_id', $business->id)->first();

            return [
                'id' => $subscription->id,
                'stripe_subscription_id' => $stripeSubscription->id,
                'status' => $stripeSubscription->status,
                'package' => $subscription->tier,
                'package_name' => config("fourcalls.packages.{$subscription->tier}.name"),
                'monthly_amount' => $subscription->monthly_amount,
                'current_period_start' => $stripeSubscription->current_period_start,
                'current_period_end' => $stripeSubscription->current_period_end,
                'cancel_at_period_end' => $stripeSubscription->cancel_at_period_end,
                'integration_status' => $integration?->status,
                'integration_package' => $integration?->service_package,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Failed to retrieve Stripe subscription', [
                'business_id' => $business->id,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Handle Stripe webhook events
     */
    public function handleWebhook(array $eventData): void
    {
        $eventType = $eventData['type'];
        $subscriptionData = $eventData['data']['object'];

        $businessId = $subscriptionData['metadata']['business_id'] ?? null;
        
        if (!$businessId) {
            Log::warning('Stripe webhook missing business_id', ['event' => $eventType]);
            return;
        }

        $business = Business::find($businessId);
        
        if (!$business) {
            Log::warning('Business not found for Stripe webhook', [
                'event' => $eventType,
                'business_id' => $businessId,
            ]);
            return;
        }

        $subscription = $business->subscription;
        
        if (!$subscription) {
            Log::warning('Subscription not found for Stripe webhook', [
                'event' => $eventType,
                'business_id' => $businessId,
            ]);
            return;
        }

        switch ($eventType) {
            case 'customer.subscription.updated':
                $this->handleSubscriptionUpdated($subscription, $subscriptionData);
                break;
                
            case 'customer.subscription.deleted':
                $this->handleSubscriptionDeleted($subscription, $subscriptionData);
                break;
                
            case 'invoice.payment_succeeded':
                $this->handlePaymentSucceeded($subscription, $subscriptionData);
                break;
                
            case 'invoice.payment_failed':
                $this->handlePaymentFailed($subscription, $subscriptionData);
                break;
        }
    }

    /**
     * Create Stripe customer
     */
    private function createStripeCustomer(Business $business, ?string $email = null): \Stripe\Customer
    {
        return $this->stripe->customers->create([
            'email' => $email ?? $business->email,
            'name' => $business->name,
            'phone' => $business->phone,
            'metadata' => [
                'business_id' => $business->id,
                'business_slug' => $business->slug,
            ],
        ]);
    }

    /**
     * Handle subscription updated webhook
     */
    private function handleSubscriptionUpdated(BusinessSubscription $subscription, array $data): void
    {
        $subscription->update([
            'status' => $data['status'],
            'subscription_expires_at' => $data['current_period_end'] 
                ? \Carbon\Carbon::createFromTimestamp($data['current_period_end'])
                : null,
            'auto_renew' => !($data['cancel_at_period_end'] ?? false),
        ]);

        // If subscription was cancelled, update integration status
        if ($data['status'] === 'canceled' || ($data['cancel_at_period_end'] ?? false)) {
            $integration = AlphaSiteFourCallsIntegration::where('business_id', $subscription->business_id)->first();
            if ($integration) {
                $integration->update(['status' => 'suspended']);
            }
        }
    }

    /**
     * Handle subscription deleted webhook
     */
    private function handleSubscriptionDeleted(BusinessSubscription $subscription, array $data): void
    {
        $subscription->update([
            'status' => 'cancelled',
            'subscription_expires_at' => now(),
            'auto_renew' => false,
        ]);

        // Deprovision service
        $this->integrationService->deprovisionService($subscription->business);
    }

    /**
     * Handle payment succeeded webhook
     */
    private function handlePaymentSucceeded(BusinessSubscription $subscription, array $data): void
    {
        $subscription->update([
            'status' => 'active',
            'subscription_expires_at' => $data['period_end'] 
                ? \Carbon\Carbon::createFromTimestamp($data['period_end'])
                : now()->addMonth(),
        ]);

        // Ensure integration is active
        $integration = AlphaSiteFourCallsIntegration::where('business_id', $subscription->business_id)->first();
        if ($integration && $integration->status !== 'active') {
            $integration->update(['status' => 'active']);
        }
    }

    /**
     * Handle payment failed webhook
     */
    private function handlePaymentFailed(BusinessSubscription $subscription, array $data): void
    {
        $subscription->update([
            'status' => 'past_due',
        ]);

        // Suspend integration
        $integration = AlphaSiteFourCallsIntegration::where('business_id', $subscription->business_id)->first();
        if ($integration) {
            $integration->update(['status' => 'suspended']);
        }
    }
}



