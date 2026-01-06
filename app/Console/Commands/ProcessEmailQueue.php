<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\EmailCampaign;
use App\Models\EmailSend;
use App\Jobs\SendEmail;
use Illuminate\Console\Command;

final class ProcessEmailQueue extends Command
{
    protected $signature = 'email:process-queue {--limit=100}';
    protected $description = 'Process queued email sends';

    public function handle(): int
    {
        $limit = (int) $this->option('limit');

        // Process scheduled campaigns that are ready to send
        $scheduledCampaigns = EmailCampaign::where('status', 'scheduled')
            ->where('scheduled_at', '<=', now())
            ->limit(10)
            ->get();

        foreach ($scheduledCampaigns as $campaign) {
            $campaign->update(['status' => 'sending', 'started_at' => now()]);
        }

        // Process queued sends
        $sends = EmailSend::where('status', 'queued')
            ->limit($limit)
            ->get();

        $bar = $this->output->createProgressBar($sends->count());
        $bar->start();

        foreach ($sends as $send) {
            SendEmail::dispatch($send);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Queued {$sends->count()} emails for sending");

        // Mark campaigns as sent if all sends are processed
        foreach ($scheduledCampaigns as $campaign) {
            $remaining = EmailSend::where('campaign_id', $campaign->id)
                ->where('status', 'queued')
                ->count();

            if ($remaining === 0) {
                $campaign->update([
                    'status' => 'sent',
                    'completed_at' => now(),
                ]);
            }
        }

        return Command::SUCCESS;
    }
}
