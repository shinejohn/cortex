<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\Story\ProcessStoryFollowUpsJob;
use App\Models\NewsArticle;
use App\Models\Region;
use App\Models\StoryThread;
use App\Services\Story\EngagementScoringService;
use App\Services\Story\StoryAnalysisService;
use App\Services\Story\StoryFollowUpService;
use Illuminate\Console\Command;

/**
 * Manage Story Threads Command
 * 
 * CLI for managing story threads and follow-up system
 */
class ManageStoryThreads extends Command
{
    protected $signature = 'story:threads
                            {action : Action to perform (list|show|create|analyze|triggers|queue|process|stats)}
                            {--region= : Region name or ID}
                            {--article= : Article ID (for create/analyze)}
                            {--thread= : Thread ID (for show/triggers)}
                            {--status= : Filter by status}
                            {--category= : Filter by category}
                            {--limit=20 : Limit results}
                            {--sync : Run synchronously instead of queued}
                            {--days=7 : Days to look back}';

    protected $description = 'Manage story threads and follow-up system';

    public function __construct(
        private readonly StoryAnalysisService $analysisService,
        private readonly StoryFollowUpService $followUpService,
        private readonly EngagementScoringService $engagementService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $action = $this->argument('action');

        return match ($action) {
            'list' => $this->listThreads(),
            'show' => $this->showThread(),
            'create' => $this->createThread(),
            'analyze' => $this->analyzeArticle(),
            'triggers' => $this->manageTriggers(),
            'queue' => $this->showFollowUpQueue(),
            'process' => $this->processFollowUps(),
            'stats' => $this->showStats(),
            default => $this->invalidAction($action),
        };
    }

    /**
     * List story threads
     */
    private function listThreads(): int
    {
        $region = $this->getRegion();
        if (!$region) return 1;

        $query = StoryThread::forRegion($region)
            ->with(['articles'])
            ->orderBy('last_article_at', 'desc');

        if ($status = $this->option('status')) {
            $query->where('status', $status);
        }

        if ($category = $this->option('category')) {
            $query->where('category', $category);
        }

        $threads = $query->limit((int) $this->option('limit'))->get();

        if ($threads->isEmpty()) {
            $this->info('No story threads found.');
            return 0;
        }

        $this->table(
            ['ID', 'Title', 'Status', 'Priority', 'Articles', 'Views', 'Comments', 'Last Update', 'Engagement'],
            $threads->map(fn ($t) => [
                substr($t->id, 0, 8),
                \Illuminate\Support\Str::limit($t->title, 40),
                $t->status,
                $t->priority,
                $t->total_articles,
                number_format($t->total_views),
                $t->total_comments,
                $t->last_article_at?->diffForHumans() ?? 'Never',
                round($t->avg_engagement_score, 1),
            ])->toArray()
        );

        return 0;
    }

