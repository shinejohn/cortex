<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Jobs\Newsroom\ProcessRssCollectionJob;
use App\Jobs\Newsroom\ProcessWebScrapingJob;
use App\Models\CollectionMethod;
use App\Models\Region;
use Illuminate\Support\Facades\Log;

class NewsCollectionService
{
    /**
     * Trigger collection for a specific region.
     * Returns the number of collection jobs dispatched.
     */
    public function collectForRegion(Region $region): int
    {
        Log::info('Starting Newsroom collection for region', ['region' => $region->name]);

        // Find collection methods for sources in this region that are active and due
        // We assume 'dueForCollection' scope exists on CollectionMethod as seen in DispatchCollectionJob
        $methods = CollectionMethod::query()
            ->whereHas('source', function ($query) use ($region) {
                $query->where('region_id', $region->id)
                    ->where('is_active', true);
            })
            // We can optionally check 'dueForCollection' here or force collect for the workflow
            // For a daily workflow, forcing might be appropriate, or just checking if enabled.
            ->where('is_enabled', true)
            ->get();

        $count = 0;

        foreach ($methods as $method) {
            if ($method->method_type === CollectionMethod::TYPE_RSS) {
                ProcessRssCollectionJob::dispatch($method->id)->onQueue('collection');
                $count++;
            } elseif ($method->method_type === CollectionMethod::TYPE_SCRAPE) {
                ProcessWebScrapingJob::dispatch($method->id)->onQueue('collection');
                $count++;
            }
            // Add other types as needed
        }

        Log::info('Dispatched Newsroom collection jobs', [
            'region' => $region->name,
            'count' => $count
        ]);

        return $count;
    }
}
