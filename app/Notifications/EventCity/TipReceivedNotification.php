<?php

declare(strict_types=1);

namespace App\Notifications\EventCity;

use App\Models\Tip;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class TipReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Tip $tip
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $amount = number_format($this->tip->amount_cents / 100, 2);
        $fanName = $this->tip->is_anonymous ? 'An anonymous fan' : $this->tip->fan->name;

        return (new MailMessage)
            ->subject("You received a \${$amount} tip!")
            ->greeting("Hey {$notifiable->name}!")
            ->line("{$fanName} just tipped you \${$amount}.")
            ->when($this->tip->fan_message, fn ($mail) => $mail->line("\"{$this->tip->fan_message}\""))
            ->action('View Your Tip Dashboard', url('/dashboard/tip-jar'))
            ->line('Keep doing what you do best!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tip_id' => $this->tip->id,
            'amount_cents' => $this->tip->amount_cents,
            'fan_name' => $this->tip->is_anonymous ? 'Anonymous' : $this->tip->fan->name,
            'message' => $this->tip->fan_message,
        ];
    }
}
