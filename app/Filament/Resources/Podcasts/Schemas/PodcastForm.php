<?php

declare(strict_types=1);

namespace App\Filament\Resources\Podcasts\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

final class PodcastForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('creator_profile_id')
                    ->required(),
                TextInput::make('title')
                    ->required(),
                TextInput::make('slug')
                    ->required(),
                Textarea::make('description')
                    ->columnSpanFull(),
                FileUpload::make('cover_image')
                    ->image(),
                TextInput::make('category'),
                TextInput::make('status')
                    ->required()
                    ->default('draft'),
                DateTimePicker::make('published_at'),
                TextInput::make('episodes_count')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('subscribers_count')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('total_listens')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('total_duration')
                    ->required()
                    ->numeric()
                    ->default(0),
            ]);
    }
}
