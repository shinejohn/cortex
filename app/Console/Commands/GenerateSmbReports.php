<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Community;
use App\Services\EmailGeneratorService;
use Illuminate\Console\Command;

final class GenerateSmbReports extends Command
{
    protected $signature = 'email:generate-smb-reports';
    protected $description = 'Generate SMB weekly performance reports for all communities';

    public function handle(EmailGeneratorService $service): int
    {
        $communities = Community::where('status', 'active')->get();
        $bar = $this->output->createProgressBar($communities->count());
        $bar->start();

        foreach ($communities as $community) {
            try {
                $service->generateSmbReport($community);
                $this->info(" Generated SMB report for {$community->name}");
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
