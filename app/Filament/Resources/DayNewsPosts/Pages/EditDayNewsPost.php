<?php

declare(strict_types=1);

namespace App\Filament\Resources\DayNewsPosts\Pages;

use App\Filament\Resources\DayNewsPosts\DayNewsPostResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

final class EditDayNewsPost extends EditRecord
{
    protected static string $resource = DayNewsPostResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
