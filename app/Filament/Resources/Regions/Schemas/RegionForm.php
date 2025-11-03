<?php

declare(strict_types=1);

namespace App\Filament\Resources\Regions\Schemas;

use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

final class RegionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Region Information')
                    ->schema([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn ($state, callable $set) => $set('slug', str($state)->slug()->toString()))
                            ->columnSpanFull(),

                        TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->helperText('Auto-generated from name. Can be customized.')
                            ->columnSpanFull(),

                        Select::make('type')
                            ->label('Region Type')
                            ->options([
                                'state' => 'State',
                                'county' => 'County',
                                'city' => 'City',
                                'neighborhood' => 'Neighborhood',
                                'custom' => 'Custom',
                            ])
                            ->required()
                            ->default('city'),

                        Select::make('parent_id')
                            ->label('Parent Region')
                            ->relationship('parent', 'name')
                            ->searchable()
                            ->preload()
                            ->helperText('Select a parent region for hierarchical organization'),

                        Textarea::make('description')
                            ->rows(3)
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Section::make('Location')
                    ->schema([
                        TextInput::make('latitude')
                            ->numeric()
                            ->step(0.0000001)
                            ->minValue(-90)
                            ->maxValue(90),

                        TextInput::make('longitude')
                            ->numeric()
                            ->step(0.0000001)
                            ->minValue(-180)
                            ->maxValue(180),
                    ])
                    ->columns(2),

                Section::make('Zipcodes')
                    ->schema([
                        Repeater::make('zipcodes')
                            ->relationship()
                            ->schema([
                                TextInput::make('zipcode')
                                    ->label('Zipcode')
                                    ->required()
                                    ->maxLength(10)
                                    ->placeholder('12345'),

                                Toggle::make('is_primary')
                                    ->label('Primary')
                                    ->default(false),
                            ])
                            ->columns(2)
                            ->defaultItems(0)
                            ->addActionLabel('Add Zipcode')
                            ->columnSpanFull(),
                    ])
                    ->collapsed(),

                Section::make('Settings')
                    ->schema([
                        Toggle::make('is_active')
                            ->label('Active')
                            ->default(true)
                            ->required(),

                        TextInput::make('display_order')
                            ->label('Display Order')
                            ->numeric()
                            ->default(0)
                            ->helperText('Lower numbers appear first'),
                    ])
                    ->columns(2),
            ]);
    }
}
