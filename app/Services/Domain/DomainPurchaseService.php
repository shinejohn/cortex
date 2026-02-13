<?php

declare(strict_types=1);

namespace App\Services\Domain;

use App\Models\Business;
use App\Models\BusinessDomain;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

final class DomainPurchaseService
{
    private string $apiToken;

    private string $accountId;

    public function __construct()
    {
        $this->apiToken = config('services.cloudflare.api_token', '');
        $this->accountId = config('services.cloudflare.account_id', '');
    }

    /**
     * Purchase a domain through Cloudflare at their at-cost price.
     * We charge ZERO markup. We are not a domain company.
     *
     * @param  array{first_name: string, last_name: string, address: string, city: string, state: string, zip: string, phone: string, email: string, business_name?: string, country?: string}  $contactInfo
     * @return array{success: bool, domain?: BusinessDomain, price?: float|null, message?: string, error?: string}
     */
    public function purchase(Business $business, string $domainName, array $contactInfo): array
    {
        return DB::transaction(function () use ($business, $domainName, $contactInfo) {
            $response = Http::withToken($this->apiToken)
                ->post("https://api.cloudflare.com/client/v4/accounts/{$this->accountId}/registrar/domains", [
                    'name' => $domainName,
                    'auto_renew' => true,
                    'locked' => true,
                    'registrant' => [
                        'first_name' => $contactInfo['first_name'],
                        'last_name' => $contactInfo['last_name'],
                        'organization' => $contactInfo['business_name'] ?? $business->name,
                        'address' => $contactInfo['address'],
                        'city' => $contactInfo['city'],
                        'state' => $contactInfo['state'],
                        'zip' => $contactInfo['zip'],
                        'country' => $contactInfo['country'] ?? 'US',
                        'phone' => $contactInfo['phone'],
                        'email' => $contactInfo['email'],
                    ],
                ]);

            if (! $response->successful()) {
                return [
                    'success' => false,
                    'error' => 'Domain registration failed. '.($response->json('errors.0.message') ?? 'Please try again.'),
                ];
            }

            $cfData = $response->json('result');

            $domain = BusinessDomain::create([
                'business_id' => $business->id,
                'domain_name' => $domainName,
                'domain_source' => 'purchased',
                'status' => 'purchased',
                'cloudflare_registration_id' => $cfData['id'] ?? null,
                'purchase_price' => $cfData['price'] ?? null,
                'purchase_currency' => $cfData['currency'] ?? 'USD',
                'registration_date' => now(),
                'expiration_date' => now()->addYear(),
                'auto_renew' => true,
                'dns_check_method' => 'cloudflare_managed',
            ]);

            $this->configureDns($domain);

            if ($business->domains()->where('is_primary', true)->doesntExist()) {
                $domain->update(['is_primary' => true]);
            }

            return [
                'success' => true,
                'domain' => $domain,
                'price' => $cfData['price'] ?? null,
                'message' => "Domain registered! You paid exactly \${$cfData['price']} — Cloudflare's at-cost rate. We charged you zero markup.",
            ];
        });
    }

    /**
     * Pass-through the renewal cost to customer.
     */
    public function getRenewalCost(BusinessDomain $domain): ?float
    {
        if ($domain->domain_source !== 'purchased') {
            return null;
        }

        $response = Http::withToken($this->apiToken)
            ->get("https://api.cloudflare.com/client/v4/accounts/{$this->accountId}/registrar/domains/{$domain->domain_name}");

        return $response->json('result.renewal_price');
    }

    /**
     * Configure DNS records for a Cloudflare-managed domain.
     * Points domain to AlphaSite infrastructure automatically.
     */
    private function configureDns(BusinessDomain $domain): void
    {
        $zoneId = config('services.cloudflare.zone_id');

        Http::withToken($this->apiToken)
            ->post("https://api.cloudflare.com/client/v4/zones/{$zoneId}/dns_records", [
                'type' => 'CNAME',
                'name' => $domain->domain_name,
                'content' => config('alphasite.hostname', 'alphasite.app'),
                'proxied' => true,
                'ttl' => 1,
            ]);

        $domain->update([
            'status' => 'active',
            'dns_verified_at' => now(),
            'ssl_provisioned_at' => now(),
        ]);
    }
}
