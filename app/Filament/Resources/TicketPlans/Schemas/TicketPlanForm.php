<?php

declare(strict_types=1);

namespace App\Filament\Resources\TicketPlans\Schemas;

use Filament\Schemas\Schema;

final class TicketPlanForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                //
            ]);
    }
}
