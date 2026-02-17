<?php

declare(strict_types=1);

namespace App\Events\EventCity;

use App\Models\SequenceEnrollment;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class SequenceStepTriggered
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly SequenceEnrollment $enrollment
    ) {}
}
