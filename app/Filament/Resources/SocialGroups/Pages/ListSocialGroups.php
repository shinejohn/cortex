<?php

declare(strict_types=1);

namespace App\Filament\Resources\SocialGroups\Pages;

use App\Filament\Resources\SocialGroups\SocialGroupResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

final class ListSocialGroups extends ListRecords
{
    protected static string $resource = SocialGroupResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
