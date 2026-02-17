<?php

declare(strict_types=1);

namespace App\Filament\Resources\PodcastEpisodes\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

final class PodcastEpisodeInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('id')
                    ->label('ID'),
                TextEntry::make('podcast.title')
                    ->label('Podcast'),
                TextEntry::make('title'),
                TextEntry::make('slug'),
                TextEntry::make('description')
                    ->placeholder('-')
                    ->columnSpanFull(),
                TextEntry::make('show_notes')
                    ->placeholder('-')
                    ->columnSpanFull(),
                TextEntry::make('audio_file_path')
                    ->placeholder('-'),
                TextEntry::make('audio_file_disk'),
                TextEntry::make('duration')
                    ->numeric()
                    ->placeholder('-'),
                TextEntry::make('file_size')
                    ->numeric()
                    ->placeholder('-'),
                TextEntry::make('episode_number')
                    ->placeholder('-'),
                TextEntry::make('status'),
                TextEntry::make('published_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('listens_count')
                    ->numeric(),
                TextEntry::make('downloads_count')
                    ->numeric(),
                TextEntry::make('likes_count')
                    ->numeric(),
                TextEntry::make('comments_count')
                    ->numeric(),
                TextEntry::make('created_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('updated_at')
                    ->dateTime()
                    ->placeholder('-'),
            ]);
    }
}
