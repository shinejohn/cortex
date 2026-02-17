<?php

declare(strict_types=1);

namespace App\Events\EventCity;

use App\Models\UserBehavioralEvent;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class UserBehaviorRecorded
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly UserBehavioralEvent $behavioralEvent
    ) {}
}
