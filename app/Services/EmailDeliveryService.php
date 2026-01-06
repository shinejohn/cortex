<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\EmailCampaign;
use App\Models\EmailSend;
use App\Models\EmailSubscriber;
use App\Models\EmergencyAlert;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\View;

final class EmailDeliveryService
{
    /**
     * Send an email campaign send
     */
    public function sendCampaignEmail(EmailSend $send): void
    {
        $campaign = $send->campaign;
        $subscriber = $send->subscriber;

        try {
            // Track opens/clicks with pixel and link tracking
            $trackingPixel = route('email.track.open', ['send' => $send->id]);
            $htmlWithTracking = str_replace('</body>', "<img src=\"{$trackingPixel}\" width=\"1\" height=\"1\" style=\"display:none;\"></body>", $campaign->html_content ?? '');

            // Replace links with tracking URLs
            $htmlWithTracking = preg_replace_callback(
                '/href="([^"]+)"/',
                fn($matches) => 'href="' . route('email.track.click', ['send' => $send->id, 'url' => base64_encode($matches[1])]) . '"',
                $htmlWithTracking
            );

            Mail::send([], [], function ($message) use ($campaign, $subscriber, $htmlWithTracking) {
                $message->to($subscriber->email, $subscriber->full_name)
                    ->subject($campaign->subject)
                    ->html($htmlWithTracking)
                    ->text($campaign->text_content ?? strip_tags($htmlWithTracking));
            });

            $send->update([
                'status' => 'sent',
                'sent_at' => now(),
                'message_id' => 'ses-' . uniqid(), // SES message ID
            ]);

            $campaign->increment('sent_count');
        } catch (\Exception $e) {
            Log::error('Email send failed', [
                'send_id' => $send->id,
                'error' => $e->getMessage(),
            ]);

            $send->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Send emergency alert email
     */
    public function sendEmergencyAlert(EmailSubscriber $subscriber, EmergencyAlert $alert): string
    {
        try {
            $html = $this->renderEmergencyEmailHtml($alert);
            $text = $this->renderEmergencyEmailText($alert);
            $priority = strtoupper($alert->priority);

            Mail::send([], [], function ($message) use ($subscriber, $alert, $priority, $html, $text) {
                $message->to($subscriber->email, $subscriber->full_name)
                    ->subject("[{$priority}] {$alert->title}")
                    ->html($html)
                    ->text($text);
            });

            return 'ses-' . uniqid();
        } catch (\Exception $e) {
            Log::error('Emergency email send failed', [
                'subscriber_id' => $subscriber->id,
                'alert_id' => $alert->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Track email open
     */
    public function trackOpen(EmailSend $send): void
    {
        if (!$send->opened_at) {
            $send->update([
                'opened_at' => now(),
                'open_count' => 1,
            ]);

            $send->campaign->increment('opened_count');
        } else {
            $send->increment('open_count');
        }
    }

    /**
     * Track email click
     */
    public function trackClick(EmailSend $send, string $url): string
    {
        if (!$send->clicked_at) {
            $send->update([
                'clicked_at' => now(),
                'click_count' => 1,
            ]);

            $send->campaign->increment('clicked_count');
        } else {
            $send->increment('click_count');
        }

        return base64_decode($url);
    }

    /**
     * Handle bounce
     */
    public function handleBounce(EmailSend $send, string $bounceType, ?string $message = null): void
    {
        $send->update([
            'status' => 'bounced',
            'bounce_type' => $bounceType,
            'error_message' => $message,
        ]);

        $send->campaign->increment('bounced_count');

        // Mark subscriber as bounced if hard bounce
        if ($bounceType === 'hard') {
            $send->subscriber->update(['status' => 'bounced']);
        }
    }

    /**
     * Handle complaint
     */
    public function handleComplaint(EmailSend $send): void
    {
        $send->update(['status' => 'complained']);
        $send->campaign->increment('complained_count');
        $send->subscriber->update(['status' => 'complained']);
    }

    /**
     * Render emergency email HTML
     */
    protected function renderEmergencyEmailHtml(EmergencyAlert $alert): string
    {
        $color = match($alert->priority) {
            'critical' => '#dc2626',
            'urgent' => '#ea580c',
            'advisory' => '#ca8a04',
            'info' => '#2563eb',
            default => '#6b7280',
        };

        // Simple HTML template if view doesn't exist yet
        if (!View::exists('emails.emergency-alert')) {
            return "<!DOCTYPE html><html><body style='font-family: Arial, sans-serif; padding: 20px;'><h2 style='color: {$color};'>{$alert->title}</h2><p>{$alert->message}</p>" . ($alert->instructions ? "<p><strong>Instructions:</strong> {$alert->instructions}</p>" : '') . ($alert->source_url ? "<p><a href='{$alert->source_url}'>More information</a></p>" : '') . "</body></html>";
        }

        return view('emails.emergency-alert', [
            'alert' => $alert,
            'color' => $color,
        ])->render();
    }

    /**
     * Render emergency email text
     */
    protected function renderEmergencyEmailText(EmergencyAlert $alert): string
    {
        return "{$alert->title}\n\n{$alert->message}\n\n" . ($alert->instructions ? "Instructions: {$alert->instructions}\n\n" : '') . ($alert->source_url ? "More info: {$alert->source_url}" : '');
    }
}

