<?php

declare(strict_types=1);

namespace App\Services;

use App\Jobs\SendNotificationJob;
use App\Models\NotificationSubscription;
use Illuminate\Support\Facades\Log;

/**
 * Helper service to integrate notification system with existing events
 */
final class NotificationIntegrationService
{
    private NotificationService $notificationService;
    private WebPushService $webPushService;

    public function __construct(
        NotificationService $notificationService,
        WebPushService $webPushService
    ) {
        $this->notificationService = $notificationService;
        $this->webPushService = $webPushService;
    }

    /**
     * Send notification for breaking news (Day.News)
     */
    public function sendBreakingNews(string $communityId, string $title, string $message, ?string $url = null): void
    {
        $this->sendNotification(
            platform: 'daynews',
            communityId: $communityId,
            type: 'breaking_news',
            title: $title,
            message: $message,
            url: $url,
            sendSms: true,
            sendPush: true
        );
    }

    /**
     * Send notification for event reminder (GoEventCity)
     */
    public function sendEventReminder(string $communityId, string $eventTitle, string $message, ?string $url = null): void
    {
        $this->sendNotification(
            platform: 'goeventcity',
            communityId: $communityId,
            type: 'events',
            title: "Event Reminder: {$eventTitle}",
            message: $message,
            url: $url,
            sendSms: false,
            sendPush: true
        );
    }

    /**
     * Send notification for order confirmation (GoEventCity)
     */
    public function sendOrderConfirmation(string $communityId, string $orderId, string $message, ?string $url = null): void
    {
        $this->sendNotification(
            platform: 'goeventcity',
            communityId: $communityId,
            type: 'events',
            title: 'Order Confirmation',
            message: $message,
            url: $url,
            sendSms: true,
            sendPush: true
        );
    }

    /**
     * Send notification for deal alert (DowntownsGuide)
     */
    public function sendDealAlert(string $communityId, string $title, string $message, ?string $url = null): void
    {
        $this->sendNotification(
            platform: 'downtownguide',
            communityId: $communityId,
            type: 'deals',
            title: $title,
            message: $message,
            url: $url,
            sendSms: false,
            sendPush: true
        );
    }

    /**
     * Send notification for booking confirmation (DowntownsGuide)
     */
    public function sendBookingConfirmation(string $communityId, string $title, string $message, ?string $url = null): void
    {
        $this->sendNotification(
            platform: 'downtownguide',
            communityId: $communityId,
            type: 'deals',
            title: $title,
            message: $message,
            url: $url,
            sendSms: true,
            sendPush: true
        );
    }

    /**
     * Send notification for business update (AlphaSite)
     */
    public function sendBusinessUpdate(string $businessId, string $title, string $message, ?string $url = null): void
    {
        // For AlphaSite, community_id is the business_id
        $this->sendNotification(
            platform: 'alphasite',
            communityId: $businessId,
            type: 'general',
            title: $title,
            message: $message,
            url: $url,
            sendSms: false,
            sendPush: true
        );
    }

    /**
     * Generic notification sender
     */
    public function sendNotification(
        string $platform,
        string $communityId,
        string $type,
        string $title,
        string $message,
        ?string $url = null,
        bool $sendSms = false,
        bool $sendPush = false
    ): void {
        // Queue the notification job
        SendNotificationJob::dispatch(
            platform: $platform,
            communityId: $communityId,
            notificationType: $type,
            title: $title,
            message: $message,
            url: $url,
            sendSms: $sendSms,
            sendPush: $sendPush
        );
    }

    /**
     * Check if user should receive notification (respects quiet hours and preferences)
     */
    public function shouldSendNotification(NotificationSubscription $subscription, string $type): bool
    {
        if ($subscription->status !== 'active') {
            return false;
        }

        if (!$subscription->wantsNotificationType($type)) {
            return false;
        }

        if ($subscription->isQuietHours()) {
            return false;
        }

        return true;
    }
}

