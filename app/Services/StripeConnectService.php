<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Workspace;
use Exception;
use Log;
use Stripe\Account;
use Stripe\AccountLink;
use Stripe\Checkout\Session;
use Stripe\PaymentIntent;
use Stripe\Stripe;
use Stripe\StripeClient;

/**
 * Note: This class is not final to allow mocking in tests
 *
 * @phpstan-ignore-next-line
 */
final class StripeConnectService
{
    private StripeClient $stripe;

    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    /**
     * Create a Stripe Connect Express account for a workspace
     */
    public function createConnectAccount(Workspace $workspace): Account
    {
        $appUrl = config('app.url');

        // Only include business URL if it's not a localhost URL (Stripe rejects localhost)
        $businessProfile = ['name' => $workspace->name];
        if (! str_contains($appUrl, 'localhost') && ! str_contains($appUrl, '127.0.0.1')) {
            $businessProfile['url'] = $appUrl;
        }

        Log::info('StripeConnectService: Creating account', [
            'workspace_id' => $workspace->id,
            'email' => $workspace->owner->email,
            'name' => $workspace->name,
            'includes_url' => isset($businessProfile['url']),
        ]);

        $account = $this->stripe->accounts->create([
            'type' => 'express',
            'country' => 'US',
            'email' => $workspace->owner->email,
            'capabilities' => [
                'card_payments' => ['requested' => true],
                'transfers' => ['requested' => true],
            ],
            'business_type' => 'individual',
            'business_profile' => $businessProfile,
        ]);

        Log::info('StripeConnectService: Account created successfully', [
            'workspace_id' => $workspace->id,
            'account_id' => $account->id,
        ]);

        $workspace->update(['stripe_connect_id' => $account->id]);

        return $account;
    }

    /**
     * Create an account link for onboarding
     */
    public function createAccountLink(Workspace $workspace, string $refreshUrl, string $returnUrl): AccountLink
    {
        if (! $workspace->stripe_connect_id) {
            throw new Exception('Workspace does not have a Stripe Connect account');
        }

        Log::info('StripeConnectService: Creating account link', [
            'workspace_id' => $workspace->id,
            'account_id' => $workspace->stripe_connect_id,
            'refresh_url' => $refreshUrl,
            'return_url' => $returnUrl,
        ]);

        $accountLink = $this->stripe->accountLinks->create([
            'account' => $workspace->stripe_connect_id,
            'refresh_url' => $refreshUrl,
            'return_url' => $returnUrl,
            'type' => 'account_onboarding',
        ]);

        Log::info('StripeConnectService: Account link created successfully', [
            'workspace_id' => $workspace->id,
            'url_length' => mb_strlen($accountLink->url),
            'expires_at' => $accountLink->expires_at,
        ]);

        return $accountLink;
    }

    /**
     * Get account details
     */
    public function getAccount(string $accountId): Account
    {
        return $this->stripe->accounts->retrieve($accountId);
    }

    /**
     * Update workspace's Stripe capabilities based on account status
     * Note: stripe_charges_enabled is now controlled by admin approval, not Stripe's status
     */
    public function updateWorkspaceCapabilities(Workspace $workspace): void
    {
        if (! $workspace->stripe_connect_id) {
            return;
        }

        $account = $this->getAccount($workspace->stripe_connect_id);

        // Only update payouts_enabled from Stripe
        // charges_enabled requires admin approval via stripe_admin_approved
        $workspace->update([
            'stripe_payouts_enabled' => $account->payouts_enabled ?? false,
        ]);

        // Set stripe_charges_enabled to match Stripe's status, but it won't enable payments
        // without admin approval (stripe_admin_approved)
        $workspace->update([
            'stripe_charges_enabled' => $account->charges_enabled ?? false,
        ]);
    }

    /**
     * Create a checkout session for a workspace's products/services
     */
    public function createCheckoutSession(Workspace $workspace, array $lineItems, string $successUrl, string $cancelUrl): Session
    {
        if (! $workspace->canAcceptPayments()) {
            throw new Exception('Workspace cannot accept payments');
        }

        return $this->stripe->checkout->sessions->create([
            'mode' => 'payment',
            'line_items' => $lineItems,
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
            'payment_intent_data' => [
                'application_fee_amount' => $this->calculatePlatformFee($lineItems),
                'transfer_data' => [
                    'destination' => $workspace->stripe_connect_id,
                ],
            ],
        ]);
    }

    /**
     * Create a payment intent for direct charges
     */
    public function createPaymentIntent(Workspace $workspace, int $amount, string $currency = 'usd', array $metadata = []): PaymentIntent
    {
        if (! $workspace->canAcceptPayments()) {
            throw new Exception('Workspace cannot accept payments');
        }

        $platformFee = (int) ($amount * 0.10); // 10% platform fee

        return $this->stripe->paymentIntents->create([
            'amount' => $amount,
            'currency' => $currency,
            'application_fee_amount' => $platformFee,
            'transfer_data' => [
                'destination' => $workspace->stripe_connect_id,
            ],
            'metadata' => $metadata,
        ]);
    }

    /**
     * Create a product in Stripe
     */
    public function createProduct(Workspace $workspace, string $name, ?string $description = null): \Stripe\Product
    {
        if (! $workspace->stripe_connect_id) {
            throw new Exception('Workspace does not have a Stripe Connect account');
        }

        return $this->stripe->products->create([
            'name' => $name,
            'description' => $description,
        ], [
            'stripe_account' => $workspace->stripe_connect_id,
        ]);
    }

    /**
     * Create a price for a product in Stripe
     */
    public function createPrice(Workspace $workspace, string $productId, int $unitAmount, string $currency = 'usd'): \Stripe\Price
    {
        if (! $workspace->stripe_connect_id) {
            throw new Exception('Workspace does not have a Stripe Connect account');
        }

        return $this->stripe->prices->create([
            'product' => $productId,
            'unit_amount' => $unitAmount,
            'currency' => $currency,
        ], [
            'stripe_account' => $workspace->stripe_connect_id,
        ]);
    }

    /**
     * Create a dashboard login link for the connected account
     */
    public function createDashboardLink(Workspace $workspace): string
    {
        if (! $workspace->stripe_connect_id) {
            throw new Exception('Workspace does not have a Stripe Connect account');
        }

        $loginLink = $this->stripe->accounts->createLoginLink($workspace->stripe_connect_id);

        return $loginLink->url;
    }

    /**
     * Create an onboarding session (account + account link)
     */
    public function createOnboardingSession(Workspace $workspace, string $refreshUrl, string $returnUrl): string
    {
        // Create account if it doesn't exist
        if (! $workspace->stripe_connect_id) {
            $this->createConnectAccount($workspace);
            $workspace->refresh();
        }

        // Create account link for onboarding
        $accountLink = $this->createAccountLink($workspace, $refreshUrl, $returnUrl);

        return $accountLink->url;
    }

    /**
     * Handle return from Stripe onboarding
     */
    public function handleOnboardingReturn(Workspace $workspace): void
    {
        // Update workspace capabilities based on current account status
        $this->updateWorkspaceCapabilities($workspace);
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
