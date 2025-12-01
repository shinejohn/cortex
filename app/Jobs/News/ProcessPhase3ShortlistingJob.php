<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\NewsArticle;
use App\Models\Region;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

final class ProcessPhase3ShortlistingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 60; // 1 minute (just for dispatching jobs)

    public $tries = 1;

    public $failOnTimeout = true;

    public function __construct(
        public Region $region
    ) {}

    public function handle(): void
    {
        Log::info('Phase 3: Starting article shortlisting dispatcher', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        try {
            // Check if shortlisting is enabled
            if (! config('news-workflow.shortlisting.enabled', true)) {
                Log::info('Phase 3: Shortlisting is disabled, skipping to Phase 4', [
                    'region_id' => $this->region->id,
                ]);

                ProcessPhase4FactCheckingJob::dispatch($this->region);

                return;
            }

            // Get unprocessed articles for this region
            $articles = NewsArticle::where('region_id', $this->region->id)
                ->where('processed', false)
                ->get();

            $articleCount = $articles->count();

            Log::info('Phase 3: Found unprocessed articles', [
                'region_id' => $this->region->id,
                'count' => $articleCount,
            ]);

            // If no articles to score, skip to Phase 4
            if ($articleCount === 0) {
                Log::info('Phase 3: No articles to score, skipping to Phase 4', [
                    'region_id' => $this->region->id,
                ]);

                ProcessPhase4FactCheckingJob::dispatch($this->region);

                return;
            }

            // Initialize job counter in cache
            $cacheKey = "article_scoring_jobs:{$this->region->id}";
            Cache::put($cacheKey, $articleCount, now()->addHours(24));

            Log::debug('Phase 3: Initialized job counter', [
                'cache_key' => $cacheKey,
                'job_count' => $articleCount,
            ]);

            // Dispatch individual scoring jobs for each article
            $jobsDispatched = 0;
            foreach ($articles as $article) {
                ProcessSingleArticleScoringJob::dispatch($article, $this->region);
                $jobsDispatched++;
            }

            Log::info('Phase 3: Dispatched article scoring jobs', [
                'region_id' => $this->region->id,
                'jobs_dispatched' => $jobsDispatched,
            ]);
        } catch (Exception $e) {
            Log::error('Phase 3: Shortlisting dispatcher failed', [
                'region_id' => $this->region->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Phase 3: Shortlisting dispatcher job permanently failed', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);
    }
}
