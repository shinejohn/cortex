<?php

namespace App\Console\Commands\Newsroom;

use App\Jobs\Newsroom\DispatchCollectionJob;
use Illuminate\Console\Command;

class NewsroomCollectCommand extends Command
{
    protected $signature = 'newsroom:collect {--sync : Run synchronously}';
    protected $description = 'Collect content from all active sources';

    public function handle(): int
    {
        $this->info('Dispatching collection jobs...');
        
        if ($this->option('sync')) {
            app(DispatchCollectionJob::class)->handle();
        } else {
            DispatchCollectionJob::dispatch();
        }

        $this->info('Done.');
        return 0;
    }
}
