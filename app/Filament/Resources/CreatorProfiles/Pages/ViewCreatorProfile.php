<?php

declare(strict_types=1);

namespace App\Filament\Resources\CreatorProfiles\Pages;

use App\Filament\Resources\CreatorProfiles\CreatorProfileResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

final class ViewCreatorProfile extends ViewRecord
{
    protected static string $resource = CreatorProfileResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
