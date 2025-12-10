<?php

declare(strict_types=1);

namespace App\Filament\Resources\NewsFetchFrequencies\Pages;

use App\Filament\Resources\NewsFetchFrequencies\NewsFetchFrequencyResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

final class EditNewsFetchFrequency extends EditRecord
{
    protected static string $resource = NewsFetchFrequencyResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
