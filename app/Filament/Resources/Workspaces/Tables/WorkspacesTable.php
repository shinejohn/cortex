<?php

declare(strict_types=1);

namespace App\Filament\Resources\Workspaces\Tables;

use App\Services\StripeConnectService;
use Exception;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Notifications\Notification;
use Filament\Support\Colors\Color;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

final class WorkspacesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->description(fn ($record) => $record->owner->name),
                TextColumn::make('slug')
                    ->searchable()
                    ->sortable()
                    ->toggleable(),
                TextColumn::make('stripe_connect_id')
                    ->label('Stripe Account')
                    ->searchable()
                    ->badge()
                    ->color(fn ($state) => $state ? Color::Green : Color::Gray)
                    ->formatStateUsing(fn ($state) => $state ? 'Connected' : 'Not Connected')
                    ->description(fn ($record) => $record->stripe_connect_id),
                IconColumn::make('stripe_admin_approved')
                    ->label('Admin Approved')
                    ->boolean()
                    ->sortable(),
                IconColumn::make('stripe_charges_enabled')
                    ->label('Charges')
                    ->boolean()
                    ->sortable(),
                IconColumn::make('stripe_payouts_enabled')
                    ->label('Payouts')
                    ->boolean()
                    ->sortable(),
                TextColumn::make('payment_status')
                    ->label('Payment Status')
                    ->badge()
                    ->color(fn ($record) => $record->canAcceptPayments() ? Color::Green : Color::Red)
                    ->formatStateUsing(fn ($record) => $record->canAcceptPayments() ? 'Active' : 'Inactive')
                    ->state(fn ($record) => $record->canAcceptPayments() ? 'Active' : 'Inactive'),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                TernaryFilter::make('stripe_admin_approved')
                    ->label('Admin Approved')
                    ->placeholder('All')
                    ->trueLabel('Approved')
                    ->falseLabel('Not Approved'),
                TernaryFilter::make('has_stripe_account')
                    ->label('Stripe Account')
                    ->placeholder('All')
                    ->trueLabel('Connected')
                    ->falseLabel('Not Connected')
                    ->queries(
                        true: fn ($query) => $query->whereNotNull('stripe_connect_id'),
                        false: fn ($query) => $query->whereNull('stripe_connect_id'),
                    ),
            ])
            ->recordActions([
                Action::make('refreshCapabilities')
                    ->label('Refresh')
                    ->icon('heroicon-o-arrow-path')
                    ->color(Color::Blue)
                    ->requiresConfirmation()
                    ->modalHeading('Refresh Stripe Capabilities')
                    ->modalDescription('This will fetch the latest status from Stripe and update the workspace capabilities.')
                    ->modalSubmitActionLabel('Refresh')
                    ->visible(fn ($record) => $record->stripe_connect_id !== null)
                    ->action(function ($record) {
                        try {
                            $service = app(StripeConnectService::class);
                            $service->updateWorkspaceCapabilities($record);

                            Notification::make()
                                ->success()
                                ->title('Capabilities Updated')
                                ->body('Successfully refreshed Stripe capabilities for this workspace.')
                                ->send();
                        } catch (Exception $e) {
                            Notification::make()
                                ->danger()
                                ->title('Error')
                                ->body('Failed to refresh capabilities: '.$e->getMessage())
                                ->send();
                        }
                    }),
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
