<?php

declare(strict_types=1);

namespace App\Filament\Resources\Advertisements\Pages;

use App\Filament\Resources\Advertisements\AdvertisementResource;
use Filament\Resources\Pages\CreateRecord;

final class CreateAdvertisement extends CreateRecord
{
    protected static string $resource = AdvertisementResource::class;
}
