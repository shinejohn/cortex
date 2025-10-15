<?php

declare(strict_types=1);

namespace App\Filament\Resources\TicketPlans\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

final class TicketPlansTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('event.title')
                    ->searchable()
                    ->sortable()
                    ->badge()
                    ->color('info'),

                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('price')
                    ->money('USD')
                    ->sortable(),

                TextColumn::make('max_quantity')
                    ->label('Total')
                    ->sortable(),

                TextColumn::make('available_quantity')
                    ->label('Available')
                    ->sortable()
                    ->badge()
                    ->color(fn (int $state, $record): string => match (true) {
                        $state <= 0 => 'danger',
                        $state < ($record->max_quantity * 0.2) => 'warning',
                        default => 'success',
                    }),

                TextColumn::make('sold')
                    ->label('Sold')
                    ->formatStateUsing(fn ($record) => $record->max_quantity - $record->available_quantity)
                    ->badge()
                    ->color('primary'),

                IconColumn::make('is_active')
                    ->boolean()
                    ->sortable(),

                TextColumn::make('sort_order')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('event_id')->relationship('event', 'title')->searchable()->preload(),
                TernaryFilter::make('is_active'),
            ])
            ->recordActions([ViewAction::make(), EditAction::make()])
            ->toolbarActions([BulkActionGroup::make([DeleteBulkAction::make()])])
            ->defaultSort('sort_order');
    }
}
