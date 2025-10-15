<?php

declare(strict_types=1);

namespace App\Filament\Resources\SocialPosts\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

final class SocialPostsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.name')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('content')
                    ->limit(100)
                    ->wrap()
                    ->searchable(),

                TextColumn::make('likes_count')
                    ->label('Likes')
                    ->counts('likes')
                    ->badge()
                    ->color('danger'),

                TextColumn::make('comments_count')
                    ->label('Comments')
                    ->counts('comments')
                    ->badge()
                    ->color('info'),

                TextColumn::make('shares_count')
                    ->label('Shares')
                    ->counts('shares')
                    ->badge()
                    ->color('success'),

                TextColumn::make('visibility')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'public' => 'success',
                        'friends' => 'info',
                        'private' => 'warning',
                        default => 'gray',
                    }),

                IconColumn::make('is_active')
                    ->boolean(),

                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->since()
                    ->dateTimeTooltip(),
            ])
            ->filters([
                SelectFilter::make('user_id')->relationship('user', 'name')->searchable()->preload(),
                SelectFilter::make('visibility')->options(['public' => 'Public', 'friends' => 'Friends', 'private' => 'Private']),
                TernaryFilter::make('is_active'),
            ])
            ->recordActions([ViewAction::make(), EditAction::make()])
            ->toolbarActions([BulkActionGroup::make([DeleteBulkAction::make()])])
            ->defaultSort('created_at', 'desc');
    }
}
