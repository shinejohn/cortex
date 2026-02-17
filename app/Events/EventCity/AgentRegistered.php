<?php

declare(strict_types=1);

namespace App\Events\EventCity;

use App\Models\BookingAgent;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class AgentRegistered
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly BookingAgent $agent
    ) {}
}
