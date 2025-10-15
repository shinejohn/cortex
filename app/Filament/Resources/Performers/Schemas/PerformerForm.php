<?php

declare(strict_types=1);

namespace App\Filament\Resources\Performers\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

final class PerformerForm
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

                        FileUpload::make('profile_image')
                            ->label('Profile Image')
                            ->image()
                            ->directory('performers')
                            ->imageEditor()
                            ->columnSpanFull(),

                        TagsInput::make('genres')
                            ->placeholder('Add genres (e.g., Rock, Jazz, Pop)')
                            ->required()
                            ->columnSpanFull(),

                        RichEditor::make('bio')
                            ->label('Biography')
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Section::make('Pricing')
                    ->schema([
                        TextInput::make('base_price')
                            ->label('Base Price')
                            ->numeric()
                            ->prefix('$')
                            ->minValue(0)
                            ->step(0.01)
                            ->required(),

                        TextInput::make('currency')
                            ->default('USD')
                            ->maxLength(3),

                        TextInput::make('minimum_booking_hours')
                            ->label('Minimum Booking Hours')
                            ->numeric()
                            ->minValue(1)
                            ->suffix('hours'),

                        TextInput::make('travel_fee_per_mile')
                            ->label('Travel Fee Per Mile')
                            ->numeric()
                            ->prefix('$')
                            ->minValue(0)
                            ->step(0.01),

                        TextInput::make('setup_fee')
                            ->label('Setup Fee')
                            ->numeric()
                            ->prefix('$')
                            ->minValue(0)
                            ->step(0.01),

                        Toggle::make('introductory_pricing')
                            ->label('Introductory Pricing')
                            ->default(false),
                    ])
                    ->columns(3),

                Section::make('Features & Attributes')
                    ->schema([
                        Toggle::make('is_verified')
                            ->label('Verified Performer')
                            ->default(false),

                        Toggle::make('is_touring_now')
                            ->label('Currently Touring')
                            ->default(false),

                        Toggle::make('available_for_booking')
                            ->label('Available for Booking')
                            ->default(true),

                        Toggle::make('has_merchandise')
                            ->label('Has Merchandise')
                            ->default(false),

                        Toggle::make('has_original_music')
                            ->label('Has Original Music')
                            ->default(false),

                        Toggle::make('offers_meet_and_greet')
                            ->label('Offers Meet & Greet')
                            ->default(false),

                        Toggle::make('takes_requests')
                            ->label('Takes Song Requests')
                            ->default(false),

                        Toggle::make('available_for_private_events')
                            ->label('Available for Private Events')
                            ->default(true),

                        Toggle::make('is_family_friendly')
                            ->label('Family Friendly')
                            ->default(true),

                        Toggle::make('has_samples')
                            ->label('Has Audio/Video Samples')
                            ->default(false),
                    ])
                    ->columns(5),

                Section::make('Additional Information')
                    ->schema([
                        TextInput::make('home_city')
                            ->label('Home City')
                            ->maxLength(255),

                        TextInput::make('years_active')
                            ->label('Years Active')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('shows_played')
                            ->label('Shows Played')
                            ->numeric()
                            ->minValue(0),

                        RichEditor::make('cancellation_policy')
                            ->label('Cancellation Policy')
                            ->columnSpanFull(),
                    ])
                    ->columns(3),

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

                Section::make('Statistics')
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

                        TextInput::make('follower_count')
                            ->label('Follower Count')
                            ->numeric()
                            ->minValue(0)
                            ->disabled(),

                        TextInput::make('trending_score')
                            ->label('Trending Score')
                            ->numeric()
                            ->minValue(0)
                            ->disabled(),
                    ])
                    ->columns(4)
                    ->collapsed(),
            ]);
    }
}
