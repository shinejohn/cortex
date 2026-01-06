<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\EmailSend;
use App\Services\EmailDeliveryService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

final class SendEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(
        public EmailSend $send
    ) {}

    public function handle(EmailDeliveryService $emailService): void
    {
        try {
            $emailService->sendCampaignEmail($this->send);
        } catch (\Exception $e) {
            $this->send->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
