<?php

declare(strict_types=1);

namespace App\Jobs\Newsroom;

use App\Models\RawContent;
use App\Services\Newsroom\ContentClassificationService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class ProcessRawContentClassificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 600;

    public int $tries = 1;

    public function handle(ContentClassificationService $classifier): void
    {
        $pending = RawContent::where('classification_status', 'pending')
            ->orderBy('collected_at', 'asc')
            ->limit(50)
            ->get();

        Log::info('Job: Classification starting', ['count' => $pending->count()]);

        $classified = 0;
        $failed = 0;

        foreach ($pending as $raw) {
            try {
                $classifier->classify($raw);
                $classified++;
            } catch (Exception $e) {
                $failed++;
                Log::error('Job: Classification failed for item', [
                    'id' => $raw->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Job: Classification complete', ['classified' => $classified, 'failed' => $failed]);
    }
}
