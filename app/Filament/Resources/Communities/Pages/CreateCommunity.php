<?php

declare(strict_types=1);

namespace App\Filament\Resources\Communities\Pages;

use App\Filament\Resources\Communities\CommunityResource;
use Filament\Resources\Pages\CreateRecord;

final class CreateCommunity extends CreateRecord
{
    protected static string $resource = CommunityResource::class;
}
