<?php

declare(strict_types=1);

namespace App\Filament\Resources\Venues\Schemas;

use App\Filament\Forms\Components\GooglePlacesAutocomplete;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

final class VenueForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Basic Information')
                    ->schema([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),

                        RichEditor::make('description')
                            ->columnSpanFull(),

                        FileUpload::make('images')
                            ->multiple()
                            ->image()
                            ->directory('venues')
                            ->imageEditor()
                            ->reorderable()
                            ->maxFiles(10)
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Section::make('Venue Type & Capacity')
                    ->schema([
                        Select::make('venue_type')
                            ->label('Venue Type')
                            ->options([
                                'concert_hall' => 'Concert Hall',
                                'club' => 'Club',
                                'bar' => 'Bar',
                                'restaurant' => 'Restaurant',
                                'theater' => 'Theater',
                                'outdoor' => 'Outdoor',
                                'arena' => 'Arena',
                                'stadium' => 'Stadium',
                                'gallery' => 'Gallery',
                                'other' => 'Other',
                            ])
                            ->searchable()
                            ->required(),

                        TextInput::make('capacity')
                            ->numeric()
                            ->minValue(1)
                            ->suffix('people'),

                        Toggle::make('verified')
                            ->label('Verified Venue')
                            ->default(false),
                    ])
                    ->columns(3),

                Section::make('Pricing')
                    ->schema([
                        TextInput::make('price_per_hour')
                            ->label('Price Per Hour')
                            ->numeric()
                            ->prefix('$')
                            ->minValue(0)
                            ->step(0.01),

                        TextInput::make('price_per_event')
                            ->label('Price Per Event')
                            ->numeric()
                            ->prefix('$')
                            ->minValue(0)
                            ->step(0.01),

                        TextInput::make('price_per_day')
                            ->label('Price Per Day')
                            ->numeric()
                            ->prefix('$')
                            ->minValue(0)
                            ->step(0.01),
                    ])
                    ->columns(3),

                Section::make('Location')
                    ->schema([
                        GooglePlacesAutocomplete::make('address')
                            ->label('Address')
                            ->placeholder('Start typing an address...')
                            ->latitudeField('latitude')
                            ->longitudeField('longitude')
                            ->neighborhoodField('neighborhood')
                            ->columnSpanFull(),

                        TextInput::make('neighborhood')
                            ->label('Neighborhood')
                            ->maxLength(255)
                            ->helperText('Auto-filled from address or enter manually'),

                        TextInput::make('latitude')
                            ->label('Latitude')
                            ->numeric()
                            ->step(0.00000001)
                            ->minValue(-90)
                            ->maxValue(90)
                            ->disabled()
                            ->dehydrated()
                            ->helperText('Auto-filled from address'),

                        TextInput::make('longitude')
                            ->label('Longitude')
                            ->numeric()
                            ->step(0.00000001)
                            ->minValue(-180)
                            ->maxValue(180)
                            ->disabled()
                            ->dehydrated()
                            ->helperText('Auto-filled from address'),
                    ])
                    ->columns(3),

                Section::make('Amenities & Event Types')
                    ->schema([
                        TagsInput::make('amenities')
                            ->placeholder('Add amenities (e.g., Parking, WiFi, Bar)')
                            ->columnSpanFull(),

                        TagsInput::make('event_types')
                            ->label('Suitable Event Types')
                            ->placeholder('Add event types (e.g., Concerts, Private Events)')
                            ->columnSpanFull(),
                    ]),

                Section::make('Workspace & Status')
                    ->schema([
                        Select::make('workspace_id')
                            ->label('Workspace')
                            ->relationship('workspace', 'name')
                            ->searchable()
                            ->preload(),

                        Select::make('created_by')
                            ->label('Created By')
                            ->relationship('createdBy', 'name')
                            ->searchable()
                            ->preload()
                            ->default(fn () => auth()->id()),

                        Select::make('status')
                            ->options([
                                'active' => 'Active',
                                'inactive' => 'Inactive',
                                'pending' => 'Pending Approval',
                                'suspended' => 'Suspended',
                            ])
                            ->default('active')
                            ->required(),
                    ])
                    ->columns(3),

                Section::make('Additional Information')
                    ->schema([
                        TextInput::make('average_rating')
                            ->label('Average Rating')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(5)
                            ->step(0.1)
                            ->disabled(),

                        TextInput::make('total_reviews')
                            ->label('Total Reviews')
                            ->numeric()
                            ->minValue(0)
                            ->disabled(),

                        TextInput::make('response_time_hours')
                            ->label('Response Time (Hours)')
                            ->numeric()
                            ->minValue(0)
                            ->suffix('hours'),
                    ])
                    ->columns(3)
                    ->collapsed(),
            ]);
    }
}
