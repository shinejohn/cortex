<?php

declare(strict_types=1);

namespace App\Filament\Resources\Performers\Pages;

use App\Filament\Resources\Performers\PerformerResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

final class EditPerformer extends EditRecord
{
    protected static string $resource = PerformerResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
