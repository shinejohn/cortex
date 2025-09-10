<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class MagicLinkNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public string $magicLink;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $magicLink)
    {
        $this->magicLink = $magicLink;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->line('Your magic link to login to '.config('app.name').' is below.')
            ->action('Login', $this->magicLink)
            ->line('This link will expire in 15 minutes.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'magicLink' => $this->magicLink,
        ];
    }
}
