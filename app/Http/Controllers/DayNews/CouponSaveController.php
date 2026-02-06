<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Services\CouponService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CouponSaveController extends Controller
{
    public function __construct(
        private readonly CouponService $couponService
    ) {}

    /**
     * Save a coupon.
     */
    public function store(Request $request, Coupon $coupon): JsonResponse
    {
        $this->authorize('save', $coupon);

        $this->couponService->saveCoupon($coupon, $request->user());

        $coupon->refresh();

        return response()->json([
            'success' => true,
            'is_saved' => true,
            'saves_count' => $coupon->saves_count,
        ]);
    }

    /**
     * Unsave a coupon.
     */
    public function destroy(Request $request, Coupon $coupon): JsonResponse
    {
        $this->authorize('save', $coupon);

        $this->couponService->unsaveCoupon($coupon, $request->user());

        $coupon->refresh();

        return response()->json([
            'success' => true,
            'is_saved' => false,
            'saves_count' => $coupon->saves_count,
        ]);
    }
}
