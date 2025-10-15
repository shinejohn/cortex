<?php

declare(strict_types=1);

namespace App\Filament\Resources\Performers\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

final class PerformersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('profile_image')
                    ->label('Image')
                    ->circular()
                    ->defaultImageUrl(fn ($record) => 'https://ui-avatars.com/api/?name='.urlencode($record->name)),

                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->limit(50),

                TextColumn::make('genres')
                    ->badge()
                    ->separator(',')
                    ->limit(3)
                    ->color('primary'),

                TextColumn::make('average_rating')
                    ->label('Rating')
                    ->sortable()
                    ->formatStateUsing(fn ($state) => $state ? number_format($state, 1).' ★' : 'N/A'),

                TextColumn::make('events_count')
                    ->label('Events')
                    ->counts('events')
                    ->badge()
                    ->color('success'),

                TextColumn::make('bookings_count')
                    ->label('Bookings')
                    ->counts('bookings')
                    ->badge()
                    ->color('info'),

                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'active' => 'success',
                        'inactive' => 'gray',
                        'pending' => 'warning',
                        'suspended' => 'danger',
                        default => 'gray',
                    }),

                IconColumn::make('is_verified')
                    ->label('Verified')
                    ->boolean()
                    ->sortable(),

                TextColumn::make('base_price')
                    ->label('Base Price')
                    ->money('USD')
                    ->sortable()
                    ->toggleable(),

                TextColumn::make('home_city')
                    ->label('City')
                    ->searchable()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'active' => 'Active',
                        'inactive' => 'Inactive',
                        'pending' => 'Pending Approval',
                        'suspended' => 'Suspended',
                    ]),

                TernaryFilter::make('is_verified')
                    ->label('Verification Status')
                    ->placeholder('All performers')
                    ->trueLabel('Verified only')
                    ->falseLabel('Unverified only'),

                TernaryFilter::make('available_for_booking')
                    ->label('Booking Availability')
                    ->placeholder('All performers')
                    ->trueLabel('Available only')
                    ->falseLabel('Unavailable only'),

                TernaryFilter::make('is_touring_now')
                    ->label('Touring Status')
                    ->placeholder('All performers')
                    ->trueLabel('Currently touring')
                    ->falseLabel('Not touring'),

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
