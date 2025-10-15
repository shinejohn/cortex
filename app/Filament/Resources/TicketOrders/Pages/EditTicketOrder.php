<?php

declare(strict_types=1);

namespace App\Filament\Resources\TicketOrders\Pages;

use App\Filament\Resources\TicketOrders\TicketOrderResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

final class EditTicketOrder extends EditRecord
{
    protected static string $resource = TicketOrderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
