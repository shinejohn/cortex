<?php

namespace App\Filament\Resources\CommunityLeaders\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class CommunityLeaderForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('region_id')
                    ->relationship('region', 'name')
                    ->required(),
                TextInput::make('name')
                    ->required(),
                TextInput::make('title'),
                TextInput::make('organization'),
                TextInput::make('email')
                    ->label('Email address')
                    ->email(),
                TextInput::make('phone')
                    ->tel(),
                TextInput::make('preferred_contact_method')
                    ->required()
                    ->default('email'),
                TextInput::make('category')
                    ->required(),
                \Filament\Forms\Components\TagsInput::make('expertise_topics')
                    ->columnSpanFull(),
                \Filament\Forms\Components\TagsInput::make('organization_affiliations')
                    ->columnSpanFull(),
                Toggle::make('is_influencer')
                    ->required(),
                TextInput::make('influence_score')
                    ->required()
                    ->numeric()
                    ->default(0),
                \Filament\Forms\Components\KeyValue::make('social_media_handles')
                    ->columnSpanFull(),
                TextInput::make('follower_count')
                    ->numeric(),
                TextInput::make('times_contacted')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('times_responded')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('times_quoted')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('avg_response_time_hours')
                    ->numeric(),
                DateTimePicker::make('last_contacted_at'),
                DateTimePicker::make('last_responded_at'),
                Textarea::make('notes')
                    ->columnSpanFull(),
                Toggle::make('is_verified')
                    ->required(),
                Toggle::make('is_active')
                    ->required(),
                Toggle::make('do_not_contact')
                    ->required(),
            ]);
    }
}
