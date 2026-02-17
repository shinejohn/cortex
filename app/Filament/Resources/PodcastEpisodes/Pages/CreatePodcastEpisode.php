<?php

declare(strict_types=1);

namespace App\Filament\Resources\PodcastEpisodes\Pages;

use App\Filament\Resources\PodcastEpisodes\PodcastEpisodeResource;
use Filament\Resources\Pages\CreateRecord;

final class CreatePodcastEpisode extends CreateRecord
{
    protected static string $resource = PodcastEpisodeResource::class;
}
