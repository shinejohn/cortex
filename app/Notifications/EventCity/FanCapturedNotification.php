<?php

declare(strict_types=1);

namespace App\Notifications\EventCity;

use App\Models\Fan;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

final class FanCapturedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Fan $fan
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'fan_id' => $this->fan->id,
            'fan_name' => $this->fan->name,
            'fan_email' => $this->fan->email,
            'source' => $this->fan->source,
        ];
    }
}
