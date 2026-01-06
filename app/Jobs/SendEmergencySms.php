<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\EmergencyDelivery;
use App\Services\SmsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

final class SendEmergencySms implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 10;

    public function __construct(
        public EmergencyDelivery $delivery
    ) {}

    public function handle(SmsService $smsService): void
    {
        $alert = $this->delivery->alert;
        $subscription = $this->delivery->subscription;

        if (!$subscription->canReceiveSms()) {
            $this->delivery->update([
                'status' => 'failed',
                'error_message' => 'SMS not enabled or verified',
            ]);

            return;
        }

        try {
            $messageId = $smsService->sendEmergencyAlert(
                $subscription->phone_number,
                $alert
            );
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
