<?php

declare(strict_types=1);

namespace App\Jobs\Newsroom;

use App\Models\Poll;
use App\Services\Newsroom\PollSolicitationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class PollSolicitationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 120;

    public int $tries = 1;

    public function __construct(
        public Poll $poll
    ) {}

    public function handle(PollSolicitationService $service): void
    {
        if (! config('news-workflow.top_list.enabled', true)) {
            return;
        }

        $stats = $service->solicitForPoll($this->poll);
        Log::info('PollSolicitation: Complete', ['poll_id' => $this->poll->id, 'sent' => $stats['sent']]);
    }
}
