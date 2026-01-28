<?php

namespace App\Console\Commands\Newsroom;

use Illuminate\Console\Command;

class NewsroomRunCommand extends Command
{
    protected $signature = 'newsroom:run {--sync : Run synchronously}';
    protected $description = 'Run full newsroom pipeline: collect, classify, process';

    public function handle(): int
    {
        $this->info('=== AI NEWSROOM PIPELINE ===');
        
        $this->info('Step 1: Collecting...');
        $this->call('newsroom:collect', ['--sync' => $this->option('sync')]);
        
        $this->info('Step 2: Classifying...');
        $this->call('newsroom:classify', ['--sync' => $this->option('sync')]);
        
        $this->info('Step 3: Processing...');
        $this->call('newsroom:process', ['--sync' => $this->option('sync')]);
        
        $this->info('=== PIPELINE COMPLETE ===');
        return 0;
    }
}
