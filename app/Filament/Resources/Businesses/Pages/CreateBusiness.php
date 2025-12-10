<?php

declare(strict_types=1);

namespace App\Filament\Resources\Businesses\Pages;

use App\Filament\Resources\Businesses\BusinessResource;
use Filament\Resources\Pages\CreateRecord;

final class CreateBusiness extends CreateRecord
{
    protected static string $resource = BusinessResource::class;
}
