<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Classified;
use App\Models\ClassifiedPayment;
use App\Models\DayNewsPost;
use App\Models\DayNewsPostPayment;
use App\Models\Workspace;
use Exception;
use Stripe\Checkout\Session;
use Stripe\Stripe;
use Stripe\StripeClient;

final class DayNewsPaymentService
{
    private StripeClient $stripe;

    public function __construct(
        private readonly DayNewsPostService $postService
    ) {
        Stripe::setApiKey(config('services.stripe.secret'));
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    public function createCheckoutSession(DayNewsPost $post, Workspace $workspace, string $successUrl, string $cancelUrl): Session
    {
        $amount = $this->postService->calculateCost($post->type, $post->metadata['ad_days'] ?? null);

        $payment = DayNewsPostPayment::create([
            'post_id' => $post->id,
            'workspace_id' => $workspace->id,
            'amount' => $amount,
            'currency' => 'usd',
            'status' => 'pending',
            'payment_type' => $post->type === 'ad' ? 'ad' : 'post',
            'ad_days' => $post->metadata['ad_days'] ?? null,
        ]);

        $session = $this->stripe->checkout->sessions->create([
            'mode' => 'payment',
            'line_items' => [
                [
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => $this->getProductName($post),
                            'description' => $this->getProductDescription($post),
                        ],
                        'unit_amount' => $amount,
                    ],
                    'quantity' => 1,
                ],
            ],
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
            'metadata' => [
                'post_id' => $post->id,
                'payment_id' => $payment->id,
                'workspace_id' => $workspace->id,
            ],
        ]);

        $payment->update(['stripe_checkout_session_id' => $session->id]);

        return $session;
    }

    public function handleSuccessfulPayment(string $sessionId): DayNewsPost
    {
        $session = $this->stripe->checkout->sessions->retrieve($sessionId);

        $payment = DayNewsPostPayment::where('stripe_checkout_session_id', $sessionId)->firstOrFail();

        $payment->update([
            'stripe_payment_intent_id' => $session->payment_intent,
            'status' => 'paid',
        ]);

        $post = $payment->post;
        $this->postService->publishPost($post);

        return $post;
    }

    public function handleFailedPayment(string $intentId): void
    {
        $payment = DayNewsPostPayment::where('stripe_payment_intent_id', $intentId)->first();

        if ($payment) {
            $payment->markAsFailed();
        }
    }

    public function refundPayment(DayNewsPostPayment $payment): void
    {
        if (! $payment->isPaid() || ! $payment->stripe_payment_intent_id) {
            throw new Exception('Cannot refund payment that is not paid');
        }

        $this->stripe->refunds->create([
            'payment_intent' => $payment->stripe_payment_intent_id,
        ]);

        $payment->update(['status' => 'refunded']);

        $post = $payment->post;
        if ($post->status === 'published') {
            $post->update(['status' => 'removed']);
        }

        foreach ($post->advertisements as $ad) {
            $ad->markAsInactive();
        }
    }

    private function getProductName(DayNewsPost $post): string
    {
        return match ($post->type) {
            'ad' => 'Day News Advertisement',
            'article' => 'Day News Article',
            'announcement' => 'Day News Announcement',
            'notice' => 'Day News Notice',
            'schedule' => 'Day News Schedule',
            default => 'Day News Post',
        };
    }

    private function getProductDescription(DayNewsPost $post): string
    {
        if ($post->type === 'ad') {
            $days = $post->metadata['ad_days'] ?? 7;

            return "Advertisement for {$days} days: {$post->title}";
        }

        return "Post: {$post->title}";
    }

    /**
     * Create Stripe checkout session for classified
     */
    public function createClassifiedCheckoutSession(Classified $classified, ClassifiedPayment $payment, string $successUrl, string $cancelUrl): Session
    {
        $session = $this->stripe->checkout->sessions->create([
            'mode' => 'payment',
            'line_items' => [
                [
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => 'Classified Listing',
                            'description' => "Classified: {$classified->title}",
                        ],
                        'unit_amount' => $payment->amount,
                    ],
                    'quantity' => 1,
                ],
            ],
            'success_url' => $successUrl . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $cancelUrl,
            'metadata' => [
                'classified_id' => $classified->id,
                'payment_id' => $payment->id,
                'workspace_id' => $payment->workspace_id,
                'type' => 'classified',
            ],
        ]);

        $payment->update(['stripe_checkout_session_id' => $session->id]);

        return $session;
    }

    /**
     * Handle successful classified payment
     */
    public function handleSuccessfulClassifiedPayment(string $sessionId): Classified
    {
        $session = $this->stripe->checkout->sessions->retrieve($sessionId);

        $payment = ClassifiedPayment::where('stripe_checkout_session_id', $sessionId)->firstOrFail();

        $payment->update([
            'stripe_payment_intent_id' => $session->payment_intent,
            'status' => 'paid',
        ]);

        return $payment->classified;
    }
}
