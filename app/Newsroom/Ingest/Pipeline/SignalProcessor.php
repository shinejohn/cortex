<?php

declare(strict_types=1);

namespace App\Newsroom\Ingest\Pipeline;

use App\Models\Signal as SignalModel;
use App\Newsroom\DTOs\Signal;
use Illuminate\Support\Facades\Log;

class SignalProcessor
{
    /**
     * Process a normalized Signal (ingest, dedupe, and route)
     */
    public function process(Signal $signal): ?SignalModel
    {
        // 1. Deduplication Check
        if (SignalModel::where('content_hash', $signal->contentHash)->exists()) {
            Log::info("Duplicate signal skipped: {$signal->title} ({$signal->contentHash})");
            return null;
        }

        // 2. Persist Signal
        $model = SignalModel::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'type' => $signal->type->value,
            'source_identifier' => $signal->sourceName,
            'external_id' => $signal->originalId,
            'content_hash' => $signal->contentHash,
            'title' => $signal->title,
            'content' => $signal->content,
            'url' => $signal->url,
            'author_name' => $signal->authorName,
            'metadata' => $signal->metadata,
            'published_at' => $signal->publishedAt,
            'status' => 'pending',
        ]);

        Log::info("Signal ingested: {$model->title} [{$model->type}]");

        // 3. Trigger Intelligence Analysis (Async)
        // \App\Jobs\Newsroom\AnalyzeSignalJob::dispatch($model);

        return $model;
    }
}
