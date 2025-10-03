<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Store;
use Exception;
use Log;
use stdClass;
use Stripe\Account;
use Stripe\AccountLink;
use Stripe\Checkout\Session;
use Stripe\PaymentIntent;
use Stripe\Stripe;
use Stripe\StripeClient;

final class StripeConnectService
{
    private StripeClient $stripe;

    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    /**
     * Create a Stripe Connect Express account for a store
     */
    public function createConnectAccount(Store $store): Account|stdClass
    {
        // Mock mode for development when platform account doesn't support Connect
        if (config('services.stripe.mock_connect')) {
            Log::info('StripeConnectService: Creating MOCK account (mock mode enabled)', [
                'store_id' => $store->id,
            ]);

            $mockAccountId = 'acct_mock_'.bin2hex(random_bytes(8));
            $store->update([
                'stripe_connect_id' => $mockAccountId,
                'stripe_charges_enabled' => true,
                'stripe_payouts_enabled' => true,
            ]);

            // Return a mock account object
            $mockAccount = new stdClass();
            $mockAccount->id = $mockAccountId;
            $mockAccount->type = 'express';
            $mockAccount->country = 'US';

            return $mockAccount;
        }

        $appUrl = config('app.url');
        $storeUrl = url('/stores/'.$store->slug);

        // Only include business URL if it's not a localhost URL (Stripe rejects localhost)
        $businessProfile = ['name' => $store->name];
        if (! str_contains($appUrl, 'localhost') && ! str_contains($appUrl, '127.0.0.1')) {
            $businessProfile['url'] = $storeUrl;
        }

        Log::info('StripeConnectService: Creating account', [
            'store_id' => $store->id,
            'email' => $store->workspace->owner->email,
            'business_name' => $store->name,
            'includes_url' => isset($businessProfile['url']),
        ]);

        $account = $this->stripe->accounts->create([
            'type' => 'express',
            'country' => 'US',
            'email' => $store->workspace->owner->email,
            'capabilities' => [
                'card_payments' => ['requested' => true],
                'transfers' => ['requested' => true],
            ],
            'business_type' => 'company',
            'business_profile' => $businessProfile,
        ]);

        Log::info('StripeConnectService: Account created successfully', [
            'store_id' => $store->id,
            'account_id' => $account->id,
        ]);

        $store->update(['stripe_connect_id' => $account->id]);

        return $account;
    }

    /**
     * Create an account link for onboarding
     */
    public function createAccountLink(Store $store, string $refreshUrl, string $returnUrl): AccountLink|stdClass
    {
        if (! $store->stripe_connect_id) {
            throw new Exception('Store does not have a Stripe Connect account');
        }

        // Mock mode - skip account link creation and return directly to return URL
        if (config('services.stripe.mock_connect')) {
            Log::info('StripeConnectService: Skipping account link (mock mode enabled)', [
                'store_id' => $store->id,
                'will_redirect_to' => $returnUrl,
            ]);

            // Return a mock account link that redirects to return URL
            $mockLink = new stdClass();
            $mockLink->url = $returnUrl;
            $mockLink->created = time();
            $mockLink->expires_at = time() + 300; // 5 minutes

            return $mockLink;
        }

        Log::info('StripeConnectService: Creating account link', [
            'store_id' => $store->id,
            'account_id' => $store->stripe_connect_id,
            'refresh_url' => $refreshUrl,
            'return_url' => $returnUrl,
        ]);

        $accountLink = $this->stripe->accountLinks->create([
            'account' => $store->stripe_connect_id,
            'refresh_url' => $refreshUrl,
            'return_url' => $returnUrl,
            'type' => 'account_onboarding',
        ]);

        Log::info('StripeConnectService: Account link created successfully', [
            'store_id' => $store->id,
            'url_length' => mb_strlen($accountLink->url),
            'expires_at' => $accountLink->expires_at,
        ]);

        return $accountLink;
    }

