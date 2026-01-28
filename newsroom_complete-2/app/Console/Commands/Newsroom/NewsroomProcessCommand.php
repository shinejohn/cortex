<?php

namespace App\Console\Commands\Newsroom;

use App\Jobs\Newsroom\DispatchProcessingJob;
use Illuminate\Console\Command;

class NewsroomProcessCommand extends Command
{
    protected $signature = 'newsroom:process {--sync : Run synchronously}';
    protected $description = 'Process classified content into articles';

    public function handle(): int
    {
        $this->info('Dispatching processing jobs...');
        
        if ($this->option('sync')) {
            app(DispatchProcessingJob::class)->handle();
        } else {
            DispatchProcessingJob::dispatch();
        }

        $this->info('Done.');
        return 0;
    }
}
