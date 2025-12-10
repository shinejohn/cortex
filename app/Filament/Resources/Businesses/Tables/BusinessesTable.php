<?php

declare(strict_types=1);

namespace App\Filament\Resources\Businesses\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

final class BusinessesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->limit(40),

                TextColumn::make('city')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('state')
                    ->sortable(),

                TextColumn::make('primary_type')
                    ->label('Type')
                    ->badge()
                    ->color('info')
                    ->searchable(),

                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'active' => 'success',
                        'inactive' => 'danger',
                        default => 'gray',
                    }),

                IconColumn::make('is_verified')
                    ->label('Verified')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-badge')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('gray'),

                TextColumn::make('rating')
                    ->sortable()
                    ->formatStateUsing(fn ($state) => $state ? number_format((float) $state, 1).' / 5' : '-'),

                TextColumn::make('reviews_count')
                    ->label('Reviews')
                    ->sortable()
                    ->numeric(),

                TextColumn::make('regions_count')
                    ->label('Regions')
                    ->counts('regions')
                    ->badge()
                    ->color('primary'),

                TextColumn::make('workspace.name')
                    ->label('Claimed By')
                    ->searchable()
                    ->badge()
                    ->color('warning')
                    ->placeholder('Unclaimed')
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('created_at')
                    ->dateTime('M d, Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'active' => 'Active',
                        'inactive' => 'Inactive',
                    ]),

                TernaryFilter::make('is_verified')
                    ->label('Verification')
                    ->placeholder('All businesses')
                    ->trueLabel('Verified only')
                    ->falseLabel('Unverified only'),

                TernaryFilter::make('workspace_id')
                    ->label('Claimed Status')
                    ->placeholder('All businesses')
                    ->trueLabel('Claimed only')
                    ->falseLabel('Unclaimed only')
                    ->queries(
                        true: fn ($query) => $query->whereNotNull('workspace_id'),
                        false: fn ($query) => $query->whereNull('workspace_id'),
                    ),

                SelectFilter::make('regions')
                    ->label('Region')
                    ->options(fn () => \App\Models\Region::query()
                        ->where('is_active', true)
                        ->orderBy('name')
                        ->pluck('name', 'id')
                        ->toArray())
                    ->query(fn ($query, array $data) => $query->when(
                        $data['value'],
                        fn ($q) => $q->whereHas('regions', fn ($q) => $q->where('regions.id', $data['value']))
                    ))
                    ->searchable(),

                SelectFilter::make('primary_type')
                    ->label('Business Type')
                    ->options(fn () => \App\Models\Business::query()
                        ->whereNotNull('primary_type')
                        ->distinct()
                        ->pluck('primary_type', 'primary_type')
                        ->toArray())
                    ->searchable(),
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
