<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class BookingConfirmationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Booking $booking
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
        $booking = $this->booking;
        $mailMessage = (new MailMessage)
            ->subject("Booking Confirmation: {$booking->booking_number}")
            ->greeting("Hello {$booking->contact_name}!")
            ->line("Your booking has been confirmed!");

        // Add booking type specific details
        if ($booking->isEventBooking() && $booking->event) {
            $event = $booking->event;
            $mailMessage->line("**Event Booking Details:**")
                ->line("- **Event:** {$event->title}")
                ->line("- **Date:** {$booking->event_date->format('F j, Y')}")
                ->line("- **Time:** {$booking->start_time} - {$booking->end_time}")
                ->line("- **Venue:** ".($event->venue?->name ?? 'TBA'));
        } elseif ($booking->isVenueBooking() && $booking->venue) {
            $venue = $booking->venue;
            $mailMessage->line("**Venue Booking Details:**")
                ->line("- **Venue:** {$venue->name}")
                ->line("- **Date:** {$booking->event_date->format('F j, Y')}")
                ->line("- **Time:** {$booking->start_time} - {$booking->end_time}")
                ->line("- **Event Type:** {$booking->event_type}")
                ->line("- **Expected Guests:** {$booking->expected_guests}");
        } elseif ($booking->isPerformerBooking() && $booking->performer) {
            $performer = $booking->performer;
            $mailMessage->line("**Performer Booking Details:**")
                ->line("- **Performer:** {$performer->name}")
                ->line("- **Date:** {$booking->event_date->format('F j, Y')}")
                ->line("- **Time:** {$booking->start_time} - {$booking->end_time}")
                ->line("- **Venue:** ".($booking->venue?->name ?? 'TBA'));
        }

        $mailMessage->line("**Booking Information:**")
            ->line("- **Booking Number:** {$booking->booking_number}")
            ->line("- **Status:** ".ucfirst($booking->status))
            ->line("- **Total Amount:** \${$booking->total_amount}")
            ->line("- **Payment Status:** ".ucfirst(str_replace('_', ' ', $booking->payment_status)));

        if ($booking->notes) {
            $mailMessage->line("**Notes:**")
                ->line($booking->notes);
        }

        $mailMessage->action('View Booking', route('bookings.show', $booking->id))
            ->line("If you have any questions, please contact us at ".config('mail.from.address'));

        return $mailMessage;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'booking_id' => $this->booking->id,
            'booking_number' => $this->booking->booking_number,
            'status' => $this->booking->status,
            'total_amount' => $this->booking->total_amount,
        ];
    }
}
