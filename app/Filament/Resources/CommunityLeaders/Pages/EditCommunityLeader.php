<?php

namespace App\Filament\Resources\CommunityLeaders\Pages;

use App\Filament\Resources\CommunityLeaders\CommunityLeaderResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ForceDeleteAction;
use Filament\Actions\RestoreAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditCommunityLeader extends EditRecord
{
    protected static string $resource = CommunityLeaderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
            ForceDeleteAction::make(),
            RestoreAction::make(),
        ];
    }
}
