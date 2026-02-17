<?php

declare(strict_types=1);

namespace App\Jobs\Newsroom;

use App\Models\RawContent;
use App\Services\Newsroom\ContentRoutingService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class ProcessClassifiedContentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300;

    public $tries = 1;

    public function handle(ContentRoutingService $router): void
    {
        $items = RawContent::where('classification_status', RawContent::CLASS_CLASSIFIED)
            ->where('processing_status', RawContent::PROC_PENDING)
            ->orderByRaw("
                CASE priority
                    WHEN 'breaking' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'normal' THEN 3
                    WHEN 'low' THEN 4
                    ELSE 5
                END
            ")
            ->limit(50)
            ->get();

        if ($items->isEmpty()) {
            return;
        }

        Log::info('ProcessClassifiedContent: Processing batch', ['count' => $items->count()]);

        $stats = ['routed' => 0, 'articles' => 0, 'events' => 0, 'failed' => 0];

        foreach ($items as $raw) {
            try {
                $result = $router->routeContent($raw);
                $stats['routed']++;
                if ($result['article']) {
                    $stats['articles']++;
                }
                if ($result['event_created']) {
                    $stats['events']++;
                }
            } catch (Exception $e) {
                $stats['failed']++;
                Log::error('ProcessClassifiedContent: Item failed', [
                    'id' => $raw->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('ProcessClassifiedContent: Batch complete', $stats);
    }
}
