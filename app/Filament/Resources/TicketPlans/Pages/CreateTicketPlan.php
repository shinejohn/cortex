<?php

declare(strict_types=1);

namespace App\Filament\Resources\TicketPlans\Pages;

use App\Filament\Resources\TicketPlans\TicketPlanResource;
use Filament\Resources\Pages\CreateRecord;

final class CreateTicketPlan extends CreateRecord
{
    protected static string $resource = TicketPlanResource::class;
}
