<?php

declare(strict_types=1);

namespace App\Filament\Resources\TicketOrders\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

final class TicketOrdersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->label('Order ID')
                    ->searchable()
                    ->sortable()
                    ->copyable(),

                TextColumn::make('event.title')
                    ->searchable()
                    ->sortable()
                    ->limit(40)
                    ->badge()
                    ->color('info'),

                TextColumn::make('user.name')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('items_count')
                    ->label('Tickets')
                    ->counts('items')
                    ->badge()
                    ->color('primary'),

                TextColumn::make('total')
                    ->money('USD')
                    ->sortable(),

                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'completed' => 'success',
                        'pending' => 'warning',
                        'cancelled' => 'danger',
                        default => 'gray',
                    }),

                TextColumn::make('payment_status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'paid' => 'success',
                        'pending' => 'warning',
                        default => 'gray',
                    }),

                TextColumn::make('completed_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->since()
                    ->dateTimeTooltip(),
            ])
            ->filters([
                SelectFilter::make('status')->options(['pending' => 'Pending', 'completed' => 'Completed', 'cancelled' => 'Cancelled']),
                SelectFilter::make('payment_status'),
                SelectFilter::make('event_id')->relationship('event', 'title')->searchable()->preload(),
            ])
            ->recordActions([ViewAction::make(), EditAction::make()])
            ->toolbarActions([BulkActionGroup::make([DeleteBulkAction::make()])])
            ->defaultSort('created_at', 'desc');
    }
}
