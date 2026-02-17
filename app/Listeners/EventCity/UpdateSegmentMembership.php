<?php

declare(strict_types=1);

namespace App\Listeners\EventCity;

use App\Events\EventCity\SegmentMembershipChanged;

final class UpdateSegmentMembership
{
    public function handle(SegmentMembershipChanged $event): void
    {
        $segment = $event->segment;

        $memberCount = $segment->memberships()->active()->count();

        $segment->update(['member_count' => $memberCount]);
    }
}
