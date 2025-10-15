<?php

declare(strict_types=1);

namespace App\Filament\Resources\TicketOrders\Pages;

use App\Filament\Resources\TicketOrders\TicketOrderResource;
use Filament\Resources\Pages\CreateRecord;

final class CreateTicketOrder extends CreateRecord
{
    protected static string $resource = TicketOrderResource::class;
}
