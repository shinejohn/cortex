<?php

declare(strict_types=1);

namespace App\Filament\Resources\Venues\Pages;

use App\Filament\Resources\Venues\VenueResource;
use Filament\Resources\Pages\CreateRecord;

final class CreateVenue extends CreateRecord
{
    protected static string $resource = VenueResource::class;
}
