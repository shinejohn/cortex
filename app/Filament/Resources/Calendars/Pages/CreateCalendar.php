<?php

declare(strict_types=1);

namespace App\Filament\Resources\Calendars\Pages;

use App\Filament\Resources\Calendars\CalendarResource;
use Filament\Resources\Pages\CreateRecord;

final class CreateCalendar extends CreateRecord
{
    protected static string $resource = CalendarResource::class;
}