    /**
     * Get account details
     */
    public function getAccount(string $accountId): Account|stdClass
    {
        // Mock mode - return mock account for mock IDs
        if (config('services.stripe.mock_connect') && str_starts_with($accountId, 'acct_mock_')) {
            $mockAccount = new stdClass();
            $mockAccount->id = $accountId;
            $mockAccount->type = 'express';
            $mockAccount->country = 'US';
            $mockAccount->charges_enabled = true;
            $mockAccount->payouts_enabled = true;

            return $mockAccount;
        }

        return $this->stripe->accounts->retrieve($accountId);
    }

    /**
     * Update store's Stripe capabilities based on account status
     */
    public function updateStoreCapabilities(Store $store): void
    {
        if (! $store->stripe_connect_id) {
            return;
        }

        $account = $this->getAccount($store->stripe_connect_id);

        $store->update([
            'stripe_charges_enabled' => $account->charges_enabled ?? false,
            'stripe_payouts_enabled' => $account->payouts_enabled ?? false,
        ]);
    }

    /**
     * Create a checkout session for a store's products
     */
    public function createCheckoutSession(Store $store, array $lineItems, string $successUrl, string $cancelUrl): Session
    {
        if (! $store->canAcceptPayments()) {
            throw new Exception('Store cannot accept payments');
        }

        return $this->stripe->checkout->sessions->create([
            'mode' => 'payment',
            'line_items' => $lineItems,
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
            'payment_intent_data' => [
                'application_fee_amount' => $this->calculatePlatformFee($lineItems),
                'transfer_data' => [
                    'destination' => $store->stripe_connect_id,
                ],
            ],
        ]);
    }

    /**
     * Create a payment intent for direct charges
     */
    public function createPaymentIntent(Store $store, int $amount, string $currency = 'usd', array $metadata = []): PaymentIntent
    {
        if (! $store->canAcceptPayments()) {
            throw new Exception('Store cannot accept payments');
        }

        $platformFee = (int) ($amount * 0.10); // 10% platform fee

        return $this->stripe->paymentIntents->create([
            'amount' => $amount,
            'currency' => $currency,
            'application_fee_amount' => $platformFee,
            'transfer_data' => [
                'destination' => $store->stripe_connect_id,
            ],
            'metadata' => $metadata,
        ]);
    }

    /**
     * Create a product in Stripe
     */
    public function createProduct(Store $store, string $name, ?string $description = null): \Stripe\Product
    {
        if (! $store->stripe_connect_id) {
            throw new Exception('Store does not have a Stripe Connect account');
        }

        return $this->stripe->products->create([
            'name' => $name,
            'description' => $description,
        ], [
            'stripe_account' => $store->stripe_connect_id,
        ]);
    }

    /**
     * Create a price for a product in Stripe
     */
    public function createPrice(Store $store, string $productId, int $unitAmount, string $currency = 'usd'): \Stripe\Price
    {
        if (! $store->stripe_connect_id) {
            throw new Exception('Store does not have a Stripe Connect account');
        }

        return $this->stripe->prices->create([
            'product' => $productId,
            'unit_amount' => $unitAmount,
            'currency' => $currency,
        ], [
            'stripe_account' => $store->stripe_connect_id,
        ]);
    }

    /**
     * Create a dashboard login link for the connected account
     */
    public function createDashboardLink(Store $store): string
    {
        if (! $store->stripe_connect_id) {
            throw new Exception('Store does not have a Stripe Connect account');
        }

        $loginLink = $this->stripe->accounts->createLoginLink($store->stripe_connect_id);

        return $loginLink->url;
    }

    /**
     * Calculate platform fee (10% of total)
     */
    private function calculatePlatformFee(array $lineItems): int
    {
        $total = 0;
        foreach ($lineItems as $item) {
            $total += $item['price_data']['unit_amount'] * $item['quantity'];
        }

        return (int) ($total * 0.10);
    }
}
