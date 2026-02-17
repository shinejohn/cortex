<?php

declare(strict_types=1);

namespace App\Jobs\EventCity;

use App\Models\UserSegment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class RecomputeSegmentMemberships implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $segments = UserSegment::all();
        $updated = 0;

        foreach ($segments as $segment) {
            $activeMemberCount = $segment->memberships()->active()->count();

            if ($segment->member_count !== $activeMemberCount) {
                $segment->update(['member_count' => $activeMemberCount]);
                $updated++;
            }
        }

        Log::info('Segment memberships recomputed', [
            'total_segments' => $segments->count(),
            'updated' => $updated,
        ]);
    }
}
