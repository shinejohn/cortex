<?php

declare(strict_types=1);

namespace App\Services;

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use App\Models\NotificationSubscription;
use Illuminate\Support\Facades\Log;

final class WebPushService
{
    private WebPush $webPush;

    public function __construct()
    {
        $vapidPublicKey = config('services.webpush.public_key');
        $vapidPrivateKey = config('services.webpush.private_key');
        $vapidSubject = config('services.webpush.subject', 'mailto:notifications@shine.com');

        if (!$vapidPublicKey || !$vapidPrivateKey) {
            throw new \RuntimeException('Web Push VAPID keys not configured. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env');
        }

        $this->webPush = new WebPush([
            'VAPID' => [
                'subject' => $vapidSubject,
                'publicKey' => $vapidPublicKey,
                'privateKey' => $vapidPrivateKey,
            ],
        ]);

        // Enable automatic padding for security
        $this->webPush->setAutomaticPadding(true);
    }

    /**
     * Send push notification to a single subscription
     */
    public function sendToSubscription(NotificationSubscription $sub, array $payload): bool
    {
        if (!$sub->web_push_endpoint) {
            return false;
        }

        $subscription = Subscription::create([
            'endpoint' => $sub->web_push_endpoint,
            'publicKey' => $sub->web_push_p256dh,
            'authToken' => $sub->web_push_auth,
        ]);

        try {
            $result = $this->webPush->sendOneNotification(
                $subscription,
                json_encode($payload)
            );

            if ($result->isSuccess()) {
                return true;
            }

            // Handle expired subscription
            if ($result->isSubscriptionExpired()) {
                $sub->update([
                    'web_push_endpoint' => null,
                    'web_push_p256dh' => null,
                    'web_push_auth' => null,
                ]);
            }

            return false;
        } catch (\Exception $e) {
            Log::error('Web Push Failed', [
                'subscription_id' => $sub->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Send to multiple subscriptions (batched)
     */
    public function sendToMany(array $subscriptions, array $payload): array
    {
        $results = ['success' => 0, 'failed' => 0, 'expired' => []];

        foreach ($subscriptions as $sub) {
            if (!$sub->web_push_endpoint) {
                continue;
            }

            $subscription = Subscription::create([
                'endpoint' => $sub->web_push_endpoint,
                'publicKey' => $sub->web_push_p256dh,
                'authToken' => $sub->web_push_auth,
            ]);

            $this->webPush->queueNotification($subscription, json_encode($payload));
        }

        foreach ($this->webPush->flush() as $report) {
            if ($report->isSuccess()) {
                $results['success']++;
            } else {
                $results['failed']++;
                if ($report->isSubscriptionExpired()) {
                    $results['expired'][] = $report->getEndpoint();
                }
            }
        }

        return $results;
    }
}

