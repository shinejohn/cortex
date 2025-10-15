<?php

declare(strict_types=1);

namespace App\Filament\Resources\Reviews\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

final class ReviewsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.name')
                    ->label('Reviewer')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('reviewable_type')
                    ->label('Type')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => class_basename($state)),

                TextColumn::make('reviewable.name')
                    ->label('Item')
                    ->searchable()
                    ->limit(40),

                TextColumn::make('rating')
                    ->sortable()
                    ->badge()
                    ->color(fn (int $state): string => match (true) {
                        $state >= 4 => 'success',
                        $state >= 3 => 'warning',
                        default => 'danger',
                    })
                    ->formatStateUsing(fn (int $state): string => str_repeat('⭐', $state)),

                TextColumn::make('content')
                    ->label('Review')
                    ->limit(50)
                    ->wrap(),

                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'approved' => 'success',
                        'pending' => 'warning',
                        'rejected' => 'danger',
                        default => 'gray',
                    }),

                IconColumn::make('is_verified')
                    ->boolean(),

                TextColumn::make('helpful_count')
                    ->label('Helpful')
                    ->badge()
                    ->color('info'),

                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->since()
                    ->dateTimeTooltip(),
            ])
            ->filters([
                SelectFilter::make('reviewable_type')->options([
                    'App\\Models\\Event' => 'Event',
                    'App\\Models\\Venue' => 'Venue',
                    'App\\Models\\Performer' => 'Performer',
                ]),
                SelectFilter::make('rating')->options([
                    5 => '5 Stars',
                    4 => '4 Stars',
                    3 => '3 Stars',
                    2 => '2 Stars',
                    1 => '1 Star',
                ]),
                SelectFilter::make('status')->options([
                    'approved' => 'Approved',
                    'pending' => 'Pending',
                    'rejected' => 'Rejected',
                ]),
            ])
            ->recordActions([ViewAction::make(), EditAction::make()])
            ->toolbarActions([BulkActionGroup::make([DeleteBulkAction::make()])])
            ->defaultSort('created_at', 'desc');
    }
}
