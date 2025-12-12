<?php

declare(strict_types=1);

namespace App\Filament\Resources\NewsFetchFrequencies\Tables;

use App\Models\NewsFetchFrequency;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

final class NewsFetchFrequenciesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('category')
                    ->label('Category')
                    ->badge()
                    ->color('primary')
                    ->formatStateUsing(fn (string $state): string => str($state)->replace('_', ' ')->title()->toString())
                    ->searchable()
                    ->sortable(),

                TextColumn::make('category_type')
                    ->label('Type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        NewsFetchFrequency::CATEGORY_TYPE_NEWS => 'success',
                        NewsFetchFrequency::CATEGORY_TYPE_BUSINESS => 'info',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        NewsFetchFrequency::CATEGORY_TYPE_NEWS => 'News',
                        NewsFetchFrequency::CATEGORY_TYPE_BUSINESS => 'Business',
                        default => $state,
                    })
                    ->sortable(),

                TextColumn::make('frequency_type')
                    ->label('Frequency')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        NewsFetchFrequency::FREQUENCY_DAILY => 'success',
                        NewsFetchFrequency::FREQUENCY_WEEKLY => 'warning',
                        NewsFetchFrequency::FREQUENCY_MONTHLY => 'danger',
                        NewsFetchFrequency::FREQUENCY_CUSTOM_DAYS => 'info',
                        default => 'gray',
                    })
                    ->formatStateUsing(function (string $state, NewsFetchFrequency $record): string {
                        if ($state === NewsFetchFrequency::FREQUENCY_CUSTOM_DAYS) {
                            return "Every {$record->custom_interval_days} days";
                        }

                        return str($state)->replace('_', ' ')->title()->toString();
                    })
                    ->sortable(),

                TextColumn::make('last_fetched_at')
                    ->label('Last Fetched')
                    ->dateTime()
                    ->sortable()
                    ->description(fn (?string $state): ?string => $state ? \Carbon\Carbon::parse($state)->diffForHumans() : 'Never'),

                TextColumn::make('next_fetch')
                    ->label('Next Fetch')
                    ->state(function (NewsFetchFrequency $record): string {
                        $nextFetch = $record->getNextFetchDate();
                        if ($nextFetch === null || $nextFetch->isPast()) {
                            return 'Due now';
                        }

                        return $nextFetch->diffForHumans();
                    })
                    ->badge()
                    ->color(function (NewsFetchFrequency $record): string {
                        $nextFetch = $record->getNextFetchDate();
                        if ($nextFetch === null || $nextFetch->isPast()) {
                            return 'success';
                        }

                        return 'gray';
                    }),

                ToggleColumn::make('is_enabled')
                    ->label('Enabled')
                    ->sortable(),

                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('category_type')
                    ->label('Category Type')
                    ->options(NewsFetchFrequency::categoryTypeOptions()),

                SelectFilter::make('frequency_type')
                    ->label('Frequency')
                    ->options(NewsFetchFrequency::frequencyOptions()),

                TernaryFilter::make('is_enabled')
                    ->label('Status')
                    ->placeholder('All')
                    ->trueLabel('Enabled only')
                    ->falseLabel('Disabled only'),
            ])
            ->actions([
                EditAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('category');
    }
}
