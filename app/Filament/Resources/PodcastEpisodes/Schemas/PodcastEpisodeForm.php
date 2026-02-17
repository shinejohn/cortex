<?php

declare(strict_types=1);

namespace App\Filament\Resources\PodcastEpisodes\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

final class PodcastEpisodeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('podcast_id')
                    ->relationship('podcast', 'title')
                    ->required(),
                TextInput::make('title')
                    ->required(),
                TextInput::make('slug')
                    ->required(),
                Textarea::make('description')
                    ->columnSpanFull(),
                Textarea::make('show_notes')
                    ->columnSpanFull(),
                TextInput::make('audio_file_path'),
                TextInput::make('audio_file_disk')
                    ->required()
                    ->default('public'),
                TextInput::make('duration')
                    ->numeric(),
                TextInput::make('file_size')
                    ->numeric(),
                TextInput::make('episode_number'),
                TextInput::make('status')
                    ->required()
                    ->default('draft'),
                DateTimePicker::make('published_at'),
                TextInput::make('listens_count')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('downloads_count')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('likes_count')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('comments_count')
                    ->required()
                    ->numeric()
                    ->default(0),
            ]);
    }
}
