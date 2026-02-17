<?php

declare(strict_types=1);

namespace App\Services\EventCity;

use App\Models\Performer;

final class ConversionFunnelService
{
    /**
     * Get funnel metrics for a performer
     */
    public function getFunnelMetrics(Performer $performer): array
    {
        $fans = $performer->fans();

        return [
            'total_fans' => $fans->count(),
            'converted_fans' => $fans->converted()->count(),
            'unconverted_fans' => $fans->unconverted()->count(),
            'conversion_rate' => $fans->count() > 0
                ? round($fans->converted()->count() / $fans->count() * 100, 1)
                : 0,
            'fans_by_source' => $performer->fans()
                ->selectRaw('source, count(*) as count')
                ->groupBy('source')
                ->pluck('count', 'source')
                ->toArray(),
            'tipping_fans' => $performer->fans()->where('tip_count', '>', 0)->count(),
            'tipping_rate' => $fans->count() > 0
                ? round($performer->fans()->where('tip_count', '>', 0)->count() / $fans->count() * 100, 1)
                : 0,
        ];
    }

    /**
     * Get top referral sources for a performer
     */
    public function getTopReferralSources(Performer $performer): array
    {
        return $performer->fans()
            ->selectRaw('source, count(*) as fan_count, sum(total_tips_given_cents) as total_revenue')
            ->groupBy('source')
            ->orderByDesc('fan_count')
            ->get()
            ->toArray();
    }
}
