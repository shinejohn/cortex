<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\DayNewsPostPayment;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\TicketOrder;
use App\Notifications\TicketOrderConfirmationNotification;
use App\Services\DayNewsPostService;
use App\Services\QRCodeService;
use App\Services\AlphaSite\FourCallsBillingService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

final class StripeWebhookController extends Controller
{
    public function __construct(
        private readonly ?FourCallsBillingService $billingService = null
    ) {}

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
                // 4calls.ai subscription events
                'customer.subscription.updated' => $this->handleSubscriptionUpdated($event->data->object),
                'customer.subscription.deleted' => $this->handleSubscriptionDeleted($event->data->object),
                'invoice.payment_succeeded' => $this->handleInvoicePaymentSucceeded($event->data->object),
                'invoice.payment_failed' => $this->handleInvoicePaymentFailed($event->data->object),
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

        // Check if this is a ticket order
        if (isset($session->metadata->ticket_order_id)) {
            $this->handleTicketOrderPayment($session);

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
        // Check for ticket order first
        $ticketOrder = TicketOrder::where('payment_intent_id', $paymentIntent->id)->first();

        if ($ticketOrder && $ticketOrder->payment_status !== 'completed') {
            DB::transaction(function () use ($ticketOrder, $paymentIntent) {
                $ticketOrder->update([
                    'status' => 'completed',
                    'payment_status' => 'completed',
                    'payment_intent_id' => $paymentIntent->id,
                    'completed_at' => now(),
                ]);

                // Generate QR codes for all ticket items
                $qrCodeService = app(QRCodeService::class);
                foreach ($ticketOrder->items as $item) {
                    if (!$item->qr_code) {
                        $qrCodeService->generateForTicketOrderItem($item);
                    }
                }

                // Send confirmation email
                $ticketOrder->user->notify(new TicketOrderConfirmationNotification($ticketOrder));

                Log::info('Ticket order payment succeeded', ['order_id' => $ticketOrder->id]);
            });

            return;
        }

        // Otherwise, handle as ecommerce order
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
        // Check for ticket order first
        $ticketOrder = TicketOrder::where('payment_intent_id', $paymentIntent->id)->first();

        if ($ticketOrder) {
            DB::transaction(function () use ($ticketOrder, $paymentIntent) {
                // Restore ticket quantities
                foreach ($ticketOrder->items as $item) {
                    $item->ticketPlan->increment('available_quantity', $item->quantity);
                }

                $ticketOrder->update([
                    'status' => 'cancelled',
                    'payment_status' => 'failed',
                ]);

                Log::info('Ticket order payment failed', [
                    'order_id' => $ticketOrder->id,
                    'error' => $paymentIntent->last_payment_error->message ?? 'Unknown error',
                ]);
            });

            return;
        }

        // Otherwise, handle as ecommerce order
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
     * Handle customer.subscription.updated event (for 4calls.ai subscriptions)
     */
    private function handleSubscriptionUpdated(object $subscription): void
    {
        // Check if this is a 4calls.ai subscription
        if (!isset($subscription->metadata->business_id) || !isset($subscription->metadata->package_slug)) {
            return;
        }

        if ($this->billingService) {
            $this->billingService->handleWebhook([
                'type' => 'customer.subscription.updated',
                'data' => ['object' => (array) $subscription],
            ]);
        }
    }

    /**
     * Handle customer.subscription.deleted event (for 4calls.ai subscriptions)
     */
    private function handleSubscriptionDeleted(object $subscription): void
    {
        // Check if this is a 4calls.ai subscription
        if (!isset($subscription->metadata->business_id) || !isset($subscription->metadata->package_slug)) {
            return;
        }

        if ($this->billingService) {
            $this->billingService->handleWebhook([
                'type' => 'customer.subscription.deleted',
                'data' => ['object' => (array) $subscription],
            ]);
        }
    }

    /**
     * Handle invoice.payment_succeeded event (for 4calls.ai subscriptions)
     */
    private function handleInvoicePaymentSucceeded(object $invoice): void
    {
        // Check if this is for a 4calls.ai subscription
        if (!isset($invoice->subscription)) {
            return;
        }

        // Get subscription to check metadata
        try {
            $subscription = \Stripe\Subscription::retrieve($invoice->subscription);
            
            if (isset($subscription->metadata->business_id) && isset($subscription->metadata->package_slug)) {
                if ($this->billingService) {
                    $this->billingService->handleWebhook([
                        'type' => 'invoice.payment_succeeded',
                        'data' => ['object' => (array) $invoice],
                    ]);
                }
            }
        } catch (Exception $e) {
            Log::error('Failed to retrieve subscription for invoice', [
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle invoice.payment_failed event (for 4calls.ai subscriptions)
     */
    private function handleInvoicePaymentFailed(object $invoice): void
    {
        // Check if this is for a 4calls.ai subscription
        if (!isset($invoice->subscription)) {
            return;
        }

        // Get subscription to check metadata
        try {
            $subscription = \Stripe\Subscription::retrieve($invoice->subscription);
            
            if (isset($subscription->metadata->business_id) && isset($subscription->metadata->package_slug)) {
                if ($this->billingService) {
                    $this->billingService->handleWebhook([
                        'type' => 'invoice.payment_failed',
                        'data' => ['object' => (array) $invoice],
                    ]);
                }
            }
        } catch (Exception $e) {
            Log::error('Failed to retrieve subscription for invoice', [
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage(),
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

    /**
     * Handle ticket order payment
     */
    private function handleTicketOrderPayment(object $session): void
    {
        $ticketOrderId = $session->metadata->ticket_order_id ?? null;

        if (! $ticketOrderId) {
            Log::warning('Ticket order ID not found in session metadata', [
                'session_id' => $session->id,
            ]);

            return;
        }

        $ticketOrder = TicketOrder::find($ticketOrderId);

        if (! $ticketOrder) {
            Log::warning('Ticket order not found', [
                'order_id' => $ticketOrderId,
            ]);

            return;
        }

        DB::transaction(function () use ($ticketOrder, $session) {
            $ticketOrder->update([
                'status' => 'completed',
                'payment_status' => 'completed',
                'payment_intent_id' => $session->payment_intent,
                'completed_at' => now(),
            ]);

            // Generate QR codes for all ticket items
            $qrCodeService = app(QRCodeService::class);
            foreach ($ticketOrder->items as $item) {
                if (!$item->qr_code) {
                    $qrCodeService->generateForTicketOrderItem($item);
                }
            }

            // Send confirmation email
            $ticketOrder->user->notify(new TicketOrderConfirmationNotification($ticketOrder));

            Log::info('Ticket order payment completed', [
                'order_id' => $ticketOrder->id,
                'event_id' => $ticketOrder->event_id,
            ]);
        });
    }
}
