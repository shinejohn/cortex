<?php

namespace App\Filament\Resources\SalesOpportunities\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class SalesOpportunityForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('business_id')
                    ->relationship('business', 'name'),
                TextInput::make('business_name')
                    ->required(),
                TextInput::make('community_id')
                    ->numeric(),
                TextInput::make('opportunity_type')
                    ->required(),
                TextInput::make('quality')
                    ->required()
                    ->default('warm'),
                TextInput::make('trigger_content_id'),
                Textarea::make('trigger_description')
                    ->columnSpanFull(),
                Textarea::make('recommended_action')
                    ->columnSpanFull(),
                Textarea::make('suggested_script')
                    ->columnSpanFull(),
                TextInput::make('status')
                    ->required()
                    ->default('new'),
                TextInput::make('assigned_to')
                    ->numeric(),
                DateTimePicker::make('contacted_at'),
                DateTimePicker::make('converted_at'),
                TextInput::make('outcome'),
                TextInput::make('deal_value')
                    ->numeric(),
                Textarea::make('notes')
                    ->columnSpanFull(),
            ]);
    }
}
