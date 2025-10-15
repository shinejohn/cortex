<?php

declare(strict_types=1);

namespace App\Filament\Resources\Calendars\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

final class CalendarsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')
                    ->searchable()
                    ->sortable()
                    ->limit(50),

                TextColumn::make('category')
                    ->badge()
                    ->color('info')
                    ->sortable(),

                TextColumn::make('user.name')
                    ->label('Owner')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('subscription_price')
                    ->label('Price')
                    ->money('USD')
                    ->sortable()
                    ->formatStateUsing(fn ($state) => $state > 0 ? '$'.$state : 'Free'),

                TextColumn::make('followers_count')
                    ->label('Followers')
                    ->badge()
                    ->color('success')
                    ->sortable(),

                TextColumn::make('events_count')
                    ->label('Events')
                    ->badge()
                    ->color('primary')
                    ->sortable(),

                IconColumn::make('is_private')
                    ->label('Private')
                    ->boolean()
                    ->sortable(),

                IconColumn::make('is_verified')
                    ->label('Verified')
                    ->boolean()
                    ->sortable(),

                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->since()
                    ->dateTimeTooltip()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('category')
                    ->options([
                        'music' => 'Music',
                        'comedy' => 'Comedy',
                        'sports' => 'Sports',
                        'arts' => 'Arts',
                        'food' => 'Food & Drink',
                        'community' => 'Community',
                    ]),

                TernaryFilter::make('is_private')
                    ->label('Privacy')
                    ->placeholder('All calendars')
                    ->trueLabel('Private only')
                    ->falseLabel('Public only'),

                TernaryFilter::make('is_verified')
                    ->label('Verified')
                    ->placeholder('All calendars')
                    ->trueLabel('Verified only')
                    ->falseLabel('Unverified only'),
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
