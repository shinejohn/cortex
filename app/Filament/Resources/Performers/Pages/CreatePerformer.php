<?php

declare(strict_types=1);

namespace App\Filament\Resources\Performers\Pages;

use App\Filament\Resources\Performers\PerformerResource;
use Filament\Resources\Pages\CreateRecord;

final class CreatePerformer extends CreateRecord
{
    protected static string $resource = PerformerResource::class;
}
