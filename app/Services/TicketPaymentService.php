<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\TicketOrder;
use App\Services\StripeConnectService;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

final class TicketPaymentService
{
    public function __construct(
        private readonly StripeConnectService $stripeConnect
    ) {}

    public function createCheckoutSession(TicketOrder $order, string $successUrl, string $cancelUrl): \Stripe\Checkout\Session
    {
        $stripe = new StripeClient(config('services.stripe.key'));

        $lineItems = [];
        foreach ($order->items as $item) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => $item->ticketPlan->name,
                        'description' => $item->ticketPlan->description,
                    ],
                    'unit_amount' => (int) ($item->unit_price * 100),
                ],
                'quantity' => $item->quantity,
            ];
        }

        // Add fees as separate line item
        if ($order->fees > 0) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => 'Service Fee',
                    ],
                    'unit_amount' => (int) ($order->fees * 100),
                ],
                'quantity' => 1,
            ];
        }

        // Add discount as negative line item if applicable
        if ($order->discount > 0) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => 'Discount',
                    ],
                    'unit_amount' => (int) (-$order->discount * 100), // Negative amount for discount
                ],
                'quantity' => 1,
            ];
        }

        try {
            $session = $stripe->checkout->sessions->create([
                'payment_method_types' => ['card'],
                'line_items' => $lineItems,
                'mode' => 'payment',
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
                'metadata' => [
                    'ticket_order_id' => $order->id,
                    'event_id' => $order->event_id,
                    'user_id' => $order->user_id,
                ],
            ]);

            // Update order with payment intent
            $order->update([
                'payment_intent_id' => $session->payment_intent,
            ]);

            return $session;
        } catch (ApiErrorException $e) {
            throw new \Exception('Failed to create checkout session: '.$e->getMessage());
        }
    }

    public function confirmPayment(TicketOrder $order, string $paymentIntentId): bool
    {
        $stripe = new StripeClient(config('services.stripe.key'));

        try {
            $paymentIntent = $stripe->paymentIntents->retrieve($paymentIntentId);

            if ($paymentIntent->status === 'succeeded') {
                $order->update([
                    'status' => 'completed',
                    'payment_status' => 'completed',
                    'payment_intent_id' => $paymentIntentId,
                    'completed_at' => now(),
                ]);

                return true;
            }

            return false;
        } catch (ApiErrorException $e) {
            throw new \Exception('Failed to confirm payment: '.$e->getMessage());
        }
    }
}

