<?php

declare(strict_types=1);

namespace App\Services\AlphaSite;

use App\Models\Business;
use App\Models\BusinessSubscription;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Customer;
use Stripe\StripeClient;

final class StripeService
{
    private StripeClient $stripe;

    public function __construct()
    {
        $secret = config('stripe.secret') ?? config('services.stripe.secret');
        $this->stripe = new StripeClient($secret);
    }

    public function createCustomer(User $user, Business $business): Customer
    {
        return $this->stripe->customers->create([
            'email' => $user->email,
            'name' => $user->name,
            'metadata' => [
                'business_id' => $business->id,
                'user_id' => $user->id,
            ],
        ]);
    }

    public function createCheckoutSession(
        Business $business,
        string $tier,
        string $billingCycle,
        string $successUrl,
        string $cancelUrl,
        ?string $customerEmail = null
    ): StripeSession {
        $priceId = $billingCycle === 'annual'
            ? config("stripe.products.{$tier}.price_annual")
            : config("stripe.products.{$tier}.price_monthly");

        if (empty($priceId)) {
            $priceId = $this->getOrCreatePriceId($tier, $billingCycle);
        }

        $params = [
            'mode' => 'subscription',
            'line_items' => [
                [
                    'price' => $priceId,
                    'quantity' => 1,
                ],
            ],
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
            'metadata' => [
                'business_id' => $business->id,
            ],
            'subscription_data' => [
                'metadata' => [
                    'business_id' => $business->id,
                ],
            ],
        ];

        if ($customerEmail) {
            $params['customer_email'] = $customerEmail;
        }

        $subscription = $business->subscription;
        if ($subscription?->stripe_customer_id) {
            $params['customer'] = $subscription->stripe_customer_id;
            unset($params['customer_email']);
        }

        return $this->stripe->checkout->sessions->create($params);
    }

    public function handleCheckoutCompleted(object $session): void
    {
        $subscriptionId = $session->subscription ?? null;
        if (! $subscriptionId) {
            Log::warning('Stripe checkout completed without subscription', ['session_id' => $session->id]);

            return;
        }

        $businessId = $session->metadata->business_id ?? $session->subscription_data->metadata->business_id ?? null;
        if (! $businessId) {
            Log::warning('Stripe checkout completed without business_id in metadata', ['session_id' => $session->id]);

            return;
        }

        $subscription = $this->stripe->subscriptions->retrieve($subscriptionId, ['expand' => ['items.data.price.product']]);
        $business = Business::find($businessId);
        if (! $business) {
            Log::warning('Business not found for checkout', ['business_id' => $businessId]);

            return;
        }

        $businessSubscription = BusinessSubscription::firstOrCreate(
            ['business_id' => $business->id],
            [
                'tier' => 'trial',
                'status' => 'active',
                'trial_started_at' => now(),
                'trial_expires_at' => now()->addDays(config('stripe.trial_days', 90)),
            ]
        );

        $tier = $this->inferTierFromStripeSubscription($subscription);
        $aiServices = config("stripe.products.{$tier}.ai_services", ['concierge']);

        app(SubscriptionLifecycleService::class)->convertToPaid(
            $businessSubscription,
            $tier,
            $subscription->id,
            $aiServices
        );

        $businessSubscription->update([
            'stripe_customer_id' => $subscription->customer,
        ]);
    }

    public function handleSubscriptionUpdated(object $stripeSubscription): void
    {
        $subscription = BusinessSubscription::where('stripe_subscription_id', $stripeSubscription->id)->first();
        if (! $subscription) {
            return;
        }

        $status = $stripeSubscription->status;
        if (in_array($status, ['canceled', 'unpaid', 'past_due'], true)) {
            app(SubscriptionLifecycleService::class)->downgradeToBasic($subscription);

            return;
        }

        if ($status === 'active') {
            $tier = $this->inferTierFromStripeSubscription($stripeSubscription);
            $aiServices = config("stripe.products.{$tier}.ai_services", ['concierge']);
            $subscription->update([
                'tier' => $tier,
                'status' => 'active',
                'ai_services_enabled' => $aiServices,
                'subscription_expires_at' => $stripeSubscription->current_period_end
                    ? \Carbon\Carbon::createFromTimestamp($stripeSubscription->current_period_end)
                    : null,
            ]);
            $subscription->business->update([
                'subscription_tier' => $tier,
                'ai_services_enabled' => true,
            ]);
        }
    }

