<?php

declare(strict_types=1);

namespace App\Filament\Resources\Podcasts\Pages;

use App\Filament\Resources\Podcasts\PodcastResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

final class EditPodcast extends EditRecord
{
    protected static string $resource = PodcastResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
