<?php

declare(strict_types=1);

namespace App\Console\Commands\NewsWorkflow;

use App\Jobs\News\ProcessBusinessDiscoveryDispatcherJob;
use App\Models\Region;
use Illuminate\Console\Command;

final class RunBusinessDiscovery extends Command
{
    protected $signature = 'news:discover-businesses
                           {--region= : Run discovery for a specific region ID}';

    protected $description = 'Dispatch business discovery jobs for local news sources (Phase 1 - typically monthly)';

    public function handle(): int
    {
        $this->info('Dispatching business discovery jobs...');
        $this->newLine();

        $regionId = $this->option('region');

        if ($regionId) {
            $region = Region::find($regionId);

            if (! $region) {
                $this->error("Region with ID {$regionId} not found.");

                return self::FAILURE;
            }

            ProcessBusinessDiscoveryDispatcherJob::dispatch($region);

            $this->info("Dispatched business discovery dispatcher for region: {$region->name}");
            $this->info('Monitor with: php artisan queue:work');
        } else {
            $regions = Region::active()->get();

            $count = 0;
            foreach ($regions as $region) {
                ProcessBusinessDiscoveryDispatcherJob::dispatch($region);
                $count++;
            }

            $this->info("Dispatched {$count} business discovery dispatchers for parallel processing");
            $this->info('Monitor with: php artisan queue:work');
        }

        return self::SUCCESS;
    }
}
