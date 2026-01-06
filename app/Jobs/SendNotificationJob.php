<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\NotificationLog;
use App\Models\NotificationSubscription;
use App\Services\NotificationService;
use App\Services\WebPushService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

final class SendNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private string $platform,
        private string $communityId,
        private string $notificationType,
        private string $title,
        private string $message,
        private ?string $url = null,
        private bool $sendSms = false,
        private bool $sendPush = false
    ) {}

    public function handle(NotificationService $snsService, WebPushService $webPushService): void
    {
        // Get subscribers
        $subscribers = NotificationSubscription::where('platform', $this->platform)
            ->where('community_id', $this->communityId)
            ->where('status', 'active')
            ->whereJsonContains('notification_types', $this->notificationType)
            ->get();

        // Log notification
        $log = NotificationLog::create([
            'platform' => $this->platform,
            'community_id' => $this->communityId,
            'notification_type' => $this->notificationType,
            'channel' => $this->sendSms && $this->sendPush ? 'sms' : ($this->sendSms ? 'sms' : 'web_push'),
            'title' => $this->title,
            'message' => $this->message,
            'payload' => ['url' => $this->url],
            'recipient_count' => $subscribers->count(),
        ]);

        // Send SMS via SNS Topic
        if ($this->sendSms) {
            $messageId = $snsService->publishToTopic($this->platform, $this->communityId, $this->message, [
                'subject' => $this->title,
                'type' => $this->notificationType,
                'payload' => ['url' => $this->url],
            ]);

            if ($messageId) {
                $log->update(['sns_message_id' => $messageId]);
            } else {
                $log->markAsFailed('SMS sending failed');
            }
        }

        // Send Web Push
        if ($this->sendPush) {
            $pushSubscribers = $subscribers->filter(fn($s) => $s->web_push_endpoint);

            $results = $webPushService->sendToMany($pushSubscribers->all(), [
                'title' => $this->title,
                'body' => $this->message,
                'url' => $this->url,
                'platform' => $this->platform,
                'notification_id' => $log->id,
            ]);

            // Clean up expired subscriptions
            if (!empty($results['expired'])) {
                NotificationSubscription::whereIn('web_push_endpoint', $results['expired'])
                    ->update(['web_push_endpoint' => null]);
            }

            if ($results['failed'] > 0 && $results['success'] === 0) {
                $log->markAsFailed('All web push notifications failed');
            } elseif ($results['failed'] > 0) {
                $log->markAsPartial();
            }
        }

        if ($log->status === 'queued') {
            $log->markAsSent();
        }
    }
}
