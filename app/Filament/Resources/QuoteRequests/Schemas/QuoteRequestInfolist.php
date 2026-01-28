<?php

namespace App\Filament\Resources\QuoteRequests\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class QuoteRequestInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('id')
                    ->label('ID'),
                TextEntry::make('leader.name')
                    ->label('Leader'),
                TextEntry::make('news_article_draft_id')
                    ->placeholder('-'),
                TextEntry::make('requested_by')
                    ->placeholder('-'),
                TextEntry::make('status'),
                TextEntry::make('contact_method'),
                TextEntry::make('context')
                    ->columnSpanFull(),
                TextEntry::make('questions')
                    ->columnSpanFull(),
                TextEntry::make('sent_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('responded_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('expires_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('response')
                    ->placeholder('-')
                    ->columnSpanFull(),
                IconEntry::make('approved_for_publication')
                    ->boolean(),
                TextEntry::make('created_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('updated_at')
                    ->dateTime()
                    ->placeholder('-'),
            ]);
    }
}
