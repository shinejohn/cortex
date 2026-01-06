<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\NotificationService;
use App\Services\WebPushService;
use App\Models\NotificationSubscription;
use App\Models\NotificationLog;

final class SendNotification extends Command
{
    protected $signature = 'notify:send 
                            {platform : daynews|goeventcity|downtownguide|alphasite}
                            {community : Community ID (e.g., chicago-il)}
                            {--type=general : Notification type}
                            {--title= : Notification title}
                            {--message= : Notification message}
                            {--url= : Link URL}
                            {--sms : Send via SMS}
                            {--push : Send via Web Push}';

    protected $description = 'Send notification to subscribers';

    public function handle(NotificationService $snsService, WebPushService $webPushService): int
    {
        $platform = $this->argument('platform');
        $communityId = $this->argument('community');
        $type = $this->option('type');
        $title = $this->option('title') ?? 'New Notification';
        $message = $this->option('message');
        $url = $this->option('url');
        $sendSms = $this->option('sms');
        $sendPush = $this->option('push');

        if (!$message) {
            $this->error('Message is required');
            return Command::FAILURE;
        }

        // Get subscribers
        $subscribers = NotificationSubscription::where('platform', $platform)
            ->where('community_id', $communityId)
            ->where('status', 'active')
            ->whereJsonContains('notification_types', $type)
            ->get();

        $this->info("Found {$subscribers->count()} subscribers");

        // Log notification
        $log = NotificationLog::create([
            'platform' => $platform,
            'community_id' => $communityId,
            'notification_type' => $type,
            'channel' => $sendSms && $sendPush ? 'sms' : ($sendSms ? 'sms' : 'web_push'),
            'title' => $title,
            'message' => $message,
            'payload' => ['url' => $url],
            'recipient_count' => $subscribers->count(),
        ]);

        // Send SMS via SNS Topic
        if ($sendSms) {
            $this->info('Sending SMS notifications...');
            $messageId = $snsService->publishToTopic($platform, $communityId, $message, [
                'subject' => $title,
                'type' => $type,
                'payload' => ['url' => $url],
            ]);

            if ($messageId) {
                $this->info("SMS sent, Message ID: {$messageId}");
                $log->update(['sns_message_id' => $messageId]);
            } else {
                $this->error('SMS sending failed');
            }
        }

        // Send Web Push
        if ($sendPush) {
            $this->info('Sending web push notifications...');
            $pushSubscribers = $subscribers->filter(fn($s) => $s->web_push_endpoint);

            $results = $webPushService->sendToMany($pushSubscribers->all(), [
                'title' => $title,
                'body' => $message,
                'url' => $url,
                'platform' => $platform,
                'notification_id' => $log->id,
            ]);

            $this->info("Web Push: {$results['success']} sent, {$results['failed']} failed");

            // Clean up expired subscriptions
            if (!empty($results['expired'])) {
                NotificationSubscription::whereIn('web_push_endpoint', $results['expired'])
                    ->update(['web_push_endpoint' => null]);
            }
        }

        $log->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $this->info('Notification sent successfully!');
        return Command::SUCCESS;
    }
}
