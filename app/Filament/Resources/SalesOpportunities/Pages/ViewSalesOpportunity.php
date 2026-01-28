<?php

namespace App\Filament\Resources\SalesOpportunities\Pages;

use App\Filament\Resources\SalesOpportunities\SalesOpportunityResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewSalesOpportunity extends ViewRecord
{
    protected static string $resource = SalesOpportunityResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
