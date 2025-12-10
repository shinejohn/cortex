<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\News\FetchFrequencyService;
use Illuminate\Console\Command;

final class SyncFetchFrequenciesCommand extends Command
{
    protected $signature = 'news:sync-frequencies
                           {--status : Show current fetch status for all categories}';

    protected $description = 'Sync default fetch frequencies from config to database';

    public function handle(FetchFrequencyService $service): int
    {
        if ($this->option('status')) {
            return $this->showStatus($service);
        }

        $this->info('Syncing default fetch frequencies from config to database...');
        $this->newLine();

        $synced = $service->syncDefaultFrequencies();

        $this->info("Synced {$synced} frequency configurations.");
        $this->newLine();
        $this->info('You can manage frequencies in the Filament admin panel.');

        return self::SUCCESS;
    }

    private function showStatus(FetchFrequencyService $service): int
    {
        $this->info('Current fetch frequency status:');
        $this->newLine();

        $status = $service->getCategoryStatus();

        $headers = ['Category', 'Frequency', 'Last Fetched', 'Should Fetch Today'];

        $rows = $status->map(function (array $item) {
            return [
                $item['category'],
                $item['frequency'],
                $item['last_fetched_at']?->diffForHumans() ?? 'Never',
                $item['should_fetch'] ? 'Yes' : 'No',
            ];
        })->toArray();

        $this->table($headers, $rows);

        $toFetch = $status->filter(fn (array $item) => $item['should_fetch'])->count();
        $total = $status->count();

        $this->newLine();
        $this->info("{$toFetch} of {$total} categories will be fetched today.");

        return self::SUCCESS;
    }
}
