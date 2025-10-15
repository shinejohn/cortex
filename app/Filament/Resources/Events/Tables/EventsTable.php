<?php

declare(strict_types=1);

namespace App\Filament\Resources\Events\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

final class EventsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('image')
                    ->label('Image')
                    ->square(),

                TextColumn::make('title')
                    ->searchable()
                    ->sortable()
                    ->limit(50),

                TextColumn::make('event_date')
                    ->label('Date')
                    ->dateTime('M d, Y H:i')
                    ->sortable(),

                TextColumn::make('venue.name')
                    ->label('Venue')
                    ->searchable()
                    ->sortable()
                    ->badge()
                    ->color('info'),

                TextColumn::make('performer.name')
                    ->label('Performer')
                    ->searchable()
                    ->badge()
                    ->color('success'),

                TextColumn::make('category')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'music' => 'primary',
                        'comedy' => 'warning',
                        'sports' => 'success',
                        'arts' => 'purple',
                        'food' => 'orange',
                        default => 'gray',
                    }),

                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'published' => 'success',
                        'draft' => 'warning',
                        'cancelled' => 'danger',
                        'completed' => 'info',
                        default => 'gray',
                    }),

                TextColumn::make('is_free')
                    ->label('Free')
                    ->formatStateUsing(fn (bool $state): string => $state ? 'Yes' : 'No')
                    ->badge()
                    ->color(fn (bool $state): string => $state ? 'success' : 'gray')
                    ->sortable(),

                TextColumn::make('price_min')
                    ->label('Price')
                    ->money('USD')
                    ->sortable()
                    ->formatStateUsing(fn ($record) => $record->is_free ? 'Free' : '$'.$record->price_min.' - $'.$record->price_max),

                TextColumn::make('bookings_count')
                    ->label('Bookings')
                    ->counts('bookings')
                    ->badge(),

                TextColumn::make('ticketOrders_count')
                    ->label('Ticket Orders')
                    ->counts('ticketOrders')
                    ->badge(),

                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('category')
                    ->options([
                        'music' => 'Music',
                        'comedy' => 'Comedy',
                        'sports' => 'Sports',
                        'arts' => 'Arts & Theater',
                        'food' => 'Food & Drink',
                        'nightlife' => 'Nightlife',
                        'family' => 'Family',
                        'community' => 'Community',
                    ]),

                SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'published' => 'Published',
                        'cancelled' => 'Cancelled',
                        'completed' => 'Completed',
                    ]),

                TernaryFilter::make('is_free')
                    ->label('Free Events')
                    ->placeholder('All events')
                    ->trueLabel('Free only')
                    ->falseLabel('Paid only'),

                SelectFilter::make('venue_id')
                    ->label('Venue')
                    ->relationship('venue', 'name')
                    ->searchable()
                    ->preload(),

                SelectFilter::make('performer_id')
                    ->label('Performer')
                    ->relationship('performer', 'name')
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
            ->defaultSort('event_date', 'desc');
    }
}
