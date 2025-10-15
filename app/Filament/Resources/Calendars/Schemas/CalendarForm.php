<?php

declare(strict_types=1);

namespace App\Filament\Resources\Calendars\Schemas;

use Filament\Schemas\Schema;

final class CalendarForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                //
            ]);
    }
}
