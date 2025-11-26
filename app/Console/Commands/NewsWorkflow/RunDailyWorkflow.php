<?php

declare(strict_types=1);

namespace App\Console\Commands\NewsWorkflow;

use App\Jobs\News\ProcessRegionDailyWorkflowJob;
use App\Models\Region;
use Illuminate\Console\Command;

final class RunDailyWorkflow extends Command
{
    protected $signature = 'news:run-daily
                           {--region= : Run workflow for a specific region ID}';

    protected $description = 'Dispatch daily news workflow jobs (Phases 2-7: Collection, Curation, Fact-Checking, Generation, Publishing)';

    public function handle(): int
    {
        $this->info('Dispatching daily news workflow jobs...');
        $this->newLine();

        $regionId = $this->option('region');

        if ($regionId) {
            $region = Region::find($regionId);

            if (! $region) {
                $this->error("Region with ID {$regionId} not found.");

                return self::FAILURE;
            }

            ProcessRegionDailyWorkflowJob::dispatch($region);

            $this->info("Dispatched workflow job for region: {$region->name}");
            $this->info('Monitor with: php artisan queue:work');
        } else {
            $regions = Region::active()
                ->get()
                ->filter(fn (Region $region) => $region->metadata['workflow_enabled'] ?? true);

            $count = 0;
            foreach ($regions as $region) {
                ProcessRegionDailyWorkflowJob::dispatch($region);
                $count++;
            }

            $this->info("Dispatched {$count} workflow jobs for parallel processing");
            $this->info('Monitor with: php artisan queue:work');
        }

        return self::SUCCESS;
    }
}
