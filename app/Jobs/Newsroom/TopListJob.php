<?php

declare(strict_types=1);

namespace App\Jobs\Newsroom;

use App\Models\Region;
use App\Services\Newsroom\TopListService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class TopListJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 600;

    public int $tries = 1;

    public function __construct(
        public ?string $regionId = null
    ) {}

    public function handle(TopListService $service): void
    {
        if ($this->regionId) {
            $region = Region::find($this->regionId);
            if ($region) {
                $article = $service->runForRegion($region);
                if ($article) {
                    Log::info('TopList: Published', ['article_id' => $article->id, 'region' => $region->name]);
                }
            }

            return;
        }

        foreach (Region::where('is_active', true)->get() as $region) {
            try {
                $service->runForRegion($region);
            } catch (Exception $e) {
                Log::error('TopList: Region failed', ['region_id' => $region->id, 'error' => $e->getMessage()]);
            }
        }
    }
}
