<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Services\AlphaSite\StripeService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Stripe\Webhook;
use UnexpectedValueException;

final class StripeWebhookController extends Controller
{
    public function __construct(
        private readonly StripeService $stripeService
    ) {}

    public function handle(Request $request): Response
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('stripe.webhook_secret') ?? config('services.stripe.webhook_secret');

        if (empty($webhookSecret)) {
            return response('Webhook secret not configured', 500);
        }

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (UnexpectedValueException $e) {
            return response('Invalid payload', 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            return response('Invalid signature', 400);
        }

        $object = $event->data->object;

        match ($event->type) {
            'checkout.session.completed' => $this->stripeService->handleCheckoutCompleted($object),
            'customer.subscription.updated' => $this->stripeService->handleSubscriptionUpdated($object),
            'customer.subscription.deleted' => $this->stripeService->handleSubscriptionDeleted($object),
            'invoice.payment_failed' => $this->stripeService->handleInvoiceFailed($object),
            default => null,
        };

        return response('OK', 200);
    }
}
