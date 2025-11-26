<?php

declare(strict_types=1);

namespace App\Console\Commands\NewsWorkflow;

use App\Jobs\News\ProcessCollectedNewsJob;
use App\Models\Region;
use Illuminate\Console\Command;

final class ProcessCollectedNewsCommand extends Command
{
    protected $signature = 'news:process-collected
                           {--region= : Process for a specific region ID}
                           {--sync : Run synchronously instead of dispatching to queue}';

    protected $description = 'Process collected news through phases 3-7 (Shortlisting, Fact-Checking, Selection, Generation, Publishing)';

    public function handle(): int
    {
        $this->info('Starting news processing workflow (Phases 3-7)...');
        $this->newLine();

        $regionId = $this->option('region');
        $sync = $this->option('sync');

        if ($regionId) {
            $region = Region::find($regionId);

            if (! $region) {
                $this->error("Region with ID {$regionId} not found.");

                return self::FAILURE;
            }

            $this->dispatchForRegion($region, $sync);
        } else {
            $regions = Region::active()
                ->get()
                ->filter(fn (Region $region) => $region->metadata['workflow_enabled'] ?? true);

            $this->info("Processing {$regions->count()} regions...");
            $this->newLine();

            foreach ($regions as $region) {
                $this->dispatchForRegion($region, $sync);
            }
        }

        if (! $sync) {
            $this->newLine();
            $this->info('Jobs dispatched. Run `php artisan queue:work` to process them.');
        }

        return self::SUCCESS;
    }

    private function dispatchForRegion(Region $region, bool $sync): void
    {
        if ($sync) {
            $this->info("Processing synchronously: {$region->name}");
            ProcessCollectedNewsJob::dispatchSync($region);
            $this->info("✓ Completed processing for {$region->name}");
        } else {
            ProcessCollectedNewsJob::dispatch($region);
            $this->info("Dispatched job for: {$region->name}");
        }
    }
}
