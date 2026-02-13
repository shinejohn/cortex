<?php

declare(strict_types=1);

namespace App\Services\Domain;

use Illuminate\Support\Facades\Http;

final class DomainAvailabilityService
{
    private string $apiToken;

    private string $accountId;

    public function __construct()
    {
        $this->apiToken = config('services.cloudflare.api_token', '');
        $this->accountId = config('services.cloudflare.account_id', '');
    }

    /**
     * Check availability and pricing for a domain name.
     * Returns Cloudflare's at-cost pricing — we add NOTHING.
     *
     * @return array{available: bool, domain: string, price?: float|null, currency?: string, renewal_price?: float|null, premium?: bool, error?: string}
     */
    public function check(string $domainName): array
    {
        $domainName = $this->sanitize($domainName);

        $response = Http::withToken($this->apiToken)
            ->get("https://api.cloudflare.com/client/v4/accounts/{$this->accountId}/registrar/domains", [
                'domain' => $domainName,
            ]);

        if (! $response->successful()) {
            return [
                'available' => false,
                'domain' => $domainName,
                'error' => 'Unable to check availability. Try again shortly.',
            ];
        }

        $data = $response->json();

        return [
            'available' => $data['result']['available'] ?? false,
            'domain' => $domainName,
            'price' => $data['result']['price'] ?? null,
            'currency' => $data['result']['currency'] ?? 'USD',
            'renewal_price' => $data['result']['renewal_price'] ?? null,
            'premium' => $data['result']['premium'] ?? false,
        ];
    }

    /**
     * Suggest alternative domains based on the business name.
     * Check multiple TLDs at once.
     *
     * @return array<int, array{available: bool, domain: string, price?: float|null, currency?: string}>
     */
    public function suggest(string $businessName, ?string $city = null): array
    {
        $base = $this->slugify($businessName);
        $candidates = [];

        $bases = [$base];
        if ($city) {
            $bases[] = $base.$this->slugify($city);
            $bases[] = $this->slugify($city).$base;
        }

        $tlds = ['.com', '.net', '.co', '.biz', '.us'];

        foreach ($bases as $b) {
            foreach ($tlds as $tld) {
                $candidates[] = $b.$tld;
            }
        }

        $results = [];
        foreach (array_slice($candidates, 0, 15) as $candidate) {
            $result = $this->check($candidate);
            if ($result['available']) {
                $results[] = $result;
            }
        }

        return $results;
    }

    private function sanitize(string $domain): string
    {
        $domain = mb_strtolower(mb_trim($domain));

        return preg_replace('/[^a-z0-9.\-]/', '', $domain);
    }

    private function slugify(string $name): string
    {
        $name = mb_strtolower(mb_trim($name));

        return preg_replace('/[^a-z0-9]/', '', $name);
    }
}
