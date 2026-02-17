<?php

declare(strict_types=1);

namespace App\Filament\Resources\CreatorProfiles\Pages;

use App\Filament\Resources\CreatorProfiles\CreatorProfileResource;
use Filament\Resources\Pages\CreateRecord;

final class CreateCreatorProfile extends CreateRecord
{
    protected static string $resource = CreatorProfileResource::class;
}
