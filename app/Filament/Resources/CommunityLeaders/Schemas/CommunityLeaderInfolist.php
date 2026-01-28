<?php

namespace App\Filament\Resources\CommunityLeaders\Schemas;

use App\Models\CommunityLeader;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class CommunityLeaderInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('id')
                    ->label('ID'),
                TextEntry::make('region.name')
                    ->label('Region'),
                TextEntry::make('name'),
                TextEntry::make('title')
                    ->placeholder('-'),
                TextEntry::make('organization')
                    ->placeholder('-'),
                TextEntry::make('email')
                    ->label('Email address')
                    ->placeholder('-'),
                TextEntry::make('phone')
                    ->placeholder('-'),
                TextEntry::make('preferred_contact_method'),
                TextEntry::make('category'),
                TextEntry::make('expertise_topics')
                    ->placeholder('-')
                    ->columnSpanFull(),
                TextEntry::make('organization_affiliations')
                    ->placeholder('-')
                    ->columnSpanFull(),
                IconEntry::make('is_influencer')
                    ->boolean(),
                TextEntry::make('influence_score')
                    ->numeric(),
                TextEntry::make('social_media_handles')
                    ->placeholder('-')
                    ->columnSpanFull(),
                TextEntry::make('follower_count')
                    ->numeric()
                    ->placeholder('-'),
                TextEntry::make('times_contacted')
                    ->numeric(),
                TextEntry::make('times_responded')
                    ->numeric(),
                TextEntry::make('times_quoted')
                    ->numeric(),
                TextEntry::make('avg_response_time_hours')
                    ->numeric()
                    ->placeholder('-'),
                TextEntry::make('last_contacted_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('last_responded_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('notes')
                    ->placeholder('-')
                    ->columnSpanFull(),
                IconEntry::make('is_verified')
                    ->boolean(),
                IconEntry::make('is_active')
                    ->boolean(),
                IconEntry::make('do_not_contact')
                    ->boolean(),
                TextEntry::make('created_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('updated_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('deleted_at')
                    ->dateTime()
                    ->visible(fn (CommunityLeader $record): bool => $record->trashed()),
            ]);
    }
}
