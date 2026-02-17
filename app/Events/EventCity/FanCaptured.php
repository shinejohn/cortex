<?php

declare(strict_types=1);

namespace App\Events\EventCity;

use App\Models\Fan;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class FanCaptured
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly Fan $fan
    ) {}
}
