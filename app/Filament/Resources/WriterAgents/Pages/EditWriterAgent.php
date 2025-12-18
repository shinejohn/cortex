<?php

declare(strict_types=1);

namespace App\Filament\Resources\WriterAgents\Pages;

use App\Filament\Resources\WriterAgents\WriterAgentResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

final class EditWriterAgent extends EditRecord
{
    protected static string $resource = WriterAgentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
