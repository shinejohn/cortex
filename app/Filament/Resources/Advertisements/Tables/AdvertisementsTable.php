<?php

declare(strict_types=1);

namespace App\Filament\Resources\Advertisements\Tables;

use Filament\Tables\Actions\BulkActionGroup;
use Filament\Tables\Actions\DeleteBulkAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

final class AdvertisementsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable(),

                BadgeColumn::make('platform')
                    ->colors([
                        'primary' => 'day_news',
                        'success' => 'event_city',
                        'warning' => 'downtown_guide',
                    ])
                    ->formatStateUsing(fn ($state) => match ($state) {
                        'day_news' => 'Day News',
                        'event_city' => 'Go Event City',
                        'downtown_guide' => 'Downtown Guide',
                        default => $state,
                    }),

                BadgeColumn::make('placement')
                    ->colors([
                        'secondary' => static fn ($state): bool => true,
                    ]),

                TextColumn::make('advertable.title')
                    ->label('Content')
                    ->sortable()
                    ->searchable()
                    ->limit(40),

                IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean()
                    ->sortable(),

                TextColumn::make('impressions_count')
                    ->label('Impressions')
                    ->sortable()
                    ->toggleable(),

                TextColumn::make('clicks_count')
                    ->label('Clicks')
                    ->sortable()
                    ->toggleable(),

                TextColumn::make('ctr')
                    ->label('CTR')
                    ->getStateUsing(fn ($record) => $record->getCTR().'%')
                    ->toggleable(),

                TextColumn::make('starts_at')
                    ->dateTime('M d, Y')
                    ->sortable()
                    ->toggleable(),

                TextColumn::make('expires_at')
                    ->dateTime('M d, Y')
                    ->sortable()
                    ->toggleable(),

                TextColumn::make('created_at')
                    ->dateTime('M d, Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('platform')
                    ->options([
                        'day_news' => 'Day News',
                        'event_city' => 'Go Event City',
                        'downtown_guide' => 'Downtown Guide',
                    ]),

                SelectFilter::make('placement')
                    ->options([
                        'sidebar' => 'Sidebar',
                        'banner' => 'Banner',
                        'inline' => 'Inline',
                        'featured' => 'Featured',
                    ]),

                TernaryFilter::make('is_active')
                    ->label('Active')
                    ->placeholder('All')
                    ->trueLabel('Active only')
                    ->falseLabel('Inactive only'),
            ])
            ->actions([
                EditAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
