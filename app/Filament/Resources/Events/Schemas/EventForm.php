<?php

declare(strict_types=1);

namespace App\Filament\Resources\Events\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

final class EventForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Basic Information')
                    ->schema([
                        TextInput::make('title')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),

                        FileUpload::make('image')
                            ->image()
                            ->directory('events')
                            ->imageEditor()
                            ->columnSpanFull(),

                        RichEditor::make('description')
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Section::make('Date & Time')
                    ->schema([
                        DateTimePicker::make('event_date')
                            ->label('Event Date & Time')
                            ->required()
                            ->native(false)
                            ->displayFormat('M d, Y H:i')
                            ->seconds(false),

                        TextInput::make('time')
                            ->label('Display Time')
                            ->placeholder('7:00 PM - 10:00 PM'),
                    ])
                    ->columns(2),

                Section::make('Location')
                    ->schema([
                        Select::make('venue_id')
                            ->label('Venue')
                            ->relationship('venue', 'name')
                            ->searchable()
                            ->preload()
                            ->createOptionForm([
                                TextInput::make('name')->required(),
                                TextInput::make('address')->required(),
                            ]),

                        TextInput::make('latitude')
                            ->numeric()
                            ->step(0.00000001),

                        TextInput::make('longitude')
                            ->numeric()
                            ->step(0.00000001),
                    ])
                    ->columns(3),

                Section::make('Performer')
                    ->schema([
                        Select::make('performer_id')
                            ->label('Performer')
                            ->relationship('performer', 'name')
                            ->searchable()
                            ->preload(),
                    ]),

                Section::make('Pricing')
                    ->schema([
                        Toggle::make('is_free')
                            ->label('Free Event')
                            ->reactive()
                            ->default(false),

                        TextInput::make('price_min')
                            ->label('Minimum Price')
                            ->numeric()
                            ->prefix('$')
                            ->minValue(0)
                            ->hidden(fn ($get) => $get('is_free')),

                        TextInput::make('price_max')
                            ->label('Maximum Price')
                            ->numeric()
                            ->prefix('$')
                            ->minValue(0)
                            ->hidden(fn ($get) => $get('is_free')),
                    ])
                    ->columns(3),

                Section::make('Categorization')
                    ->schema([
                        Select::make('category')
                            ->options([
                                'music' => 'Music',
                                'comedy' => 'Comedy',
                                'sports' => 'Sports',
                                'arts' => 'Arts & Theater',
                                'food' => 'Food & Drink',
                                'nightlife' => 'Nightlife',
                                'family' => 'Family',
                                'community' => 'Community',
                            ])
                            ->searchable(),

                        TagsInput::make('subcategories')
                            ->placeholder('Add subcategories'),

                        TagsInput::make('badges')
                            ->placeholder('Add badges (e.g., Popular, Trending)'),
                    ])
                    ->columns(1),

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
                                'draft' => 'Draft',
                                'published' => 'Published',
                                'cancelled' => 'Cancelled',
                                'completed' => 'Completed',
                            ])
                            ->default('draft')
                            ->required(),
                    ])
                    ->columns(3),

                Section::make('Additional Information')
                    ->schema([
                        TextInput::make('community_rating')
                            ->label('Community Rating')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(5)
                            ->step(0.1),

                        TextInput::make('member_attendance')
                            ->label('Member Attendance')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('member_recommendations')
                            ->label('Member Recommendations')
                            ->numeric()
                            ->minValue(0),

                        RichEditor::make('curator_notes')
                            ->label('Curator Notes')
                            ->columnSpanFull(),
                    ])
                    ->columns(3)
                    ->collapsed(),
            ]);
    }
}
