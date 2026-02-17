<?php

declare(strict_types=1);

namespace App\Filament\Resources\Podcasts\Pages;

use App\Filament\Resources\Podcasts\PodcastResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

final class ViewPodcast extends ViewRecord
{
    protected static string $resource = PodcastResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
