<?php

namespace App\Console\Commands\Newsroom;

use App\Models\NewsSource;
use App\Models\CollectionMethod;
use App\Models\RawContent;
use App\Models\SalesOpportunity;
use Illuminate\Console\Command;

class NewsroomStatsCommand extends Command
{
    protected $signature = 'newsroom:stats';
    protected $description = 'Show newsroom statistics';

    public function handle(): int
    {
        $this->info('=== AI NEWSROOM STATS ===');
        $this->newLine();

        // Sources
        $this->info('SOURCES:');
        $this->line("  Total: " . NewsSource::count());
        $this->line("  Active: " . NewsSource::active()->count());
        $this->line("  By type:");
        foreach (NewsSource::selectRaw('source_type, count(*) as cnt')->groupBy('source_type')->get() as $row) {
            $this->line("    {$row->source_type}: {$row->cnt}");
        }
        $this->newLine();

        // Collection Methods
        $this->info('COLLECTION METHODS:');
        $this->line("  Total: " . CollectionMethod::count());
        $this->line("  Enabled: " . CollectionMethod::enabled()->count());
        $this->line("  By type:");
        foreach (CollectionMethod::selectRaw('method_type, count(*) as cnt')->groupBy('method_type')->get() as $row) {
            $this->line("    {$row->method_type}: {$row->cnt}");
        }
        $this->newLine();

        // Raw Content
        $this->info('RAW CONTENT:');
        $this->line("  Total: " . RawContent::count());
        $this->line("  Today: " . RawContent::whereDate('collected_at', today())->count());
        $this->line("  Pending classification: " . RawContent::pendingClassification()->count());
        $this->line("  Pending processing: " . RawContent::pendingProcessing()->count());
        $this->line("  Has events: " . RawContent::hasEvent()->count());
        $this->newLine();

        // Sales
        $this->info('SALES OPPORTUNITIES:');
        $this->line("  Total: " . SalesOpportunity::count());
        $this->line("  New: " . SalesOpportunity::where('status', 'new')->count());
        $this->line("  Hot: " . SalesOpportunity::where('quality', 'hot')->count());
        
        return 0;
    }
}
