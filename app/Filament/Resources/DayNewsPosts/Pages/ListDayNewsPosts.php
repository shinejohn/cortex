<?php

declare(strict_types=1);

namespace App\Filament\Resources\DayNewsPosts\Pages;

use App\Filament\Resources\DayNewsPosts\DayNewsPostResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

final class ListDayNewsPosts extends ListRecords
{
    protected static string $resource = DayNewsPostResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
