<?php

declare(strict_types=1);

namespace App\Filament\Resources\CreatorProfiles\Pages;

use App\Filament\Resources\CreatorProfiles\CreatorProfileResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

final class EditCreatorProfile extends EditRecord
{
    protected static string $resource = CreatorProfileResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
