<?php

declare(strict_types=1);

namespace App\Filament\Resources\DayNewsPosts\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

final class DayNewsPostsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('title')
                    ->sortable()
                    ->searchable()
                    ->limit(50)
                    ->tooltip(fn ($record) => $record->title),

                BadgeColumn::make('type')
                    ->colors([
                        'primary' => 'article',
                        'warning' => 'announcement',
                        'danger' => 'notice',
                        'success' => 'ad',
                        'info' => 'schedule',
                    ]),

                BadgeColumn::make('category')
                    ->colors([
                        'secondary' => static fn ($state): bool => $state !== null,
                    ])
                    ->formatStateUsing(fn ($state) => $state ? str_replace('_', ' ', ucfirst($state)) : null),

                BadgeColumn::make('status')
                    ->colors([
                        'secondary' => 'draft',
                        'success' => 'published',
                        'danger' => 'expired',
                        'warning' => 'removed',
                    ]),

                TextColumn::make('author.name')
                    ->sortable()
                    ->searchable()
                    ->toggleable(),

                TextColumn::make('workspace.name')
                    ->sortable()
                    ->searchable()
                    ->toggleable(),

                TextColumn::make('view_count')
                    ->label('Views')
                    ->sortable()
                    ->toggleable(),

                TextColumn::make('regions_count')
                    ->counts('regions')
                    ->label('Regions')
                    ->toggleable(),

                TextColumn::make('published_at')
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

                TextColumn::make('updated_at')
                    ->dateTime('M d, Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('type')
                    ->options([
                        'article' => 'Article',
                        'announcement' => 'Announcement',
                        'notice' => 'Notice',
                        'ad' => 'Advertisement',
                        'schedule' => 'Schedule',
                    ]),

                SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'published' => 'Published',
                        'expired' => 'Expired',
                        'removed' => 'Removed',
                    ]),

                SelectFilter::make('category')
                    ->options([
                        'demise' => 'Demise',
                        'missing_person' => 'Missing Person',
                        'emergency' => 'Emergency',
                    ]),
            ])
            ->actions([
                ViewAction::make(),
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
