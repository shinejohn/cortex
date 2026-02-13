<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\BusinessDomain;
use App\Services\Domain\ExternalDomainService;
use Illuminate\Console\Command;

final class CheckPendingDomains extends Command
{
    protected $signature = 'domains:check-pending';

    protected $description = 'Check DNS for all pending external domains';

    public function handle(ExternalDomainService $service): void
    {
        $pending = BusinessDomain::query()
            ->where('status', 'pending_dns')
            ->where('domain_source', 'external')
            ->where(function ($q) {
                $q->whereNull('last_dns_check_at')
                    ->orWhere('last_dns_check_at', '<', now()->subMinutes(5));
            })
            ->get();

        $this->info("Checking {$pending->count()} pending domains...");

        foreach ($pending as $domain) {
            $passed = $service->verifyDns($domain);
            $status = $passed ? '✓' : '✗';
            $this->line("  {$status} {$domain->domain_name}");
        }
    }
}
