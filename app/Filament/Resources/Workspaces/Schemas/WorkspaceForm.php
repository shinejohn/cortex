<?php

declare(strict_types=1);

namespace App\Filament\Resources\Workspaces\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

final class WorkspaceForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Workspace Information')
                    ->description('Basic workspace details')
                    ->icon('heroicon-o-building-office')
                    ->columns(2)
                    ->schema([
                        Select::make('owner_id')
                            ->relationship('owner', 'name')
                            ->required()
                            ->searchable()
                            ->preload(),
                        TextInput::make('name')
                            ->required()
                            ->disabled(),
                        TextInput::make('slug')
                            ->required()
                            ->disabled(),
                    ]),
                Section::make('Stripe Connect Settings')
                    ->description('Manage Stripe Connect account and payment capabilities')
                    ->icon('heroicon-o-credit-card')
                    ->columns(2)
                    ->schema([
                        TextInput::make('stripe_connect_id')
                            ->label('Stripe Account ID')
                            ->disabled()
                            ->helperText('The Stripe Connect account ID for this workspace'),
                        Toggle::make('stripe_admin_approved')
                            ->label('Admin Approved')
                            ->helperText('Enable this to allow the workspace to accept payments')
                            ->inline(false),
                        Toggle::make('stripe_charges_enabled')
                            ->label('Charges Enabled')
                            ->helperText('Automatically set by Stripe when account is ready')
                            ->disabled()
                            ->inline(false),
                        Toggle::make('stripe_payouts_enabled')
                            ->label('Payouts Enabled')
                            ->helperText('Automatically set by Stripe when account is ready')
                            ->disabled()
                            ->inline(false),
                    ]),
            ]);
    }
}
