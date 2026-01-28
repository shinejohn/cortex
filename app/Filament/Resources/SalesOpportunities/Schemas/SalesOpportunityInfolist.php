<?php

namespace App\Filament\Resources\SalesOpportunities\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class SalesOpportunityInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('id')
                    ->label('ID'),
                TextEntry::make('business.name')
                    ->label('Business')
                    ->placeholder('-'),
                TextEntry::make('business_name'),
                TextEntry::make('community_id')
                    ->numeric()
                    ->placeholder('-'),
                TextEntry::make('opportunity_type'),
                TextEntry::make('quality'),
                TextEntry::make('trigger_content_id')
                    ->placeholder('-'),
                TextEntry::make('trigger_description')
                    ->placeholder('-')
                    ->columnSpanFull(),
                TextEntry::make('recommended_action')
                    ->placeholder('-')
                    ->columnSpanFull(),
                TextEntry::make('suggested_script')
                    ->placeholder('-')
                    ->columnSpanFull(),
                TextEntry::make('status'),
                TextEntry::make('assigned_to')
                    ->numeric()
                    ->placeholder('-'),
                TextEntry::make('contacted_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('converted_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('outcome')
                    ->placeholder('-'),
                TextEntry::make('deal_value')
                    ->numeric()
                    ->placeholder('-'),
                TextEntry::make('notes')
                    ->placeholder('-')
                    ->columnSpanFull(),
                TextEntry::make('created_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('updated_at')
                    ->dateTime()
                    ->placeholder('-'),
            ]);
    }
}
