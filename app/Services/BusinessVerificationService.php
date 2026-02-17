<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Business;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use InvalidArgumentException;
use Throwable;

final class BusinessVerificationService
{
    public function __construct(
        private readonly PhoneVerificationService $phoneService
    ) {}

    public function sendPhoneVerification(Business $business): void
    {
        if (! $business->phone) {
            throw new InvalidArgumentException('Business has no phone number on file.');
        }

        $this->phoneService->sendVerificationCode($business->phone, 'alphasite');
    }

    public function verifyPhone(Business $business, string $code): bool
    {
        if (! $business->phone) {
            return false;
        }

        $valid = $this->phoneService->verifyCode($business->phone, $code);
        if ($valid) {
            $business->update([
                'verification_status' => 'phone_verified',
                'is_verified' => true,
                'verified_at' => now(),
            ]);
        }

        return $valid;
    }

    public function sendEmailVerification(Business $business): void
    {
        if (! $business->email) {
            throw new InvalidArgumentException('Business has no email on file.');
        }

        $code = (string) random_int(100000, 999999);
        Cache::put("business_verify_email:{$business->id}", $code, now()->addMinutes(30));

        Mail::raw(
            "Your verification code for claiming {$business->name} is: {$code}. It expires in 30 minutes.",
            fn ($message) => $message->to($business->email)
                ->subject('Verify your business ownership')
        );
    }

    public function verifyEmail(Business $business, string $code): bool
    {
        $storedCode = Cache::get("business_verify_email:{$business->id}");
        if ($storedCode && (string) $storedCode === (string) $code) {
            Cache::forget("business_verify_email:{$business->id}");
            $business->update([
                'verification_status' => 'email_verified',
                'is_verified' => true,
                'verified_at' => now(),
            ]);

            return true;
        }

        return false;
    }

    public function generateWebsiteMetaTag(Business $business): string
    {
        $token = hash('sha256', $business->id.config('app.key'));
        Cache::put("business_verify_web:{$business->id}", $token, now()->addDays(7));

        return '<meta name="goeventcity-verify" content="'.$token.'">';
    }

    public function verifyWebsite(Business $business): bool
    {
        $token = Cache::get("business_verify_web:{$business->id}");
        if (! $token || ! $business->website) {
            return false;
        }

        try {
            $url = str_starts_with($business->website, 'http') ? $business->website : 'https://'.$business->website;
            $html = @file_get_contents($url);
            if ($html !== false && str_contains($html, $token)) {
                Cache::forget("business_verify_web:{$business->id}");
                $business->update([
                    'verification_status' => 'website_verified',
                    'is_verified' => true,
                    'verified_at' => now(),
                ]);

                return true;
            }
        } catch (Throwable) {
            // Ignore fetch errors
        }

        return false;
    }
}
