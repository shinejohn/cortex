<?php

declare(strict_types=1);

namespace App\Filament\Resources\Communities\Pages;

use App\Filament\Resources\Communities\CommunityResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

final class EditCommunity extends EditRecord
{
    protected static string $resource = CommunityResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
