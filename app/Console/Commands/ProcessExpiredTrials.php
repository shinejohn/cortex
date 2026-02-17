<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\AlphaSite\SubscriptionLifecycleService;
use Illuminate\Console\Command;

final class ProcessExpiredTrials extends Command
{
    protected $signature = 'alphasite:process-expired-trials';

    protected $description = 'Process expired 90-day trials and downgrade to basic listings';

    public function handle(SubscriptionLifecycleService $service): int
    {
        $count = $service->processExpiredTrials();
        $this->info("Processed {$count} expired trials.");

        return self::SUCCESS;
    }
}
