<?php

declare(strict_types=1);

namespace App\Filament\Resources\Users\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

final class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('avatar')
                    ->label('Avatar')
                    ->circular()
                    ->defaultImageUrl(fn ($record) => $record->avatar),

                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('email')
                    ->searchable()
                    ->sortable()
                    ->copyable(),

                TextColumn::make('currentWorkspace.name')
                    ->label('Current Workspace')
                    ->searchable()
                    ->sortable()
                    ->badge()
                    ->color('info'),

                TextColumn::make('workspaceMemberships_count')
                    ->label('Workspaces')
                    ->counts('workspaceMemberships')
                    ->badge()
                    ->color('success'),

                TextColumn::make('socialPosts_count')
                    ->label('Posts')
                    ->counts('socialPosts')
                    ->sortable(),

                TextColumn::make('followers_count')
                    ->label('Followers')
                    ->counts('followers')
                    ->sortable(),

                TextColumn::make('following_count')
                    ->label('Following')
                    ->counts('following')
                    ->sortable(),

                TextColumn::make('email_verified_at')
                    ->label('Verified')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('last_active_at')
                    ->label('Last Active')
                    ->dateTime()
                    ->sortable()
                    ->since()
                    ->dateTimeTooltip()
                    ->toggleable(),

                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                TernaryFilter::make('email_verified_at')
                    ->label('Email Verified')
                    ->nullable()
                    ->placeholder('All users')
                    ->trueLabel('Verified only')
                    ->falseLabel('Unverified only'),

                SelectFilter::make('current_workspace_id')
                    ->label('Workspace')
                    ->relationship('currentWorkspace', 'name')
                    ->searchable()
                    ->preload(),

                TernaryFilter::make('is_private_profile')
                    ->label('Profile Type')
                    ->placeholder('All profiles')
                    ->trueLabel('Private profiles')
                    ->falseLabel('Public profiles'),
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
