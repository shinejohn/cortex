<?php

declare(strict_types=1);

namespace App\Filament\Resources\Advertisements\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

final class AdvertisementForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Advertisement Details')
                    ->schema([
                        Select::make('platform')
                            ->options([
                                'day_news' => 'Day News',
                                'event_city' => 'Go Event City',
                                'downtown_guide' => 'Downtown Guide',
                                'alphasite' => 'AlphaSite',
                                'local_voices' => 'Go Local Voices',
                            ])
                            ->required()
                            ->default('day_news'),

                        Select::make('placement')
                            ->options([
                                'sidebar' => 'Sidebar',
                                'banner' => 'Banner',
                                'inline' => 'Inline',
                                'featured' => 'Featured',
                            ])
                            ->required()
                            ->default('sidebar'),

                        Select::make('advertable_type')
                            ->label('Content Type')
                            ->options([
                                'App\\Models\\DayNewsPost' => 'Day News Post',
                            ])
                            ->required()
                            ->reactive(),

                        Select::make('advertable_id')
                            ->label('Content')
                            ->options(function ($get) {
                                $type = $get('advertable_type');
                                if ($type === 'App\\Models\\DayNewsPost') {
                                    return \App\Models\DayNewsPost::pluck('title', 'id');
                                }

                                return [];
                            })
                            ->required()
                            ->searchable(),

                        Toggle::make('is_active')
                            ->label('Active')
                            ->default(true),
                    ])
                    ->columns(2),

                Section::make('Schedule')
                    ->schema([
                        DateTimePicker::make('starts_at')
                            ->label('Start Date & Time')
                            ->native(false)
                            ->displayFormat('M d, Y H:i')
                            ->seconds(false)
                            ->default(now())
                            ->required(),

                        DateTimePicker::make('expires_at')
                            ->label('Expiration Date & Time')
                            ->native(false)
                            ->displayFormat('M d, Y H:i')
                            ->seconds(false)
                            ->required()
                            ->after('starts_at'),
                    ])
                    ->columns(2),

                Section::make('Analytics')
                    ->schema([
                        TextInput::make('impressions_count')
                            ->label('Impressions')
                            ->numeric()
                            ->default(0)
                            ->disabled()
                            ->dehydrated(false),

                        TextInput::make('clicks_count')
                            ->label('Clicks')
                            ->numeric()
                            ->default(0)
                            ->disabled()
                            ->dehydrated(false),
                    ])
                    ->columns(2)
                    ->collapsed(),
            ]);
    }
}
