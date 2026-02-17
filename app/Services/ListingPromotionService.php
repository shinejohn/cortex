<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ListingPromotion;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

final class ListingPromotionService
{
    public function isHeadlinerAvailable(string $promotableType, ?string $communityId, Carbon $startDate, Carbon $endDate): bool
    {
        return ! ListingPromotion::where('promotable_type', $promotableType)
            ->headliner()
            ->forCommunity($communityId)
            ->currentlyActive()
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    ->orWhere(function ($q2) use ($startDate, $endDate) {
                        $q2->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $endDate);
                    });
            })
            ->exists();
    }

    public function purchasePromotion(
        Model $promotable,
        string $tier,
        ?string $communityId,
        Carbon $startDate,
        Carbon $endDate,
        \App\Models\User $purchaser,
        string $stripePaymentId
    ): ListingPromotion {
        return ListingPromotion::create([
            'promotable_type' => get_class($promotable),
            'promotable_id' => $promotable->id,
            'tier' => $tier,
            'community_id' => $communityId,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'price_paid' => 0,
            'purchased_by' => $purchaser->id,
            'status' => 'active',
            'stripe_payment_id' => $stripePaymentId,
        ]);
    }

    /**
     * @return array{headliner: Model|null, priority: Collection, premium: Collection, basic: \Illuminate\Contracts\Pagination\LengthAwarePaginator}
     */
    public function getTieredListings(
        string $modelClass,
        ?string $communityId,
        Builder $baseQuery,
        int $priorityLimit = 4,
        int $perPage = 20
    ): array {
        $today = now()->toDateString();

        $headlinerPromo = ListingPromotion::where('promotable_type', $modelClass)
            ->headliner()
            ->forCommunity($communityId)
            ->active()
            ->currentlyActive()
            ->first();

        $headliner = $headlinerPromo?->promotable;

        $priorityPromoIds = ListingPromotion::where('promotable_type', $modelClass)
            ->priority()
            ->forCommunity($communityId)
            ->active()
            ->currentlyActive()
            ->pluck('promotable_id');

        $priority = $priorityPromoIds->isNotEmpty()
            ? $modelClass::whereIn('id', $priorityPromoIds)->limit($priorityLimit)->get()
            : collect();

        $excludeIds = $priorityPromoIds->merge($headliner ? [$headliner->id] : []);

        $premium = collect();

        $allExcludeIds = $excludeIds->merge($premium->pluck('id'));
        $basic = (clone $baseQuery)
            ->whereNotIn('id', $allExcludeIds)
            ->paginate($perPage);

        return [
            'headliner' => $headliner,
            'priority' => $priority,
            'premium' => $premium,
            'basic' => $basic,
        ];
    }
}
