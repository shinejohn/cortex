<?php

declare(strict_types=1);

namespace App\Filament\Resources\NewsFetchFrequencies\Pages;

use App\Filament\Resources\NewsFetchFrequencies\NewsFetchFrequencyResource;
use App\Services\News\FetchFrequencyService;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;

final class ListNewsFetchFrequencies extends ListRecords
{
    protected static string $resource = NewsFetchFrequencyResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('sync')
                ->label('Sync from Config')
                ->icon('heroicon-o-arrow-path')
                ->color('gray')
                ->action(function (FetchFrequencyService $service) {
                    $synced = $service->syncDefaultFrequencies();

                    Notification::make()
                        ->title('Frequencies Synced')
                        ->body("Synced {$synced} frequency configurations from config.")
                        ->success()
                        ->send();
                })
                ->requiresConfirmation()
                ->modalHeading('Sync Frequencies from Config')
                ->modalDescription('This will create or update frequency configurations from the config file. Existing database overrides will be preserved.')
                ->modalSubmitActionLabel('Sync'),
            CreateAction::make(),
        ];
    }
}
