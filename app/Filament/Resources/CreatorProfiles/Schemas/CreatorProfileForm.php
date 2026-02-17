<?php

declare(strict_types=1);

namespace App\Filament\Resources\CreatorProfiles\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

final class CreatorProfileForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required(),
                TextInput::make('display_name')
                    ->required(),
                TextInput::make('slug')
                    ->required(),
                Textarea::make('bio')
                    ->columnSpanFull(),
                TextInput::make('avatar'),
                FileUpload::make('cover_image')
                    ->image(),
                Textarea::make('social_links')
                    ->columnSpanFull(),
                TextInput::make('status')
                    ->required()
                    ->default('pending'),
                TextInput::make('followers_count')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('podcasts_count')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('episodes_count')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('total_listens')
                    ->required()
                    ->numeric()
                    ->default(0),
            ]);
    }
}
