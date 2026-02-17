<?php

declare(strict_types=1);

namespace App\Services\AlphaSite;

use App\Models\Business;
use App\Models\User;
use App\Services\SmsService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

final class VerificationService
{
    public function __construct(
        private readonly SmsService $smsService
    ) {}

    public function sendPhoneVerification(Business $business, string $phone): bool
    {
        $code = mb_str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        Cache::put("claim_phone_code:{$business->id}", $code, now()->addMinutes(15));

        try {
            $this->smsService->sendVerificationCode($phone, $code);

            return true;
        } catch (Throwable $e) {
            Cache::forget("claim_phone_code:{$business->id}");

            throw $e;
        }
    }

    public function sendEmailVerification(Business $business, string $email): bool
    {
        $token = Str::random(64);
        Cache::put("claim_email_token:{$business->id}", $token, now()->addHours(24));

        $verifyUrl = route('alphasite.claim.verify.email', [
            'slug' => $business->slug,
            'token' => $token,
        ]);

        $body = $this->buildVerificationEmailBody($business->name, $verifyUrl);

        try {
            Mail::send([], [], function ($message) use ($email, $body) {
                $message->to($email)
                    ->subject('Verify Business Ownership - AlphaSite')
                    ->html($body)
                    ->text(strip_tags($body));
            });

            return true;
        } catch (Throwable $e) {
            Cache::forget("claim_email_token:{$business->id}");

            throw $e;
        }
    }

    public function verifyPhoneCode(Business $business, string $code): bool
    {
        $cached = Cache::get("claim_phone_code:{$business->id}");
        if ($cached !== null && $cached === $code) {
            Cache::forget("claim_phone_code:{$business->id}");

            return true;
        }

        return false;
    }

    public function verifyEmailToken(Business $business, string $token): bool
    {
        $cached = Cache::get("claim_email_token:{$business->id}");
        if ($cached !== null && $cached === $token) {
            Cache::forget("claim_email_token:{$business->id}");

            return true;
        }

        return false;
    }

    public function completeClaim(Business $business, User $user): void
    {
        $business->update([
            'claimed_by_id' => $user->id,
            'claimed_at' => now(),
            'verification_status' => 'verified',
            'verified_at' => now(),
        ]);
    }

    private function buildVerificationEmailBody(string $businessName, string $verifyUrl): string
    {
        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2>Verify your business ownership</h2>
            <p>Click the link below to verify ownership of <strong>{$businessName}</strong> on AlphaSite:</p>
            <p><a href="{$verifyUrl}" style="color: #2563eb;">Verify ownership</a></p>
            <p>This link expires in 24 hours.</p>
            <p>— The AlphaSite Team</p>
        </body>
        </html>
        HTML;
    }
}
