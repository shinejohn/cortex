<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\EmergencyDelivery;
use App\Services\EmailDeliveryService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

final class SendEmergencyEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(
        public EmergencyDelivery $delivery
    ) {}

    public function handle(EmailDeliveryService $emailService): void
    {
        $alert = $this->delivery->alert;
        $subscriber = $this->delivery->subscription->subscriber;

        try {
            $messageId = $emailService->sendEmergencyAlert($subscriber, $alert);
            $this->delivery->update([
                'status' => 'sent',
                'external_id' => $messageId,
                'sent_at' => now(),
            ]);
        } catch (\Exception $e) {
            $this->delivery->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
