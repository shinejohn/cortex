<?php

declare(strict_types=1);

namespace App\Filament\Resources\TicketPlans\Pages;

use App\Filament\Resources\TicketPlans\TicketPlanResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

final class EditTicketPlan extends EditRecord
{
    protected static string $resource = TicketPlanResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
