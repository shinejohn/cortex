<?php

declare(strict_types=1);

namespace App\Events\EventCity;

use App\Models\Tip;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class TipReceived
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly Tip $tip
    ) {}
}
