<?php

declare(strict_types=1);

namespace App\Filament\Resources\TicketPlans\Pages;

use App\Filament\Resources\TicketPlans\TicketPlanResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

final class ListTicketPlans extends ListRecords
{
    protected static string $resource = TicketPlanResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
