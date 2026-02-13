<?php

declare(strict_types=1);

namespace App\Services\Domain;

use App\Models\Business;
use App\Models\BusinessDomain;
use App\Models\DomainDnsCheck;

final class ExternalDomainService
{
    /**
     * Register an external domain the customer already owns.
     * We give them DNS instructions and start checking.
     *
     * @return array{success: bool, domain?: BusinessDomain, instructions?: array<string, mixed>, error?: string}
     */
    public function register(Business $business, string $domainName, string $method = 'cname'): array
    {
        $domainName = mb_strtolower(mb_trim($domainName));

        if (BusinessDomain::where('domain_name', $domainName)->exists()) {
            return [
                'success' => false,
                'error' => 'This domain is already registered in our system.',
            ];
        }

        $instructions = $this->generateDnsInstructions($business, $domainName, $method);

        $domain = BusinessDomain::create([
            'business_id' => $business->id,
            'domain_name' => $domainName,
            'domain_source' => 'external',
            'status' => 'pending_dns',
            'dns_check_method' => $method,
            'dns_instructions' => $instructions,
        ]);

        if ($business->domains()->where('is_primary', true)->doesntExist()) {
            $domain->update(['is_primary' => true]);
        }

        return [
            'success' => true,
            'domain' => $domain,
            'instructions' => $instructions,
        ];
    }

    /**
     * Check if DNS is properly configured.
     * Called by scheduled job every 5 minutes for pending domains.
     */
    public function verifyDns(BusinessDomain $domain): bool
    {
        $domainName = $domain->domain_name;
        $expectedHost = config('alphasite.hostname', 'alphasite.app');
        $expectedIp = config('alphasite.ip');

        $passed = false;
        $results = [];
        $failureReason = null;

        $cnames = @dns_get_record($domainName, DNS_CNAME);
        if ($cnames) {
            $results['cname'] = $cnames;
            foreach ($cnames as $record) {
                if (str_contains($record['target'] ?? '', $expectedHost)) {
                    $passed = true;
                }
            }
        }

        if (! $passed) {
            $aRecords = @dns_get_record($domainName, DNS_A);
            $results['a_records'] = $aRecords ?: [];
            if ($aRecords && $expectedIp) {
                foreach ($aRecords as $record) {
                    if (($record['ip'] ?? '') === $expectedIp) {
                        $passed = true;
                    }
                }
            }
        }

        if (! $passed) {
            $failureReason = 'DNS records not yet pointing to AlphaSite. This can take up to 48 hours.';
        }

        DomainDnsCheck::create([
            'business_domain_id' => $domain->id,
            'passed' => $passed,
            'results' => $results,
            'failure_reason' => $failureReason,
        ]);

        if ($passed) {
            $domain->update([
                'status' => 'active',
                'dns_verified_at' => now(),
                'last_dns_check_at' => now(),
            ]);
        } else {
            $domain->update([
                'last_dns_check_at' => now(),
            ]);
        }

        return $passed;
    }

    /**
     * Generate clear, simple DNS instructions.
     * These should be copy-pasteable by someone who's never touched DNS.
     *
     * @return array<string, mixed>
     */
    private function generateDnsInstructions(Business $business, string $domainName, string $method): array
    {
        $alphasiteHost = config('alphasite.hostname', 'alphasite.app');
        $alphasiteIp = config('alphasite.ip', '0.0.0.0');

        if ($method === 'cname') {
            return [
                'method' => 'cname',
                'summary' => 'Point your domain to AlphaSite',
                'steps' => [
                    '1. Log into wherever you bought your domain (GoDaddy, Namecheap, Google Domains, etc.)',
                    "2. Find 'DNS Settings' or 'DNS Management'",
                    '3. Add a new CNAME record:',
                    '   - Name/Host: @ (or leave blank — depends on your provider)',
                    "   - Value/Points to: {$alphasiteHost}",
                    '   - TTL: Automatic (or 3600)',
                    "4. If your provider doesn't allow CNAME on the root domain, add an A record instead:",
                    '   - Name/Host: @',
                    "   - Value/Points to: {$alphasiteIp}",
                    '   - TTL: Automatic (or 3600)',
                    "5. Wait 5-30 minutes. We'll check automatically and email you when it's working.",
                ],
                'record_type' => 'CNAME',
                'record_name' => '@',
                'record_value' => $alphasiteHost,
                'fallback_type' => 'A',
                'fallback_value' => $alphasiteIp,
            ];
        }

        return [
            'method' => 'a_record',
            'summary' => 'Point your domain to AlphaSite',
            'steps' => [
                '1. Log into wherever you bought your domain',
                "2. Find 'DNS Settings' or 'DNS Management'",
                '3. Add (or edit) an A record:',
                '   - Name/Host: @',
                "   - Value/Points to: {$alphasiteIp}",
                '   - TTL: Automatic (or 3600)',
                "4. Wait 5-30 minutes. We'll check automatically and email you when it's working.",
            ],
            'record_type' => 'A',
            'record_name' => '@',
            'record_value' => $alphasiteIp,
        ];
    }
}
