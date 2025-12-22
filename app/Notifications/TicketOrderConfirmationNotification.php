<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\TicketOrder;
use App\Services\QRCodeService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class TicketOrderConfirmationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public TicketOrder $ticketOrder
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
        $ticketOrder = $this->ticketOrder;
        $event = $ticketOrder->event;
        $qrCodeService = app(QRCodeService::class);

        $mailMessage = (new MailMessage)
            ->subject("Your tickets for {$event->title}")
            ->greeting("Hello {$notifiable->name}!")
            ->line("Thank you for your purchase! Your tickets for {$event->title} are confirmed.")
            ->line("**Event Details:**")
            ->line("- **Date:** {$event->event_date->format('F j, Y')}")
            ->line("- **Time:** {$event->time}")
            ->line("- **Venue:** ".($event->venue?->name ?? 'TBA'))
            ->line("**Order Summary:**")
            ->line("- Order Number: {$ticketOrder->id}")
            ->line("- Total Amount: \${$ticketOrder->total}")
            ->line("- Number of Tickets: {$ticketOrder->total_quantity}");

        // Add ticket details
        foreach ($ticketOrder->items as $item) {
            $mailMessage->line("- {$item->ticketPlan->name}: {$item->quantity} × \${$item->unit_price}");
        }

        // Add QR code if available
        $hasQRCode = false;
        foreach ($ticketOrder->items as $item) {
            if ($item->qr_code) {
                $hasQRCode = true;
                $qrCodeUrl = $qrCodeService->getQRCodeUrl($item->qr_code);
                $mailMessage->line("**Your Ticket QR Code:**")
                    ->line("Please present this QR code at the event entrance.")
                    ->attach($qrCodeUrl, [
                        'as' => "ticket-{$item->ticket_code}.png",
                        'mime' => 'image/png',
                    ]);
                break; // Attach first QR code as example
            }
        }

        $mailMessage->action('View My Tickets', route('tickets.my-tickets'))
            ->line("We look forward to seeing you at the event!")
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
            'ticket_order_id' => $this->ticketOrder->id,
            'event_title' => $this->ticketOrder->event->title,
            'total' => $this->ticketOrder->total,
        ];
    }
}