    /**
     * Show thread details
     */
    private function showThread(): int
    {
        $threadId = $this->option('thread');
        if (!$threadId) {
            $this->error('Please provide --thread=<id>');
            return 1;
        }

        $thread = StoryThread::with(['articles', 'beats', 'pendingTriggers'])->find($threadId);
        if (!$thread) {
            $this->error("Thread not found: {$threadId}");
            return 1;
        }

        $this->info("Story Thread: {$thread->title}");
        $this->line("ID: {$thread->id}");
        $this->line("Status: {$thread->status}");
        $this->line("Priority: {$thread->priority}");
        $this->line("Category: {$thread->category}");
        $this->line("Created: {$thread->created_at->format('Y-m-d H:i')}");
        $this->newLine();

        // Summary
        if ($thread->summary) {
            $this->info("Summary:");
            $this->line($thread->summary);
            $this->newLine();
        }

        // Engagement
        $this->info("Engagement:");
        $this->line("  Views: " . number_format($thread->total_views));
        $this->line("  Comments: {$thread->total_comments}");
        $this->line("  Shares: {$thread->total_shares}");
        $this->line("  Avg Score: " . round($thread->avg_engagement_score, 1));
        $this->newLine();

        // Key People
        if (!empty($thread->key_people)) {
            $this->info("Key People:");
            foreach ($thread->key_people as $person) {
                $this->line("  - {$person['name']} ({$person['role']})");
            }
            $this->newLine();
        }

        // Articles
        $this->info("Articles ({$thread->total_articles}):");
        foreach ($thread->articles as $article) {
            $pivot = $article->pivot;
            $this->line("  [{$pivot->sequence_number}] {$pivot->narrative_role}: {$article->title}");
            $this->line("      Published: {$article->published_at?->format('Y-m-d')} | Views: " . number_format($article->views ?? 0));
        }
        $this->newLine();

        // Predicted Beats
        $pendingBeats = $thread->beats()->whereIn('status', ['predicted', 'expected'])->get();
        if ($pendingBeats->isNotEmpty()) {
            $this->info("Predicted Developments:");
            foreach ($pendingBeats as $beat) {
                $date = $beat->expected_date ?? $beat->predicted_date;
                $this->line("  [{$beat->status}] {$beat->title}");
                if ($date) {
                    $this->line("      Expected: {$date->format('Y-m-d')} | Likelihood: {$beat->likelihood}%");
                }
            }
            $this->newLine();
        }

        // Pending Triggers
        if ($thread->pendingTriggers->isNotEmpty()) {
            $this->info("Pending Triggers:");
            foreach ($thread->pendingTriggers as $trigger) {
                $this->line("  [{$trigger->trigger_type}] Check at: {$trigger->check_at->format('Y-m-d H:i')}");
            }
        }

        return 0;
    }

    /**
     * Create thread from article
     */
    private function createThread(): int
    {
        $articleId = $this->option('article');
        if (!$articleId) {
            $this->error('Please provide --article=<id>');
            return 1;
        }

        $article = NewsArticle::find($articleId);
        if (!$article) {
            $this->error("Article not found: {$articleId}");
            return 1;
        }

        $this->info("Analyzing article: {$article->title}");

        // Check if already in a thread
        if ($article->storyThreads()->exists()) {
            $this->warn('Article is already in a story thread.');
            return 1;
        }

        $thread = $this->analysisService->createThreadFromArticle($article);

        $this->info("Created story thread!");
        $this->line("ID: {$thread->id}");
        $this->line("Title: {$thread->title}");
        $this->line("Priority: {$thread->priority}");
        $this->line("Status: {$thread->status}");

        if (!empty($thread->predicted_beats)) {
            $this->newLine();
            $this->info("Predicted next developments:");
            foreach ($thread->predicted_beats as $beat) {
                $this->line("  - {$beat['title']}");
            }
        }

        return 0;
    }

    /**
     * Analyze article for follow-up potential
     */
    private function analyzeArticle(): int
    {
        $articleId = $this->option('article');
        if (!$articleId) {
            $this->error('Please provide --article=<id>');
            return 1;
        }

        $article = NewsArticle::find($articleId);
        if (!$article) {
            $this->error("Article not found: {$articleId}");
            return 1;
        }

        $this->info("Analyzing: {$article->title}");
        $this->newLine();

        $analysis = $this->analysisService->analyzeArticle($article);

        // Display results
        $this->line("Is Ongoing Story: " . ($analysis['is_ongoing_story'] ? '✓ Yes' : '✗ No'));
        $this->line("Is Resolved: " . ($analysis['is_resolved'] ? '✓ Yes' : '✗ No'));
        $this->line("Resolution Likelihood: {$analysis['resolution_likelihood']}%");
        $this->newLine();

        if (!empty($analysis['thread_title'])) {
            $this->info("Suggested Thread Title:");
            $this->line("  {$analysis['thread_title']}");
            $this->newLine();
        }

        if (!empty($analysis['key_people'])) {
            $this->info("Key People:");
            foreach ($analysis['key_people'] as $person) {
                $this->line("  - {$person['name']} ({$person['role']})");
            }
            $this->newLine();
        }

        if (!empty($analysis['unresolved_questions'])) {
            $this->info("Unresolved Questions:");
            foreach ($analysis['unresolved_questions'] as $q) {
                $this->line("  ? {$q}");
            }
            $this->newLine();
        }

        if (!empty($analysis['predicted_beats'])) {
            $this->info("Predicted Developments:");
            foreach ($analysis['predicted_beats'] as $beat) {
                $likelihood = $beat['likelihood'] ?? 50;
                $this->line("  [{$likelihood}%] {$beat['title']}");
            }
            $this->newLine();
        }

        // Engagement score
        $engagementScore = $this->engagementService->calculateArticleScore($article);
        $this->line("Engagement Score: " . round($engagementScore, 1) . "/100");

        return 0;
    }

