<?php

declare(strict_types=1);

namespace App\Filament\Resources\Regions\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

final class RegionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->description(fn ($record): ?string => $record->description),

                TextColumn::make('type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'state' => 'primary',
                        'county' => 'info',
                        'city' => 'success',
                        'neighborhood' => 'warning',
                        'custom' => 'gray',
                        default => 'gray',
                    })
                    ->sortable(),

                TextColumn::make('parent.name')
                    ->label('Parent Region')
                    ->searchable()
                    ->badge()
                    ->color('gray')
                    ->default('—'),

                IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean()
                    ->sortable(),

                TextColumn::make('zipcodes_count')
                    ->label('Zipcodes')
                    ->counts('zipcodes')
                    ->badge()
                    ->color('info'),

                TextColumn::make('news_count')
                    ->label('News Articles')
                    ->counts('news')
                    ->badge()
                    ->color('success'),

                TextColumn::make('children_count')
                    ->label('Sub-regions')
                    ->counts('children')
                    ->badge()
                    ->color('warning'),

                TextColumn::make('display_order')
                    ->label('Order')
                    ->sortable()
                    ->toggleable(),

                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('type')
                    ->options([
                        'state' => 'State',
                        'county' => 'County',
                        'city' => 'City',
                        'neighborhood' => 'Neighborhood',
                        'custom' => 'Custom',
                    ]),

                TernaryFilter::make('is_active')
                    ->label('Active Status')
                    ->placeholder('All regions')
                    ->trueLabel('Active only')
                    ->falseLabel('Inactive only'),

                SelectFilter::make('parent_id')
                    ->label('Parent Region')
                    ->relationship('parent', 'name')
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
            ->defaultSort('display_order', 'asc');
    }
}
