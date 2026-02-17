<?php

declare(strict_types=1);

namespace App\Events\EventCity;

use App\Models\Performer;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class PerformerTipJarEnabled
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly Performer $performer
    ) {}
}
