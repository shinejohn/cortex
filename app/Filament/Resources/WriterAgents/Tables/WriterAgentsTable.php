<?php

declare(strict_types=1);

namespace App\Filament\Resources\WriterAgents\Tables;

use App\Models\WriterAgent;
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

final class WriterAgentsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('avatar_url')
                    ->label('Avatar')
                    ->circular()
                    ->defaultImageUrl(fn ($record): string => "https://api.dicebear.com/7.x/personas/svg?seed={$record->name}")
                    ->size(40),

                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->description(fn ($record): ?string => $record->bio ? str($record->bio)->limit(80)->toString() : null),

                TextColumn::make('writing_style')
                    ->label('Style')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        WriterAgent::STYLE_FORMAL => 'primary',
                        WriterAgent::STYLE_CASUAL => 'success',
                        WriterAgent::STYLE_INVESTIGATIVE => 'warning',
                        WriterAgent::STYLE_CONVERSATIONAL => 'info',
                        default => 'gray',
                    })
                    ->sortable(),

                TextColumn::make('regions_count')
                    ->label('Regions')
                    ->counts('regions')
                    ->badge()
                    ->color('info'),

                TextColumn::make('categories')
                    ->label('Categories')
                    ->badge()
                    ->color('gray')
                    ->formatStateUsing(function ($state) {
                        if (is_array($state)) {
                            return implode(', ', array_slice($state, 0, 3)).(count($state) > 3 ? '...' : '');
                        }

                        return $state;
                    })
                    ->wrap(),

                TextColumn::make('articles_count')
                    ->label('Articles')
                    ->numeric()
                    ->sortable()
                    ->badge()
                    ->color(fn (int $state): string => match (true) {
                        $state >= 100 => 'success',
                        $state >= 50 => 'info',
                        $state >= 10 => 'warning',
                        default => 'gray',
                    }),

                IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean()
                    ->sortable(),

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
                SelectFilter::make('writing_style')
                    ->label('Writing Style')
                    ->options([
                        WriterAgent::STYLE_FORMAL => 'Formal',
                        WriterAgent::STYLE_CASUAL => 'Casual',
                        WriterAgent::STYLE_INVESTIGATIVE => 'Investigative',
                        WriterAgent::STYLE_CONVERSATIONAL => 'Conversational',
                    ]),

                TernaryFilter::make('is_active')
                    ->label('Active Status')
                    ->placeholder('All agents')
                    ->trueLabel('Active only')
                    ->falseLabel('Inactive only'),
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
            ->defaultSort('articles_count', 'desc');
    }
}
