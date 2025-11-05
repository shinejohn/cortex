<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\DayNewsPostPayment;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Services\DayNewsPostService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

final class StripeWebhookController extends Controller
{
    /**
     * Handle Stripe webhook events
     */
    public function __invoke(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (SignatureVerificationException $e) {
            Log::error('Stripe webhook signature verification failed: '.$e->getMessage());

            return response()->json(['error' => 'Invalid signature'], 400);
        } catch (Exception $e) {
            Log::error('Stripe webhook error: '.$e->getMessage());

            return response()->json(['error' => 'Webhook error'], 400);
        }

        // Handle the event
        try {
            match ($event->type) {
                'account.updated' => $this->handleAccountUpdated($event->data->object),
                'checkout.session.completed' => $this->handleCheckoutSessionCompleted($event->data->object),
                'payment_intent.succeeded' => $this->handlePaymentIntentSucceeded($event->data->object),
                'payment_intent.payment_failed' => $this->handlePaymentIntentFailed($event->data->object),
                'charge.refunded' => $this->handleChargeRefunded($event->data->object),
                default => Log::info('Unhandled Stripe webhook event: '.$event->type),
            };

            return response()->json(['status' => 'success']);
        } catch (Exception $e) {
            Log::error('Error handling Stripe webhook: '.$e->getMessage(), [
                'event_type' => $event->type,
                'event_id' => $event->id,
            ]);

            return response()->json(['error' => 'Processing error'], 500);
        }
    }

    /**
     * Handle account.updated event
     */
    private function handleAccountUpdated(object $account): void
    {
        $store = Store::where('stripe_connect_id', $account->id)->first();

        if ($store) {
            $store->update([
                'stripe_charges_enabled' => $account->charges_enabled ?? false,
                'stripe_payouts_enabled' => $account->payouts_enabled ?? false,
            ]);

            Log::info('Updated store Stripe capabilities', [
                'store_id' => $store->id,
                'charges_enabled' => $account->charges_enabled,
                'payouts_enabled' => $account->payouts_enabled,
            ]);
        }
    }

    /**
     * Handle checkout.session.completed event
     */
    private function handleCheckoutSessionCompleted(object $session): void
    {
        // Check if this is a Day News post payment
        if (isset($session->metadata->payment_id)) {
            $this->handleDayNewsPayment($session);

            return;
        }

        // Otherwise, handle as ecommerce order
        $order = Order::where('stripe_payment_intent_id', $session->payment_intent)->first();

        if (! $order) {
            Log::warning('Order not found for checkout session', [
                'payment_intent' => $session->payment_intent,
            ]);

            return;
        }

        $order->update([
            'payment_status' => 'paid',
            'status' => 'processing',
            'paid_at' => now(),
        ]);

        // Reduce product inventory
        foreach ($order->items as $item) {
            if ($item->product && $item->product->track_inventory) {
                $product = $item->product;
                $product->decrement('quantity', $item->quantity);

                if ($product->quantity <= 0) {
                    $product->update(['is_active' => false]);
                }
            }
        }

        Log::info('Order marked as paid', ['order_id' => $order->id]);
    }

    /**
     * Handle payment_intent.succeeded event
     */
    private function handlePaymentIntentSucceeded(object $paymentIntent): void
    {
        $order = Order::where('stripe_payment_intent_id', $paymentIntent->id)->first();

        if ($order && $order->payment_status !== 'paid') {
            $order->update([
                'payment_status' => 'paid',
                'status' => 'processing',
                'stripe_charge_id' => $paymentIntent->charges->data[0]->id ?? null,
                'paid_at' => now(),
            ]);

            // Reduce product inventory
            foreach ($order->items as $item) {
                if ($item->product && $item->product->track_inventory) {
                    $product = $item->product;
                    $product->decrement('quantity', $item->quantity);

                    if ($product->quantity <= 0) {
                        $product->update(['is_active' => false]);
                    }
                }
            }

            Log::info('Payment succeeded', ['order_id' => $order->id]);
        }
    }

    /**
     * Handle payment_intent.payment_failed event
     */
    private function handlePaymentIntentFailed(object $paymentIntent): void
    {
        $order = Order::where('stripe_payment_intent_id', $paymentIntent->id)->first();

        if ($order) {
            $order->update([
                'payment_status' => 'failed',
                'notes' => $paymentIntent->last_payment_error->message ?? 'Payment failed',
            ]);

            Log::info('Payment failed', [
                'order_id' => $order->id,
                'error' => $paymentIntent->last_payment_error->message ?? 'Unknown error',
            ]);
        }
    }

    /**
     * Handle charge.refunded event
     */
    private function handleChargeRefunded(object $charge): void
    {
        $order = Order::where('stripe_charge_id', $charge->id)->first();

        if ($order) {
            $order->update([
                'payment_status' => 'refunded',
                'status' => 'cancelled',
            ]);

            // Restore product inventory
            foreach ($order->items as $item) {
                if ($item->product && $item->product->track_inventory) {
                    $product = $item->product;
                    $product->increment('quantity', $item->quantity);
                    $product->update(['is_active' => true]);
                }
            }

            Log::info('Order refunded', ['order_id' => $order->id]);
        }
    }

    /**
     * Handle Day News post payment
     */
    private function handleDayNewsPayment(object $session): void
    {
        $paymentId = $session->metadata->payment_id ?? null;

        if (! $paymentId) {
            Log::warning('Day News payment ID not found in session metadata', [
                'session_id' => $session->id,
            ]);

            return;
        }

        $payment = DayNewsPostPayment::find($paymentId);

        if (! $payment) {
            Log::warning('Day News payment not found', [
                'payment_id' => $paymentId,
            ]);

            return;
        }

        // Mark payment as paid
        $payment->stripe_session_id = $session->id;
        $payment->stripe_payment_intent_id = $session->payment_intent;
        $payment->markAsPaid();

        // Publish the post
        $postService = app(DayNewsPostService::class);
        $postService->publishPost($payment->post);

        Log::info('Day News post payment completed', [
            'payment_id' => $payment->id,
            'post_id' => $payment->post_id,
        ]);
    }
}
