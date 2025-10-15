<?php

declare(strict_types=1);

namespace App\Filament\Resources\Performers\Pages;

use App\Filament\Resources\Performers\PerformerResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

final class ListPerformers extends ListRecords
{
    protected static string $resource = PerformerResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
