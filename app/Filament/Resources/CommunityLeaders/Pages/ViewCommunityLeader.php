<?php

namespace App\Filament\Resources\CommunityLeaders\Pages;

use App\Filament\Resources\CommunityLeaders\CommunityLeaderResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewCommunityLeader extends ViewRecord
{
    protected static string $resource = CommunityLeaderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
