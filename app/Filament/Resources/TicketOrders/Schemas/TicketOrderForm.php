<?php

declare(strict_types=1);

namespace App\Filament\Resources\TicketOrders\Schemas;

use Filament\Schemas\Schema;

final class TicketOrderForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                //
            ]);
    }
}
