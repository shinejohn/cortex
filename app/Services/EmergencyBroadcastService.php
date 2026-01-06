<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\EmergencyAlert;
use App\Models\EmergencySubscription;
use App\Models\EmergencyDelivery;
use App\Models\EmergencyAuditLog;
use App\Jobs\SendEmergencyEmail;
use App\Jobs\SendEmergencySms;
use Illuminate\Support\Facades\Log;

final class EmergencyBroadcastService
{
    public function __construct(
        private readonly EmailDeliveryService $emailService,
        private readonly SmsService $smsService
    ) {}

    /**
     * Create and optionally publish an emergency alert
     */
    public function createAlert(array $data, ?int $userId = null, ?int $municipalPartnerId = null): EmergencyAlert
    {
        $alert = EmergencyAlert::create([
            'community_id' => $data['community_id'],
            'created_by' => $userId,
            'municipal_partner_id' => $municipalPartnerId,
            'priority' => $data['priority'],
            'category' => $data['category'],
            'title' => $data['title'],
            'message' => $data['message'],
            'instructions' => $data['instructions'] ?? null,
            'source' => $data['source'] ?? null,
            'source_url' => $data['source_url'] ?? null,
            'status' => ($data['publish_immediately'] ?? false) ? 'active' : 'draft',
            'published_at' => ($data['publish_immediately'] ?? false) ? now() : null,
            'expires_at' => $data['expires_at'] ?? null,
            'delivery_channels' => $data['channels'] ?? ['email'],
        ]);

        $this->logAction($alert, 'created', $userId, $municipalPartnerId);

        if ($alert->status === 'active') {
            $this->broadcast($alert);
        }

        return $alert;
    }

    /**
     * Publish a draft alert
     */
    public function publishAlert(EmergencyAlert $alert, ?int $userId = null): EmergencyAlert
    {
        $alert->update([
            'status' => 'active',
            'published_at' => now(),
        ]);

        $this->logAction($alert, 'published', $userId);
        $this->broadcast($alert);

        return $alert;
    }

    /**
     * Broadcast alert to all eligible subscribers
     */
    public function broadcast(EmergencyAlert $alert): void
    {
        $channels = $alert->delivery_channels ?? ['email'];

        // Get eligible subscriptions
        $subscriptions = EmergencySubscription::query()
            ->whereHas('subscriber', function ($query) use ($alert) {
                $query->where('community_id', $alert->community_id)
                    ->where('status', 'active');
            })
            ->with('subscriber')
            ->get()
            ->filter(fn($sub) => $sub->shouldReceiveAlert($alert));

        foreach ($subscriptions as $subscription) {
            // Queue email delivery
            if (in_array('email', $channels) && $subscription->email_enabled) {
                $this->queueEmailDelivery($alert, $subscription);
            }

            // Queue SMS delivery for critical/urgent if enabled
            if (in_array('sms', $channels) && $subscription->canReceiveSms()) {
                if (in_array($alert->priority, ['critical', 'urgent'])) {
                    $this->queueSmsDelivery($alert, $subscription);
                }
            }
        }

        // Update sent counts
        $alert->update([
            'email_sent' => EmergencyDelivery::where('alert_id', $alert->id)
                ->where('channel', 'email')
                ->count(),
            'sms_sent' => EmergencyDelivery::where('alert_id', $alert->id)
                ->where('channel', 'sms')
                ->count(),
        ]);
    }

    /**
     * Queue email delivery
     */
    protected function queueEmailDelivery(EmergencyAlert $alert, EmergencySubscription $subscription): void
    {
        $delivery = EmergencyDelivery::create([
            'alert_id' => $alert->id,
            'subscription_id' => $subscription->id,
            'channel' => 'email',
            'status' => 'queued',
        ]);

        // Use high priority queue for critical alerts
        $queue = $alert->priority === 'critical' ? 'emergency-critical' : 'emergency';
        SendEmergencyEmail::dispatch($delivery)->onQueue($queue);
    }

    /**
     * Queue SMS delivery
     */
    protected function queueSmsDelivery(EmergencyAlert $alert, EmergencySubscription $subscription): void
    {
        $delivery = EmergencyDelivery::create([
            'alert_id' => $alert->id,
            'subscription_id' => $subscription->id,
            'channel' => 'sms',
            'status' => 'queued',
        ]);

        // SMS always uses critical queue
        SendEmergencySms::dispatch($delivery)->onQueue('emergency-critical');
    }

    /**
     * Cancel an active alert
     */
    public function cancelAlert(EmergencyAlert $alert, ?int $userId = null, ?string $reason = null): EmergencyAlert
    {
        $alert->update(['status' => 'cancelled']);

        $this->logAction($alert, 'cancelled', $userId, null, ['reason' => $reason]);

        // Cancel any pending deliveries
        EmergencyDelivery::where('alert_id', $alert->id)
            ->where('status', 'queued')
            ->update(['status' => 'failed', 'error_message' => 'Alert cancelled']);

        return $alert;
    }

    /**
     * Log audit action
     */
    protected function logAction(
        EmergencyAlert $alert,
        string $action,
        ?int $userId = null,
        ?int $municipalPartnerId = null,
        ?array $changes = null
    ): void {
        EmergencyAuditLog::create([
            'alert_id' => $alert->id,
            'user_id' => $userId,
            'municipal_partner_id' => $municipalPartnerId,
            'action' => $action,
            'changes' => $changes,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Get delivery statistics for an alert
     */
    public function getDeliveryStats(EmergencyAlert $alert): array
    {
        return [
            'email' => [
                'queued' => $alert->deliveries()->where('channel', 'email')->where('status', 'queued')->count(),
                'sent' => $alert->deliveries()->where('channel', 'email')->where('status', 'sent')->count(),
                'delivered' => $alert->deliveries()->where('channel', 'email')->where('status', 'delivered')->count(),
                'failed' => $alert->deliveries()->where('channel', 'email')->where('status', 'failed')->count(),
            ],
            'sms' => [
                'queued' => $alert->deliveries()->where('channel', 'sms')->where('status', 'queued')->count(),
                'sent' => $alert->deliveries()->where('channel', 'sms')->where('status', 'sent')->count(),
                'delivered' => $alert->deliveries()->where('channel', 'sms')->where('status', 'delivered')->count(),
                'failed' => $alert->deliveries()->where('channel', 'sms')->where('status', 'failed')->count(),
            ],
        ];
    }
}

