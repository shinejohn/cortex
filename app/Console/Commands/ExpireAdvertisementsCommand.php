<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\AdvertisementService;
use Illuminate\Console\Command;

final class ExpireAdvertisementsCommand extends Command
{
    protected $signature = 'ads:expire';

    protected $description = 'Expire expired advertisements';

    public function handle(AdvertisementService $adService): int
    {
        $adService->expireExpiredAds();

        $this->info('Expired advertisements processed.');

        return self::SUCCESS;
    }
}