    /**
     * Manage triggers for a thread
     */
    private function manageTriggers(): int
    {
        $threadId = $this->option('thread');
        
        if ($threadId) {
            $thread = StoryThread::with('triggers')->find($threadId);
            if (!$thread) {
                $this->error("Thread not found: {$threadId}");
                return 1;
            }

            $this->info("Triggers for: {$thread->title}");
            $this->newLine();

            $this->table(
                ['ID', 'Type', 'Status', 'Check At', 'Checks', 'Triggered'],
                $thread->triggers->map(fn ($t) => [
                    substr($t->id, 0, 8),
                    $t->trigger_type,
                    $t->status,
                    $t->check_at?->format('Y-m-d H:i'),
                    $t->check_count . ($t->max_checks ? "/{$t->max_checks}" : ''),
                    $t->triggered_at?->format('Y-m-d H:i') ?? '-',
                ])->toArray()
            );

            return 0;
        }

        // Show all pending triggers for region
        $region = $this->getRegion();
        if (!$region) return 1;

        $triggers = \App\Models\StoryFollowUpTrigger::dueForCheck()
            ->whereHas('storyThread', fn ($q) => $q->where('region_id', $region->id))
            ->with('storyThread')
            ->get();

        $this->info("Pending triggers for {$region->name}: {$triggers->count()}");
        
        if ($triggers->isNotEmpty()) {
            $this->table(
                ['Thread', 'Type', 'Check At', 'Checks'],
                $triggers->map(fn ($t) => [
                    \Illuminate\Support\Str::limit($t->storyThread->title ?? '', 30),
                    $t->trigger_type,
                    $t->check_at?->format('Y-m-d H:i'),
                    $t->check_count,
                ])->toArray()
            );
        }

        return 0;
    }

