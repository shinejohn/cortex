<?php

declare(strict_types=1);

namespace App\Filament\Resources\DayNewsPosts\Pages;

use App\Filament\Resources\DayNewsPosts\DayNewsPostResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

final class EditDayNewsPost extends EditRecord
{
    protected static string $resource = DayNewsPostResource::class;

    protected function getHeaderActions(): array
    {
        return [
            \Filament\Actions\Action::make('share')
                ->label('Share to Socials')
                ->icon('heroicon-o-share')
                ->color('info')
                ->form([
                    \Filament\Forms\Components\CheckboxList::make('platforms')
                        ->options([
                            'facebook' => 'Facebook',
                            'twitter' => 'X (Twitter)',
                            'linkedin' => 'LinkedIn',
                        ])
                        ->default(['facebook', 'linkedin'])
                        ->required(),
                ])
                ->action(function (array $data, \App\Models\DayNewsPost $record) {
                    $service = app(\App\Services\SocialShareService::class);
                    $results = $service->post($record, $data['platforms']);

                    $success = collect($results)->filter()->keys()->implode(', ');
                    $failed = collect($results)->reject()->keys()->implode(', ');

                    if ($success) {
                        \Filament\Notifications\Notification::make()
                            ->title("Shared to $success")
                            ->success()
                            ->send();
                    }

                    if ($failed) {
                        \Filament\Notifications\Notification::make()
                            ->title("Failed to share to $failed")
                            ->danger()
                            ->send();
                    }
                }),
            DeleteAction::make(),
        ];
    }
}
