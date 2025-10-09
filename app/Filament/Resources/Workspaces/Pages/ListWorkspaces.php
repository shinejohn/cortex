<?php

declare(strict_types=1);

namespace App\Filament\Resources\Workspaces\Pages;

use App\Filament\Resources\Workspaces\WorkspaceResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

final class ListWorkspaces extends ListRecords
{
    protected static string $resource = WorkspaceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
