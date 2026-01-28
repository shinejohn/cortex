<?php

namespace App\Filament\Resources\CommunityLeaders\Pages;

use App\Filament\Resources\CommunityLeaders\CommunityLeaderResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListCommunityLeaders extends ListRecords
{
    protected static string $resource = CommunityLeaderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
