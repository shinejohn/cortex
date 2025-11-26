<?php

declare(strict_types=1);

namespace App\Console\Commands\NewsWorkflow;

use App\Jobs\News\ProcessRegionBusinessDiscoveryJob;
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

            ProcessRegionBusinessDiscoveryJob::dispatch($region);

            $this->info("Dispatched business discovery job for region: {$region->name}");
            $this->info('Monitor with: php artisan queue:work');
        } else {
            $regions = Region::active()->get();

            $count = 0;
            foreach ($regions as $region) {
                ProcessRegionBusinessDiscoveryJob::dispatch($region);
                $count++;
            }

            $this->info("Dispatched {$count} business discovery jobs for parallel processing");
            $this->info('Monitor with: php artisan queue:work');
        }

        return self::SUCCESS;
    }
}
