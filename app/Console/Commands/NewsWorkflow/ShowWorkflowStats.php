<?php

declare(strict_types=1);

namespace App\Console\Commands\NewsWorkflow;

use App\Services\News\NewsWorkflowService;
use Illuminate\Console\Command;

final class ShowWorkflowStats extends Command
{
    protected $signature = 'news:stats';

    protected $description = 'Display current news workflow statistics';

    public function handle(NewsWorkflowService $workflowService): int
    {
        $this->info('News Workflow Statistics');
        $this->newLine();

        $stats = $workflowService->getWorkflowStats();

        $this->table(
            ['Metric', 'Count'],
            [
                ['Total Regions', $stats['regions_count']],
                ['Pending Articles', $stats['pending_articles']],
                ['Shortlisted Drafts', $stats['shortlisted_drafts']],
                ['Ready for Generation', $stats['ready_for_generation']],
                ['Ready for Publishing', $stats['ready_for_publishing']],
                ['Published Drafts', $stats['published_drafts']],
                ['Rejected Drafts', $stats['rejected_drafts']],
            ]
        );

        $this->newLine();

        // Calculate pipeline health
        $total = $stats['shortlisted_drafts'] + $stats['ready_for_generation'] + $stats['ready_for_publishing'];

        if ($total > 0) {
            $this->info("Pipeline Health: {$total} drafts in progress");
        } else {
            $this->warn('Pipeline is empty - no drafts in progress');
        }

        if ($stats['pending_articles'] > 0) {
            $this->line("📰 {$stats['pending_articles']} unprocessed articles awaiting curation");
        }

        if ($stats['ready_for_publishing'] > 0) {
            $this->line("📝 {$stats['ready_for_publishing']} articles ready to publish");
        }

        return self::SUCCESS;
    }
}
