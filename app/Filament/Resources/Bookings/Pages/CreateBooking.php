<?php

declare(strict_types=1);

namespace App\Filament\Resources\Bookings\Pages;

use App\Filament\Resources\Bookings\BookingResource;
use Filament\Resources\Pages\CreateRecord;

final class CreateBooking extends CreateRecord
{
    protected static string $resource = BookingResource::class;
}
