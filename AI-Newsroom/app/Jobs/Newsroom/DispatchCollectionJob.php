<?php

namespace App\Jobs\Newsroom;

use App\Models\CollectionMethod;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DispatchCollectionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        // Dispatch RSS collection
        CollectionMethod::dueForCollection()
            ->where('method_type', CollectionMethod::TYPE_RSS)
            ->each(fn($m) => ProcessRssCollectionJob::dispatch($m->id)->onQueue('collection'));

        // Dispatch web scraping
        CollectionMethod::dueForCollection()
            ->where('method_type', CollectionMethod::TYPE_SCRAPE)
            ->each(fn($m) => ProcessWebScrapingJob::dispatch($m->id)->onQueue('collection'));
    }
}
