<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CrossDomainAuthToken;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

final class CrossDomainAuthService
{
    /**
     * Generate a cross-domain authentication token for a user
     * Returns the token record and plain token
     */
    public function generateToken(User $user, string $sourceDomain): array
    {
        // Get all configured domains except the source domain
        $allDomains = $this->getAllDomains();
        $targetDomains = array_filter($allDomains, fn($domain) => $domain !== $sourceDomain);

        // Generate secure token (store hashed, return plain)
        $plainToken = Str::random(64);

        // Create token record with hashed token (SHA-256 like Sanctum)
        // Default 5 minutes - these are short-lived handoff tokens, not session tokens
        $expirationMinutes = (int) config('auth.cross_domain_token_expiration', 5);
        $tokenRecord = CrossDomainAuthToken::create([
            'user_id' => $user->id,
            'token' => hash('sha256', $plainToken),
            'source_domain' => $sourceDomain,
            'target_domains' => array_values($targetDomains),
            'expires_at' => now()->addMinutes($expirationMinutes),
            'used' => false,
        ]);

        return [
            'token_record' => $tokenRecord,
            'plain_token' => $plainToken,
        ];
    }

    /**
     * Validate and use a cross-domain auth token
     */
    public function validateAndUseToken(string $token, string $currentDomain): ?User
    {
        // Find unused, non-expired tokens (compare SHA-256 hash)
        $tokenRecord = CrossDomainAuthToken::where('used', false)
            ->where('expires_at', '>', now())
            ->where('token', hash('sha256', $token))
            ->first();

        if (!$tokenRecord) {
            return null;
        }

        // Check if current domain is in target domains
        $targetDomains = $tokenRecord->target_domains ?? [];
        if (!in_array($currentDomain, $targetDomains)) {
            return null;
        }

        // Mark as used
        $tokenRecord->markAsUsed();

        // Return the user
        return $tokenRecord->user;
    }

    /**
     * Get all configured domains from config
     */
    public function getAllDomains(): array
    {
        $domains = config('domains', []);
        
        return array_filter([
            $domains['event-city'] ?? null,
            $domains['day-news'] ?? null,
            $domains['downtown-guide'] ?? null,
            $domains['local-voices'] ?? null,
        ]);
    }

    /**
     * Get URLs for cross-domain auth redirects
     */
    public function getAuthUrls(string $plainToken, string $sourceDomain, ?string $returnUrl = null): array
    {
        $targetDomains = $this->getAllDomains();
        $urls = [];

        foreach ($targetDomains as $domain) {
            if ($domain !== $sourceDomain) {
                $protocol = config('app.env') === 'local' ? 'http' : 'https';
                $url = "{$protocol}://{$domain}/cross-domain-auth/sync?token=" . urlencode($plainToken);
                
                if ($returnUrl) {
                    $url .= "&return=" . urlencode($returnUrl);
                }

                $urls[] = $url;
            }
        }

        return $urls;
    }

    /**
     * Clean up expired tokens (should be run via scheduled task)
     */
    public function cleanupExpiredTokens(): int
    {
        return CrossDomainAuthToken::where('expires_at', '<', now())
            ->orWhere('used', true)
            ->delete();
    }
}

