<?php

declare(strict_types=1);

namespace App\Events\EventCity;

use App\Models\AgentClient;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class ClientAuthorized
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly AgentClient $client
    ) {}
}
