<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\CollectionMethod;
use App\Models\Region;
use App\Services\News\EventCollectionService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

final class ProcessEventCalendarCollectionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300;

    public $tries = 1;

    public $failOnTimeout = true;

    public function __construct(
        public Region $region
    ) {}

    public function handle(EventCollectionService $eventCollection): void
    {
        if (! config('news-workflow.event_collection.enabled', true)) {
            Log::info('EventCalendarCollection: Disabled, skipping', ['region_id' => $this->region->id]);

            return;
        }

        Log::info('EventCalendarCollection: Starting for region', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        $methods = CollectionMethod::dueForCollection()
            ->whereHas('source', fn ($q) => $q->where('region_id', $this->region->id))
            ->whereIn('method_type', [
                CollectionMethod::TYPE_EVENT_CALENDAR,
                CollectionMethod::TYPE_ICAL,
            ])
            ->with('source')
            ->get();

        $stats = ['attempted' => 0, 'created' => 0, 'skipped' => 0, 'failed' => 0];

        foreach ($methods as $method) {
            $stats['attempted']++;

            try {
                $result = $eventCollection->collectFromMethod($method);
                $stats['created'] += $result['created'];
                $stats['skipped'] += $result['skipped'];
            } catch (Exception $e) {
                $stats['failed']++;
                $method->recordFailure($e->getMessage());
                Log::warning('EventCalendarCollection: Method failed', [
                    'method_id' => $method->id,
                    'source' => $method->source->name ?? 'unknown',
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('EventCalendarCollection: Completed for region', [
            'region_id' => $this->region->id,
            'stats' => $stats,
        ]);
    }

    public function failed(Throwable $exception): void
    {
        Log::error('EventCalendarCollection: Job failed', [
            'region_id' => $this->region->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
