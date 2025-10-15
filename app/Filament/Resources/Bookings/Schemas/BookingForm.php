<?php

declare(strict_types=1);

namespace App\Filament\Resources\Bookings\Schemas;

use Filament\Schemas\Schema;

final class BookingForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                //
            ]);
    }
}