    public function handleSubscriptionDeleted(object $stripeSubscription): void
    {
        $subscription = BusinessSubscription::where('stripe_subscription_id', $stripeSubscription->id)->first();
        if ($subscription) {
            app(SubscriptionLifecycleService::class)->downgradeToBasic($subscription);
        }
    }

    public function handleInvoiceFailed(object $invoice): void
    {
        $subscriptionId = $invoice->subscription ?? null;
        if (! $subscriptionId) {
            return;
        }

        $subscription = BusinessSubscription::where('stripe_subscription_id', $subscriptionId)->first();
        if ($subscription) {
            Log::warning('AlphaSite invoice payment failed', [
                'subscription_id' => $subscription->id,
                'business_id' => $subscription->business_id,
                'invoice_id' => $invoice->id,
            ]);
            // Optionally: send dunning email, retry logic, etc.
        }
    }

    public function cancelSubscription(BusinessSubscription $subscription): void
    {
        if (! $subscription->stripe_subscription_id) {
            return;
        }

        $this->stripe->subscriptions->cancel($subscription->stripe_subscription_id);
        $subscription->update(['status' => 'canceled']);
    }

    public function resumeSubscription(BusinessSubscription $subscription): void
    {
        if (! $subscription->stripe_subscription_id) {
            return;
        }

        $this->stripe->subscriptions->update($subscription->stripe_subscription_id, ['cancel_at_period_end' => false]);
        $subscription->update(['status' => 'active']);
    }

    public function changeTier(BusinessSubscription $subscription, string $newTier): void
    {
        if (! $subscription->stripe_subscription_id) {
            return;
        }

        $priceId = config("stripe.products.{$newTier}.price_monthly");
        if (empty($priceId)) {
            $priceId = $this->getOrCreatePriceId($newTier, 'monthly');
        }

        $stripeSub = $this->stripe->subscriptions->retrieve($subscription->stripe_subscription_id);
        $itemId = $stripeSub->items->data[0]->id ?? null;
        if (! $itemId) {
            return;
        }

        $this->stripe->subscriptions->update($subscription->stripe_subscription_id, [
            'items' => [
                ['id' => $itemId, 'price' => $priceId],
            ],
            'proration_behavior' => 'create_prorations',
        ]);

        $aiServices = config("stripe.products.{$newTier}.ai_services", ['concierge']);
        $subscription->update([
            'tier' => $newTier,
            'ai_services_enabled' => $aiServices,
        ]);
        $subscription->business->update(['subscription_tier' => $newTier]);
    }

    public function getPortalUrl(Business $business, string $returnUrl): string
    {
        $subscription = $business->subscription;
        $customerId = $subscription?->stripe_customer_id;
        if (! $customerId) {
            throw new RuntimeException('No Stripe customer for this business.');
        }

        $session = $this->stripe->billingPortal->sessions->create([
            'customer' => $customerId,
            'return_url' => $returnUrl,
        ]);

        return $session->url;
    }

    private function inferTierFromStripeSubscription(object $stripeSubscription): string
    {
        $priceId = $stripeSubscription->items->data[0]->price->id ?? null;
        if (! $priceId) {
            return 'standard';
        }

        foreach (['enterprise', 'premium', 'standard'] as $tier) {
            $monthly = config("stripe.products.{$tier}.price_monthly");
            $annual = config("stripe.products.{$tier}.price_annual");
            if ($priceId === $monthly || $priceId === $annual) {
                return $tier;
            }
        }

        return 'standard';
    }

    private function getOrCreatePriceId(string $tier, string $billingCycle): string
    {
        $productConfig = config("stripe.products.{$tier}");
        $amount = $productConfig['amount'] ?? 9900;
        if ($billingCycle === 'annual') {
            $amount = (int) ($amount * 10); // 2 months free
        }

        $product = $this->stripe->products->create([
            'name' => $productConfig['name'] ?? "AlphaSite {$tier}",
        ]);

        $price = $this->stripe->prices->create([
            'product' => $product->id,
            'unit_amount' => $amount,
            'currency' => 'usd',
            'recurring' => [
                'interval' => $billingCycle === 'annual' ? 'year' : 'month',
            ],
        ]);

        return $price->id;
    }
}
