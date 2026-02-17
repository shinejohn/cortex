<?php

declare(strict_types=1);

namespace App\Events\EventCity;

use App\Models\User;
use App\Models\UserSegment;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class SegmentMembershipChanged
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly UserSegment $segment,
        public readonly User $user,
        public readonly string $action,
    ) {}
}
