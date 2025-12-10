<?php

declare(strict_types=1);

namespace App\Filament\Resources\NewsFetchFrequencies\Pages;

use App\Filament\Resources\NewsFetchFrequencies\NewsFetchFrequencyResource;
use Filament\Resources\Pages\CreateRecord;

final class CreateNewsFetchFrequency extends CreateRecord
{
    protected static string $resource = NewsFetchFrequencyResource::class;
}
