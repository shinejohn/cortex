<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Contracts\GeocodingServiceInterface;
use App\Jobs\Regions\GeocodeRegionJob;
use App\Models\Region;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;

final class GeocodeRegionsCommand extends Command
{
    protected $signature = 'regions:geocode
                            {--type= : Filter by region type (state, county, city, neighborhood)}
                            {--dry-run : Show what would be geocoded without making changes}
                            {--sync : Run synchronously instead of dispatching jobs}
                            {--delay=2 : Delay in seconds between job dispatches (default: 2)}
                            {--force-google : Skip free APIs and use Google Maps API directly for accurate coordinates}
                            {--all : Include regions that already have coordinates (useful for re-geocoding with --force-google)}';

    protected $description = 'Geocode regions that are missing latitude/longitude coordinates';

    public function handle(GeocodingServiceInterface $geocodingService): int
    {
        $type = $this->option('type');
        $dryRun = $this->option('dry-run');
        $sync = $this->option('sync');
        $delay = (int) $this->option('delay');
        $forceGoogle = (bool) $this->option('force-google');
        $includeAll = (bool) $this->option('all');

        $query = $this->buildQuery($type, $includeAll);
        $regions = $query->get();

        if ($regions->isEmpty()) {
            $this->info($includeAll ? 'No regions found.' : 'No regions found missing coordinates.');

            return Command::SUCCESS;
        }

        $message = $includeAll
            ? "Found {$regions->count()} regions to geocode (including existing coordinates)."
            : "Found {$regions->count()} regions missing coordinates.";
        $this->info($message);

        if ($forceGoogle) {
            $this->info('Using Google Maps API directly (force-google mode).');
        }

        if ($dryRun) {
            return $this->displayDryRun($regions);
        }

        if ($sync) {
            return $this->processSynchronously($regions, $geocodingService, $forceGoogle);
        }

        return $this->processViaQueue($regions, $delay, $forceGoogle);
    }

    private function buildQuery(?string $type, bool $includeAll = false): Builder
    {
        $query = Region::query();

        // Only filter for missing coordinates if not including all
        if (! $includeAll) {
            $query->where(function (Builder $q) {
                $q->whereNull('latitude')
                    ->orWhereNull('longitude');
            });
        }

        if ($type) {
            $validTypes = ['state', 'county', 'city', 'neighborhood'];

            if (! in_array($type, $validTypes)) {
                $this->error("Invalid type: {$type}. Valid types: ".implode(', ', $validTypes));

                return $query->whereRaw('1 = 0'); // Return empty query
            }

            $query->where('type', $type);
        }

        return $query->orderBy('type')->orderBy('name');
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Collection<int, Region>  $regions
     */
    private function displayDryRun($regions): int
    {
        $this->newLine();
        $this->info('=== Dry Run Mode ===');
        $this->newLine();

        $byType = $regions->groupBy('type');

        foreach ($byType as $type => $typeRegions) {
            $this->info(ucfirst($type).'s: '.$typeRegions->count());

            foreach ($typeRegions->take(10) as $region) {
                $this->line("  - {$region->name}");
            }

            if ($typeRegions->count() > 10) {
                $this->line('  ... and '.($typeRegions->count() - 10).' more');
            }

            $this->newLine();
        }

        $this->table(
            ['Type', 'Count'],
            $byType->map(fn ($items, $type) => [ucfirst($type), $items->count()])->values()->toArray()
        );

        return Command::SUCCESS;
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Collection<int, Region>  $regions
     */
    private function processSynchronously($regions, GeocodingServiceInterface $geocodingService, bool $forceGoogle = false): int
    {
        $this->info('Processing synchronously...');
        $this->newLine();

        $bar = $this->output->createProgressBar($regions->count());
        $bar->start();

        $success = 0;
        $failed = 0;

        foreach ($regions as $region) {
            $result = $geocodingService->geocodeRegion($region, $forceGoogle);

            if ($result) {
                $success++;
            } else {
                $failed++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->displayResults($success, $failed);

        return Command::SUCCESS;
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Collection<int, Region>  $regions
     */
    private function processViaQueue($regions, int $delay, bool $forceGoogle = false): int
    {
        $this->info("Dispatching jobs with {$delay} second delay between each...");
        $this->newLine();

        $bar = $this->output->createProgressBar($regions->count());
        $bar->start();

        $dispatched = 0;

        foreach ($regions as $index => $region) {
            $jobDelay = $index * $delay;

            GeocodeRegionJob::dispatch($region, $forceGoogle)->delay(now()->addSeconds($jobDelay));

            $dispatched++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Dispatched {$dispatched} geocoding jobs to the queue.");
        $this->line('Jobs will be processed by your queue worker.');

        $totalTime = $regions->count() * $delay;
        $this->line("Estimated completion time: ~{$totalTime} seconds (at {$delay}s intervals).");

        return Command::SUCCESS;
    }

    private function displayResults(int $success, int $failed): void
    {
        $this->table(
            ['Result', 'Count'],
            [
                ['Geocoded Successfully', $success],
                ['Failed', $failed],
                ['Total Processed', $success + $failed],
            ]
        );

        if ($failed > 0) {
            $this->warn('Some regions failed to geocode. Check logs for details.');
        }
    }
}
