<?php

declare(strict_types=1);

namespace App\Jobs\Rollout;

use App\Models\Business;
use App\Models\Rollout\CommunityRollout;
use App\Services\Newsroom\WebsiteScannerService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

final class ProcessWebsiteScanJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 120;

    public $tries = 2;

    public $backoff = 30;

    public function __construct(
        public Business $business,
        public ?CommunityRollout $communityRollout = null,
    ) {}

    public function handle(WebsiteScannerService $scanner): void
    {
        $result = $scanner->scanBusiness($this->business);

        if ($this->communityRollout && $result['news_source']) {
            $this->communityRollout->increment('news_sources_created');
            $methodCount = count($result['collection_methods']);
            $this->communityRollout->increment('collection_methods_created', $methodCount);
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Website scan job failed', [
            'business_id' => $this->business->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
