<?php

declare(strict_types=1);

namespace App\Filament\Resources\DayNewsPosts\Pages;

use App\Filament\Resources\DayNewsPosts\DayNewsPostResource;
use Filament\Resources\Pages\CreateRecord;

final class CreateDayNewsPost extends CreateRecord
{
    protected static string $resource = DayNewsPostResource::class;
}
