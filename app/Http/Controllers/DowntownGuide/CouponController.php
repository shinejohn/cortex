<?php

declare(strict_types=1);

namespace App\Http\Controllers\DowntownGuide;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Coupon;
use App\Services\CouponService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class CouponController extends Controller
{
    public function __construct(
        private readonly CouponService $couponService
    ) {}

    /**
     * Display coupons/deals listing
     */
    public function index(Request $request): Response
    {
        $filters = [
            'business_id' => $request->input('business_id'),
            'category' => $request->input('category'),
        ];

        $coupons = $this->couponService->getActiveCoupons($filters, 20);

        // Separate deals from coupons
        $deals = $coupons->filter(fn ($c) => 
            !in_array($c->discount_type, ['percentage', 'fixed'])
        );
        $regularCoupons = $coupons->filter(fn ($c) => 
            in_array($c->discount_type, ['percentage', 'fixed'])
        );

        return Inertia::render('downtown-guide/coupons/index', [
            'coupons' => $regularCoupons,
            'deals' => $deals,
            'filters' => $request->only(['business_id', 'category']),
            'platform' => 'downtownsguide',
        ]);
    }

    /**
     * Display a single coupon/deal
     */
    public function show(Request $request, Coupon $coupon): Response
    {
        $coupon->load(['business', 'regions']);

        // Track view
        $this->couponService->trackView($coupon);

        // Get related coupons from same business
        $relatedCoupons = $this->couponService->getCouponsForBusiness(
            $coupon->business,
            true
        )->filter(fn ($c) => $c->id !== $coupon->id)->take(4);

        return Inertia::render('downtown-guide/coupons/show', [
            'coupon' => $coupon,
            'relatedCoupons' => $relatedCoupons,
            'platform' => 'downtownsguide',
        ]);
    }

    /**
     * Apply/use a coupon
     */
    public function apply(Request $request, Coupon $coupon): \Illuminate\Http\JsonResponse
    {
        $validation = $this->couponService->validate($coupon->code, $request->user()?->id);

        if (!$validation['valid']) {
            return response()->json([
                'error' => $validation['error'],
            ], 422);
        }

        // Track click
        $this->couponService->trackClick($coupon);

        // Apply coupon if user is authenticated
        if ($request->user()) {
            try {
                $usage = $this->couponService->apply($coupon, $request->user()->id);
                return response()->json([
                    'message' => 'Coupon applied successfully!',
                    'coupon' => [
                        'code' => $coupon->code,
                        'discount_type' => $coupon->discount_type,
                        'discount_value' => $coupon->discount_value,
                        'terms' => $coupon->terms,
                    ],
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'error' => $e->getMessage(),
                ], 422);
            }
        }

        return response()->json([
            'message' => 'Coupon code ready to use!',
            'coupon' => [
                'code' => $coupon->code,
                'discount_type' => $coupon->discount_type,
                'discount_value' => $coupon->discount_value,
                'terms' => $coupon->terms,
            ],
        ]);
    }
}

