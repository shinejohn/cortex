<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\Region;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final class NewsWorkflowService
{
    public function __construct(
        private readonly BusinessDiscoveryService $businessDiscovery,
        private readonly NewsCollectionService $newsCollection,
        private readonly ContentCurationService $contentCuration,
        private readonly FactCheckingService $factChecking,
        private readonly ArticleGenerationService $articleGeneration,
        private readonly PublishingService $publishing
    ) {}

    /**
     * Run complete workflow for all regions
     */
    public function runCompleteWorkflow(): array
    {
        $results = [
            'total_regions' => 0,
            'successful_regions' => 0,
            'failed_regions' => 0,
            'phases' => [
                'business_discovery' => 0,
                'news_collection' => 0,
                'shortlisting' => 0,
                'fact_checking' => 0,
                'final_selection' => 0,
                'article_generation' => 0,
                'publishing' => 0,
            ],
            'errors' => [],
        ];

        Log::info('Starting complete news workflow');

        $regions = Region::all();
        $results['total_regions'] = $regions->count();

        foreach ($regions as $region) {
            try {
                $regionResults = $this->runWorkflowForRegion($region);

                // Aggregate phase results
                foreach ($regionResults['phases'] as $phase => $count) {
                    $results['phases'][$phase] += $count;
                }

                $results['successful_regions']++;

                Log::info('Completed workflow for region', [
                    'region' => $region->name,
                    'results' => $regionResults,
                ]);
            } catch (Exception $e) {
                $results['failed_regions']++;
                $results['errors'][] = [
                    'region' => $region->name,
                    'error' => $e->getMessage(),
                ];

                Log::error('Failed workflow for region', [
                    'region' => $region->name,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }

        Log::info('Completed news workflow', ['results' => $results]);

        return $results;
    }

    /**
     * Run workflow for a specific region
     */
    public function runWorkflowForRegion(Region $region): array
    {
        $results = [
            'region' => $region->name,
            'phases' => [
                'business_discovery' => 0,
                'news_collection' => 0,
                'shortlisting' => 0,
                'fact_checking' => 0,
                'final_selection' => 0,
                'article_generation' => 0,
                'publishing' => 0,
            ],
        ];

        Log::info('Starting workflow for region', ['region' => $region->name]);

        // Phase 1: Business Discovery (monthly)
        if ($this->shouldRunBusinessDiscovery()) {
            $results['phases']['business_discovery'] = $this->businessDiscovery->discoverBusinesses($region);
        }

        // Phase 2: News Collection (daily)
        $results['phases']['news_collection'] = $this->newsCollection->collectForRegion($region);

        // Phase 3: Content Shortlisting
        $results['phases']['shortlisting'] = $this->contentCuration->shortlistArticles($region);

        // Phase 4: Fact-Checking & Outline Generation
        $results['phases']['fact_checking'] = $this->factChecking->processForRegion($region);

        // Phase 5: Final Article Selection
        $results['phases']['final_selection'] = $this->contentCuration->finalSelection($region);

        // Phase 6: Article Generation
        $results['phases']['article_generation'] = $this->articleGeneration->generateArticles($region);

        // Phase 7: Publishing
        $results['phases']['publishing'] = $this->publishing->publishArticles($region);

        return $results;
    }

    /**
     * Run only daily workflow phases (skip business discovery)
     */
    public function runDailyWorkflow(): array
    {
        $results = [
            'total_regions' => 0,
            'successful_regions' => 0,
            'failed_regions' => 0,
            'phases' => [
                'news_collection' => 0,
                'shortlisting' => 0,
                'fact_checking' => 0,
                'final_selection' => 0,
                'article_generation' => 0,
                'publishing' => 0,
            ],
            'errors' => [],
        ];

        Log::info('Starting daily news workflow');

        $regions = Region::all();
        $results['total_regions'] = $regions->count();

        foreach ($regions as $region) {
            try {
                $regionResults = $this->runDailyWorkflowForRegion($region);

                // Aggregate phase results
                foreach ($regionResults['phases'] as $phase => $count) {
                    $results['phases'][$phase] += $count;
                }

                $results['successful_regions']++;

                Log::info('Completed daily workflow for region', [
                    'region' => $region->name,
                    'results' => $regionResults,
                ]);
            } catch (Exception $e) {
                $results['failed_regions']++;
                $results['errors'][] = [
                    'region' => $region->name,
                    'error' => $e->getMessage(),
                ];

                Log::error('Failed daily workflow for region', [
                    'region' => $region->name,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Completed daily workflow', ['results' => $results]);

        return $results;
    }

    /**
     * Run daily workflow for a specific region (excludes business discovery)
     */
    public function runDailyWorkflowForRegion(Region $region): array
    {
        $results = [
            'region' => $region->name,
            'phases' => [
                'news_collection' => 0,
                'shortlisting' => 0,
                'fact_checking' => 0,
                'final_selection' => 0,
                'article_generation' => 0,
                'publishing' => 0,
            ],
        ];

        Log::info('Starting daily workflow for region', ['region' => $region->name]);

        // Phase 2: News Collection
        $results['phases']['news_collection'] = $this->newsCollection->collectForRegion($region);

        // Phase 3: Content Shortlisting
        $results['phases']['shortlisting'] = $this->contentCuration->shortlistArticles($region);

        // Phase 4: Fact-Checking & Outline Generation
        $results['phases']['fact_checking'] = $this->factChecking->processForRegion($region);

        // Phase 5: Final Article Selection
        $results['phases']['final_selection'] = $this->contentCuration->finalSelection($region);

        // Phase 6: Article Generation
        $results['phases']['article_generation'] = $this->articleGeneration->generateArticles($region);

        // Phase 7: Publishing
        $results['phases']['publishing'] = $this->publishing->publishArticles($region);

        return $results;
    }

    /**
     * Run only business discovery phase (monthly)
     */
    public function runBusinessDiscovery(): array
    {
        $results = [
            'total_regions' => 0,
            'successful_regions' => 0,
            'failed_regions' => 0,
            'total_businesses_discovered' => 0,
            'errors' => [],
        ];

        Log::info('Starting business discovery');

        $regions = Region::all();
        $results['total_regions'] = $regions->count();

        foreach ($regions as $region) {
            try {
                $count = $this->businessDiscovery->discoverBusinesses($region);
                $results['total_businesses_discovered'] += $count;
                $results['successful_regions']++;

                Log::info('Completed business discovery for region', [
                    'region' => $region->name,
                    'businesses_discovered' => $count,
                ]);
            } catch (Exception $e) {
                $results['failed_regions']++;
                $results['errors'][] = [
                    'region' => $region->name,
                    'error' => $e->getMessage(),
                ];

                Log::error('Failed business discovery for region', [
                    'region' => $region->name,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Completed business discovery', ['results' => $results]);

        return $results;
    }

    /**
     * Get workflow statistics
     */
    public function getWorkflowStats(): array
    {
        return [
            'regions_count' => Region::count(),
            'pending_articles' => DB::table('news_articles')->where('processed', false)->count(),
            'shortlisted_drafts' => DB::table('news_article_drafts')->where('status', 'shortlisted')->count(),
            'ready_for_generation' => DB::table('news_article_drafts')->where('status', 'ready_for_generation')->count(),
            'ready_for_publishing' => DB::table('news_article_drafts')->where('status', 'ready_for_publishing')->count(),
            'published_drafts' => DB::table('news_article_drafts')->where('status', 'published')->count(),
            'rejected_drafts' => DB::table('news_article_drafts')->where('status', 'rejected')->count(),
        ];
    }

    /**
     * Check if business discovery should run (monthly)
     */
    private function shouldRunBusinessDiscovery(): bool
    {
        // Business discovery runs monthly
        // Check last run date from config or database
        $lastRun = config('news-workflow.business_discovery.last_run');

        if (! $lastRun) {
            return true;
        }

        $lastRunDate = \Carbon\Carbon::parse($lastRun);
        $daysSinceLastRun = now()->diffInDays($lastRunDate);

        // Run if more than 30 days since last run
        return $daysSinceLastRun >= config('news-workflow.business_discovery.run_interval_days', 30);
    }
}
