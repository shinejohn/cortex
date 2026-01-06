<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Community;
use App\Services\EmailGeneratorService;
use Illuminate\Console\Command;

final class GenerateWeeklyNewsletters extends Command
{
    protected $signature = 'email:generate-newsletters';
    protected $description = 'Generate weekly newsletter emails for all communities';

    public function handle(EmailGeneratorService $service): int
    {
        $communities = Community::where('status', 'active')->get();
        $bar = $this->output->createProgressBar($communities->count());
        $bar->start();

        foreach ($communities as $community) {
            try {
                $service->generateWeeklyNewsletter($community);
                $this->info(" Generated newsletter for {$community->name}");
            } catch (\Exception $e) {
                $this->error(" Failed for {$community->name}: {$e->getMessage()}");
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();

        return Command::SUCCESS;
    }
}
