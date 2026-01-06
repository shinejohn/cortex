<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\PhoneVerification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

final class PhoneVerificationService
{
    private NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Send verification code to phone number
     */
    public function sendVerificationCode(string $phoneNumber, string $platform): bool
    {
        // Rate limit: max 3 codes per phone per hour
        $recentAttempts = PhoneVerification::where('phone_number', $phoneNumber)
            ->where('created_at', '>', Carbon::now()->subHour())
            ->count();

        if ($recentAttempts >= 3) {
            throw new \Exception('Too many verification attempts. Please try again later.');
        }

        // Generate 6-digit code
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store verification record
        PhoneVerification::create([
            'phone_number' => $phoneNumber,
            'code' => $code,
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);

        // Send SMS
        $platformNames = [
            'daynews' => 'Day News',
            'goeventcity' => 'Go Event City',
            'downtownguide' => 'Downtown Guide',
            'alphasite' => 'Your Business Site',
        ];

        $platformName = $platformNames[$platform] ?? 'Shine';
        $message = "{$code} is your {$platformName} verification code. Expires in 10 minutes.";

        $sent = $this->notificationService->sendDirectSMS($phoneNumber, $message);

        if (!$sent) {
            Log::error('Verification code SMS send failed', [
                'phone' => substr($phoneNumber, 0, 6) . '****',
                'platform' => $platform,
            ]);
            throw new \Exception('Failed to send verification code. Please try again.');
        }

        return true;
    }

    /**
     * Verify code
     */
    public function verifyCode(string $phoneNumber, string $code): bool
    {
        $verification = PhoneVerification::where('phone_number', $phoneNumber)
            ->where('code', $code)
            ->where('expires_at', '>', Carbon::now())
            ->where('verified', false)
            ->where('attempts', '<', 5)
            ->first();

        if (!$verification) {
            // Increment attempts on most recent unverified record
            PhoneVerification::where('phone_number', $phoneNumber)
                ->where('verified', false)
                ->latest()
                ->first()
                ?->increment('attempts');

            return false;
        }

        $verification->update(['verified' => true]);

        return true;
    }
}

