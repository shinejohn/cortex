<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\BusinessSubscription;
use App\Models\NotificationLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

final class SendTrialExpirationReminders extends Command
{
    private const REMINDER_DAYS = [30, 14, 7, 3, 1];

    protected $signature = 'alphasite:send-trial-reminders';

    protected $description = 'Send trial expiration reminders at 30, 14, 7, 3, and 1 days before expiry';

    public function handle(): int
    {
        $subscriptions = BusinessSubscription::query()
            ->where('tier', 'trial')
            ->where('status', 'active')
            ->whereNotNull('trial_expires_at')
            ->whereNull('trial_converted_at')
            ->with(['business', 'claimedBy'])
            ->get();

        $sent = 0;

        foreach ($subscriptions as $subscription) {
            $daysRemaining = now()->diffInDays($subscription->trial_expires_at, false);

            if ($daysRemaining < 0) {
                continue;
            }

            $reminderType = $this->getReminderTypeForDays((int) $daysRemaining);
            if ($reminderType === null) {
                continue;
            }

            if ($this->reminderAlreadySent($subscription, $reminderType)) {
                continue;
            }

            $email = $this->getRecipientEmail($subscription);
            if (empty($email)) {
                $this->warn("No email for subscription {$subscription->id}, business {$subscription->business->name}");

                continue;
            }

            try {
                $this->sendReminderEmail($subscription, $email, $reminderType, (int) $daysRemaining);
                $this->logNotification($subscription, $reminderType, $email);
                $sent++;
            } catch (Throwable $e) {
                Log::error('Trial reminder send failed', [
                    'subscription_id' => $subscription->id,
                    'error' => $e->getMessage(),
                ]);
                $this->error("Failed to send reminder for {$subscription->business->name}: {$e->getMessage()}");
            }
        }

        $this->info("Sent {$sent} trial expiration reminders.");

        return self::SUCCESS;
    }

    private function getReminderTypeForDays(int $daysRemaining): ?string
    {
        return in_array($daysRemaining, self::REMINDER_DAYS, true)
            ? "trial_reminder_{$daysRemaining}d"
            : null;
    }

    private function reminderAlreadySent(BusinessSubscription $subscription, string $reminderType): bool
    {
        return NotificationLog::query()
            ->where('platform', 'alphasite')
            ->where('notification_type', $reminderType)
            ->whereJsonContains('payload->subscription_id', $subscription->id)
            ->exists();
    }

    private function getRecipientEmail(BusinessSubscription $subscription): ?string
    {
        $user = $subscription->claimedBy;
        if ($user?->email) {
            return $user->email;
        }

        return $subscription->business?->email;
    }

    private function sendReminderEmail(
        BusinessSubscription $subscription,
        string $email,
        string $reminderType,
        int $daysRemaining
    ): void {
        $business = $subscription->business;
        $subject = "Your AlphaSite trial expires in {$daysRemaining} day(s)";
        $body = $this->buildReminderBody($business->name, $daysRemaining, $subscription->trial_expires_at);

        Mail::send([], [], function ($message) use ($email, $subject, $body) {
            $message->to($email)
                ->subject($subject)
                ->html($body)
                ->text(strip_tags($body));
        });
    }

    private function buildReminderBody(string $businessName, int $daysRemaining, $expiresAt): string
    {
        $expiryDate = $expiresAt->format('F j, Y');
        $claimUrl = config('app.url').'/claim';

        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2>Your AlphaSite trial is ending soon</h2>
            <p>Hi,</p>
            <p>Your AlphaSite trial for <strong>{$businessName}</strong> expires in <strong>{$daysRemaining} day(s)</strong> ({$expiryDate}).</p>
            <p>To keep your AI-powered business page and premium features, <a href="{$claimUrl}">subscribe now</a>.</p>
            <p>If you have questions, reply to this email.</p>
            <p>— The AlphaSite Team</p>
        </body>
        </html>
        HTML;
    }

    private function logNotification(BusinessSubscription $subscription, string $reminderType, string $email): void
    {
        NotificationLog::create([
            'platform' => 'alphasite',
            'community_id' => null,
            'notification_type' => $reminderType,
            'channel' => 'email',
            'title' => 'Trial Expiration Reminder',
            'message' => "Reminder sent to {$email} for business {$subscription->business->name}",
            'payload' => [
                'subscription_id' => $subscription->id,
                'business_id' => $subscription->business_id,
                'recipient_email' => $email,
            ],
            'recipient_count' => 1,
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }
}
