<?php

declare(strict_types=1);

namespace App\Filament\Resources\Workspaces\Pages;

use App\Filament\Resources\Workspaces\WorkspaceResource;
use Filament\Resources\Pages\CreateRecord;

final class CreateWorkspace extends CreateRecord
{
    protected static string $resource = WorkspaceResource::class;
}
