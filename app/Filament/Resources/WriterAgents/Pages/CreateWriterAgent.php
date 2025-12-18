<?php

declare(strict_types=1);

namespace App\Filament\Resources\WriterAgents\Pages;

use App\Filament\Resources\WriterAgents\WriterAgentResource;
use Filament\Resources\Pages\CreateRecord;

final class CreateWriterAgent extends CreateRecord
{
    protected static string $resource = WriterAgentResource::class;
}
