<?php

declare(strict_types=1);

namespace App\Jobs\Moderation;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

final class SendModerationNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly string $type,
        public readonly array $payload
    ) {
        $this->onQueue('emails');
    }

    public function handle(): void
    {
        // Placeholder for complaint response and appeal outcome emails
        // Can be extended when those mailables are implemented
    }
}
