<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\DayNewsPostService;
use Illuminate\Console\Command;

final class ExpireDayNewsAdsCommand extends Command
{
    protected $signature = 'ads:expire-posts';

    protected $description = 'Expire Day News post ads';

    public function handle(DayNewsPostService $postService): int
    {
        $postService->expireAds();

        $this->info('Day News ads expired.');

        return self::SUCCESS;
    }
}
