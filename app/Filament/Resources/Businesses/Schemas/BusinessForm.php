<?php

declare(strict_types=1);

namespace App\Filament\Resources\Businesses\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

final class BusinessForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Basic Information')
                    ->schema([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('slug')
                            ->maxLength(255)
                            ->disabled()
                            ->dehydrated()
                            ->helperText('Auto-generated from name'),

                        TextInput::make('primary_type')
                            ->label('Business Type')
                            ->maxLength(255),

                        TagsInput::make('categories')
                            ->placeholder('Add categories'),

                        Textarea::make('description')
                            ->rows(3)
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Section::make('Contact Information')
                    ->schema([
                        TextInput::make('website')
                            ->url()
                            ->maxLength(255),

                        TextInput::make('phone')
                            ->tel()
                            ->maxLength(255),

                        TextInput::make('email')
                            ->email()
                            ->maxLength(255),
                    ])
                    ->columns(3),

                Section::make('Location')
                    ->schema([
                        TextInput::make('address')
                            ->maxLength(255)
                            ->columnSpanFull(),

                        TextInput::make('city')
                            ->maxLength(255),

                        TextInput::make('state')
                            ->maxLength(255),

                        TextInput::make('postal_code')
                            ->maxLength(255),

                        TextInput::make('country')
                            ->maxLength(255)
                            ->default('USA'),

                        TextInput::make('latitude')
                            ->numeric()
                            ->step(0.00000001),

                        TextInput::make('longitude')
                            ->numeric()
                            ->step(0.00000001),
                    ])
                    ->columns(3),

                Section::make('Business Details')
                    ->schema([
                        TextInput::make('rating')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(5)
                            ->step(0.1),

                        TextInput::make('reviews_count')
                            ->label('Reviews Count')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('price_level')
                            ->label('Price Level')
                            ->maxLength(255)
                            ->helperText('e.g., $, $$, $$$'),

                        TextInput::make('hours_display')
                            ->label('Hours Display')
                            ->maxLength(255)
                            ->helperText('e.g., "Open 24 hours" or "9 AM - 5 PM"'),

                        TextInput::make('years_in_business')
                            ->label('Years in Business')
                            ->numeric()
                            ->minValue(0),
                    ])
                    ->columns(3),

                Section::make('Status & Ownership')
                    ->schema([
                        Select::make('status')
                            ->options([
                                'active' => 'Active',
                                'inactive' => 'Inactive',
                            ])
                            ->default('active')
                            ->required(),

                        Toggle::make('is_verified')
                            ->label('Verified Business'),

                        TextInput::make('verification_status')
                            ->label('Verification Status')
                            ->maxLength(255),

                        Select::make('workspace_id')
                            ->label('Claimed By Workspace')
                            ->relationship('workspace', 'name')
                            ->searchable()
                            ->preload()
                            ->helperText('Workspace that has claimed this business'),

                        Select::make('regions')
                            ->label('Regions')
                            ->relationship('regions', 'name', fn ($query) => $query->select('id', 'name', 'type'))
                            ->multiple()
                            ->searchable()
                            ->preload()
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Section::make('SERP API Metadata')
                    ->schema([
                        TextInput::make('google_place_id')
                            ->label('Google Place ID')
                            ->disabled()
                            ->dehydrated(),

                        TextInput::make('data_id')
                            ->label('Data ID')
                            ->disabled()
                            ->dehydrated(),

                        TextInput::make('data_cid')
                            ->label('Data CID')
                            ->disabled()
                            ->dehydrated(),

                        DateTimePicker::make('serp_last_synced_at')
                            ->label('Last Synced')
                            ->disabled()
                            ->dehydrated()
                            ->native(false)
                            ->displayFormat('M d, Y H:i'),

                        TextInput::make('serp_source')
                            ->label('Source')
                            ->disabled()
                            ->dehydrated(),
                    ])
                    ->columns(3)
                    ->collapsed()
                    ->collapsible(),
            ]);
    }
}
