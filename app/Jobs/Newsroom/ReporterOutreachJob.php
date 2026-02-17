<?php

declare(strict_types=1);

namespace App\Jobs\Newsroom;

use App\Models\DayNewsPost;
use App\Services\Newsroom\ReporterOutreachService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class ReporterOutreachJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 120;

    public int $tries = 1;

    public function __construct(
        public DayNewsPost $post
    ) {}

    public function handle(ReporterOutreachService $service): void
    {
        if (! config('news-workflow.business_content.reporter_outreach_enabled', true)) {
            return;
        }

        $stats = $service->sendOutreach($this->post);
        if ($stats['sent'] > 0) {
            Log::info('ReporterOutreach: Sent', [
                'post_id' => $this->post->id,
                'sent' => $stats['sent'],
                'skipped' => $stats['skipped'],
            ]);
        }
    }
}
