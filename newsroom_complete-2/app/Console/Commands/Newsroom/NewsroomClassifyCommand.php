<?php

namespace App\Console\Commands\Newsroom;

use App\Jobs\Newsroom\DispatchClassificationJob;
use Illuminate\Console\Command;

class NewsroomClassifyCommand extends Command
{
    protected $signature = 'newsroom:classify {--sync : Run synchronously}';
    protected $description = 'Classify pending raw content';

    public function handle(): int
    {
        $this->info('Dispatching classification jobs...');
        
        if ($this->option('sync')) {
            app(DispatchClassificationJob::class)->handle();
        } else {
            DispatchClassificationJob::dispatch();
        }

        $this->info('Done.');
        return 0;
    }
}
