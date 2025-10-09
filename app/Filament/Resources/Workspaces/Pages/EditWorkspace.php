<?php

declare(strict_types=1);

namespace App\Filament\Resources\Workspaces\Pages;

use App\Filament\Resources\Workspaces\WorkspaceResource;
use App\Services\StripeConnectService;
use Exception;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Filament\Support\Colors\Color;

final class EditWorkspace extends EditRecord
{
    protected static string $resource = WorkspaceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('viewStripeDashboard')
                ->label('View Stripe Dashboard')
                ->icon('heroicon-o-arrow-top-right-on-square')
                ->color(Color::Blue)
                ->visible(fn () => $this->record->stripe_connect_id !== null)
                ->action(function () {
                    try {
                        $service = app(StripeConnectService::class);
                        $url = $service->createDashboardLink($this->record);

                        Notification::make()
                            ->success()
                            ->title('Dashboard Link Created')
                            ->body('Opening Stripe Dashboard...')
                            ->send();

                        $this->redirect($url, shouldOpenInNewTab: true);
                    } catch (Exception $e) {
                        Notification::make()
                            ->danger()
                            ->title('Error')
                            ->body('Failed to create dashboard link: '.$e->getMessage())
                            ->send();
                    }
                }),
            Action::make('refreshCapabilities')
                ->label('Refresh Stripe Status')
                ->icon('heroicon-o-arrow-path')
                ->color(Color::Amber)
                ->requiresConfirmation()
                ->modalHeading('Refresh Stripe Capabilities')
                ->modalDescription('This will fetch the latest status from Stripe and update the workspace capabilities.')
                ->modalSubmitActionLabel('Refresh')
                ->visible(fn () => $this->record->stripe_connect_id !== null)
                ->action(function () {
                    try {
                        $service = app(StripeConnectService::class);
                        $service->updateWorkspaceCapabilities($this->record);

                        Notification::make()
                            ->success()
                            ->title('Capabilities Updated')
                            ->body('Successfully refreshed Stripe capabilities.')
                            ->send();

                        $this->redirect($this->getResource()::getUrl('edit', ['record' => $this->record]));
                    } catch (Exception $e) {
                        Notification::make()
                            ->danger()
                            ->title('Error')
                            ->body('Failed to refresh capabilities: '.$e->getMessage())
                            ->send();
                    }
                }),
            DeleteAction::make(),
        ];
    }
}
