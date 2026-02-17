<?php

declare(strict_types=1);

namespace App\Notifications\EventCity;

use App\Models\BookingAgent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class AgentRegisteredNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly BookingAgent $agent
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Welcome to Go Event City Booking Agents!')
            ->greeting("Welcome, {$this->agent->agency_name}!")
            ->line('Your booking agent account has been created successfully.')
            ->line('You can now start managing clients and earning commissions.')
            ->action('Go to Agent Dashboard', url('/agent/dashboard'))
            ->line('Thank you for joining our platform!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'agent_id' => $this->agent->id,
            'agency_name' => $this->agent->agency_name,
        ];
    }
}
