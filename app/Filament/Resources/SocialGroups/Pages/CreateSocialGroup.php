<?php

declare(strict_types=1);

namespace App\Filament\Resources\SocialGroups\Pages;

use App\Filament\Resources\SocialGroups\SocialGroupResource;
use Filament\Resources\Pages\CreateRecord;

final class CreateSocialGroup extends CreateRecord
{
    protected static string $resource = SocialGroupResource::class;
}
