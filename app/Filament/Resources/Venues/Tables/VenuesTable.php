<?php

declare(strict_types=1);

namespace App\Filament\Resources\Venues\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

final class VenuesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->limit(50),

                TextColumn::make('venue_type')
                    ->label('Type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'concert_hall' => 'primary',
                        'club' => 'success',
                        'bar' => 'warning',
                        'theater' => 'purple',
                        'arena', 'stadium' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => str($state)->replace('_', ' ')->title()),

                TextColumn::make('capacity')
                    ->numeric()
                    ->sortable()
                    ->suffix(' people'),

                TextColumn::make('average_rating')
                    ->label('Rating')
                    ->sortable()
                    ->formatStateUsing(fn ($state) => $state ? number_format($state, 1).' ★' : 'N/A'),

                TextColumn::make('bookings_count')
                    ->label('Bookings')
                    ->counts('bookings')
                    ->badge()
                    ->color('info'),

                TextColumn::make('events_count')
                    ->label('Events')
                    ->counts('events')
                    ->badge()
                    ->color('success'),

                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'active' => 'success',
                        'inactive' => 'gray',
                        'pending' => 'warning',
                        'suspended' => 'danger',
                        default => 'gray',
                    }),

                IconColumn::make('verified')
                    ->label('Verified')
                    ->boolean()
                    ->sortable(),

                TextColumn::make('price_per_hour')
                    ->label('Price/Hour')
                    ->money('USD')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('neighborhood')
                    ->searchable()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('venue_type')
                    ->label('Type')
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
                    ]),

                SelectFilter::make('status')
                    ->options([
                        'active' => 'Active',
                        'inactive' => 'Inactive',
                        'pending' => 'Pending Approval',
                        'suspended' => 'Suspended',
                    ]),

                TernaryFilter::make('verified')
                    ->label('Verification Status')
                    ->placeholder('All venues')
                    ->trueLabel('Verified only')
                    ->falseLabel('Unverified only'),

                SelectFilter::make('workspace_id')
                    ->label('Workspace')
                    ->relationship('workspace', 'name')
                    ->searchable()
                    ->preload(),
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
