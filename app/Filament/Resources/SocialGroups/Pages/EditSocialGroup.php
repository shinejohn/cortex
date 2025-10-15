<?php

declare(strict_types=1);

namespace App\Filament\Resources\SocialGroups\Pages;

use App\Filament\Resources\SocialGroups\SocialGroupResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

final class EditSocialGroup extends EditRecord
{
    protected static string $resource = SocialGroupResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
