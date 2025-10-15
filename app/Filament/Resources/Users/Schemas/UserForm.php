<?php

declare(strict_types=1);

namespace App\Filament\Resources\Users\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

final class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('User Information')
                    ->schema([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('email')
                            ->email()
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),

                        TextInput::make('password')
                            ->password()
                            ->required(fn (string $operation): bool => $operation === 'create')
                            ->dehydrated(fn (?string $state): bool => filled($state))
                            ->minLength(8)
                            ->maxLength(255),
                    ])
                    ->columns(2),

                Section::make('Social Settings')
                    ->schema([
                        Toggle::make('is_private_profile')
                            ->label('Private Profile')
                            ->default(false),

                        Toggle::make('allow_friend_requests')
                            ->label('Allow Friend Requests')
                            ->default(true),

                        Toggle::make('allow_group_invites')
                            ->label('Allow Group Invites')
                            ->default(true),
                    ])
                    ->columns(3),

                Section::make('Workspace')
                    ->schema([
                        Select::make('current_workspace_id')
                            ->label('Current Workspace')
                            ->relationship('currentWorkspace', 'name')
                            ->searchable()
                            ->preload(),
                    ]),
            ]);
    }
}
