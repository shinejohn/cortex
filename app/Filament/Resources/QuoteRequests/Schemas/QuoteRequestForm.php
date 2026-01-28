<?php

namespace App\Filament\Resources\QuoteRequests\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class QuoteRequestForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('leader_id')
                    ->relationship('leader', 'name')
                    ->required(),
                TextInput::make('news_article_draft_id'),
                TextInput::make('requested_by'),
                TextInput::make('status')
                    ->required()
                    ->default('pending'),
                TextInput::make('contact_method')
                    ->required(),
                Textarea::make('context')
                    ->required()
                    ->columnSpanFull(),
                Textarea::make('questions')
                    ->required()
                    ->columnSpanFull(),
                DateTimePicker::make('sent_at'),
                DateTimePicker::make('responded_at'),
                DateTimePicker::make('expires_at'),
                Textarea::make('response')
                    ->columnSpanFull(),
                Toggle::make('approved_for_publication')
                    ->required(),
            ]);
    }
}
