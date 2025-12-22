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

        // Generate secure token (store plain token temporarily)
        $plainToken = Str::random(64);

        // Create token record (expires in 5 minutes)
        // Store plain token in token field (we'll hash it when validating)
        $tokenRecord = CrossDomainAuthToken::create([
            'user_id' => $user->id,
            'token' => $plainToken, // Store plain token, hash on validation
            'source_domain' => $sourceDomain,
            'target_domains' => array_values($targetDomains),
            'expires_at' => now()->addMinutes(5),
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
        // Find unused, non-expired tokens
        $tokenRecord = CrossDomainAuthToken::where('used', false)
            ->where('expires_at', '>', now())
            ->where('token', $token) // Direct comparison since we store plain token
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

