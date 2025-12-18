<?php

declare(strict_types=1);

namespace App\Filament\Resources\WriterAgents\Pages;

use App\Filament\Resources\WriterAgents\WriterAgentResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

final class ListWriterAgents extends ListRecords
{
    protected static string $resource = WriterAgentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
