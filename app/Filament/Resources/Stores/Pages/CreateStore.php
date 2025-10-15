<?php

declare(strict_types=1);

namespace App\Filament\Resources\Stores\Pages;

use App\Filament\Resources\Stores\StoreResource;
use Filament\Resources\Pages\CreateRecord;

final class CreateStore extends CreateRecord
{
    protected static string $resource = StoreResource::class;
}
