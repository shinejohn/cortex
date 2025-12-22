<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\CheckIn;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class CheckInConfirmationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public CheckIn $checkIn
    ) {}

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
        $checkIn = $this->checkIn;
        $event = $checkIn->event;

        return (new MailMessage)
            ->subject("You've checked in to {$event->title}")
            ->greeting("Hello {$notifiable->name}!")
            ->line("You've successfully checked in to {$event->title}!")
            ->line("**Event Details:**")
            ->line("- **Date:** {$event->event_date->format('F j, Y')}")
            ->line("- **Time:** {$event->time}")
            ->line("- **Venue:** ".($event->venue?->name ?? 'TBA'))
            ->line("- **Checked in at:** {$checkIn->checked_in_at->format('g:i A')}")
            ->line("We hope you enjoy the event!")
            ->action('View Event', route('events.show', $event->id))
            ->line("Thank you for using ".config('app.name')."!");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'check_in_id' => $this->checkIn->id,
            'event_title' => $this->checkIn->event->title,
            'checked_in_at' => $this->checkIn->checked_in_at->toISOString(),
        ];
    }
}