    /**
     * Show follow-up queue
     */
    private function showFollowUpQueue(): int
    {
        $region = $this->getRegion();
        if (!$region) return 1;

        $this->info("Generating follow-up queue for {$region->name}...");

        $queue = $this->followUpService->generateFollowUpQueue($region, (int) $this->option('limit'));

        if ($queue->isEmpty()) {
            $this->info('No follow-ups needed at this time.');
            return 0;
        }

        $this->newLine();
        $this->info("Follow-Up Queue ({$queue->count()} items):");
        $this->newLine();

        foreach ($queue as $item) {
            $this->line("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            $this->line("<fg=cyan>Thread:</> {$item['thread_title']}");
            $this->line("<fg=cyan>Priority:</> {$item['priority']} | Engagement: {$item['engagement_score']} | Days since update: {$item['days_since_update']}");
            $this->line("<fg=cyan>Suggested:</> {$item['suggestion']['title']}");
            $this->line("<fg=cyan>Angle:</> {$item['suggestion']['angle']}");
            if (!empty($item['suggestion']['search_queries'])) {
                $this->line("<fg=cyan>Search:</> " . implode(', ', array_slice($item['suggestion']['search_queries'], 0, 3)));
            }
            $this->newLine();
        }

        return 0;
    }

    /**
     * Process follow-ups
     */
    private function processFollowUps(): int
    {
        $region = $this->getRegion();
        if (!$region) return 1;

        if ($this->option('sync')) {
            $this->info("Processing follow-ups synchronously for {$region->name}...");

            $results = $this->followUpService->processTriggers($region);

            $this->table(
                ['Metric', 'Count'],
                [
                    ['Processed', $results['processed']],
                    ['Triggered', $results['triggered']],
                    ['Expired', $results['expired']],
                    ['Follow-ups Created', $results['follow_ups_created']],
                    ['Errors', count($results['errors'])],
                ]
            );

            // Also process high-engagement articles
            $this->newLine();
            $this->info("Processing high-engagement articles...");
            
            $engagementResults = $this->followUpService->processHighEngagementArticles($region);
            
            $this->table(
                ['Metric', 'Count'],
                [
                    ['Articles Analyzed', $engagementResults['articles_analyzed']],
                    ['Threads Created', $engagementResults['threads_created']],
                    ['Threads Joined', $engagementResults['threads_joined']],
                ]
            );

        } else {
            ProcessStoryFollowUpsJob::dispatch($region);
            $this->info("Dispatched follow-up processing job for {$region->name}");
        }

        return 0;
    }

    /**
     * Show statistics
     */
    private function showStats(): int
    {
        $region = $this->getRegion();
        if (!$region) return 1;

        $this->info("Story Thread Statistics for {$region->name}");
        $this->newLine();

        // Thread counts by status
        $statusCounts = StoryThread::forRegion($region)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $this->table(
            ['Status', 'Count'],
            collect($statusCounts)->map(fn ($count, $status) => [$status, $count])->toArray()
        );

        // Category breakdown
        $this->newLine();
        $categoryCounts = StoryThread::forRegion($region)
            ->active()
            ->selectRaw('category, count(*) as count')
            ->groupBy('category')
            ->orderByDesc('count')
            ->pluck('count', 'category')
            ->toArray();

        $this->info("Active Threads by Category:");
        $this->table(
            ['Category', 'Count'],
            collect($categoryCounts)->map(fn ($count, $cat) => [$cat, $count])->toArray()
        );

        // Top engaging threads
        $this->newLine();
        $topThreads = StoryThread::forRegion($region)
            ->active()
            ->orderByDesc('avg_engagement_score')
            ->limit(5)
            ->get();

        $this->info("Top Engaging Active Threads:");
        $this->table(
            ['Title', 'Score', 'Articles', 'Comments'],
            $topThreads->map(fn ($t) => [
                \Illuminate\Support\Str::limit($t->title, 40),
                round($t->avg_engagement_score, 1),
                $t->total_articles,
                $t->total_comments,
            ])->toArray()
        );

        // Pending triggers
        $pendingTriggers = \App\Models\StoryFollowUpTrigger::pending()
            ->whereHas('storyThread', fn ($q) => $q->where('region_id', $region->id))
            ->count();

        $dueTriggers = \App\Models\StoryFollowUpTrigger::dueForCheck()
            ->whereHas('storyThread', fn ($q) => $q->where('region_id', $region->id))
            ->count();

        $this->newLine();
        $this->info("Triggers:");
        $this->line("  Pending: {$pendingTriggers}");
        $this->line("  Due for check: {$dueTriggers}");

        return 0;
    }

    /**
     * Get region from option
     */
    private function getRegion(): ?Region
    {
        $regionOption = $this->option('region');

        if (!$regionOption) {
            $this->error('Please provide --region=<name or id>');
            return null;
        }

        $region = Region::where('id', $regionOption)
            ->orWhere('name', 'like', "%{$regionOption}%")
            ->first();

        if (!$region) {
            $this->error("Region not found: {$regionOption}");
            return null;
        }

        return $region;
    }

    private function invalidAction(string $action): int
    {
        $this->error("Invalid action: {$action}");
        $this->line("Valid actions: list, show, create, analyze, triggers, queue, process, stats");
        return 1;
    }
}
