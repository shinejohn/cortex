<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Community;
use App\Services\EmailGeneratorService;
use Illuminate\Console\Command;

final class GenerateDailyDigests extends Command
{
    protected $signature = 'email:generate-digests';
    protected $description = 'Generate daily digest emails for all communities';

    public function handle(EmailGeneratorService $service): int
    {
        $communities = Community::where('status', 'active')->get();
        $bar = $this->output->createProgressBar($communities->count());
        $bar->start();

        foreach ($communities as $community) {
            try {
                $service->generateDailyDigest($community);
                $this->info(" Generated digest for {$community->name}");
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
