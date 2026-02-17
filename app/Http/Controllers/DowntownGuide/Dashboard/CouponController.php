<?php

declare(strict_types=1);

namespace App\Http\Controllers\DowntownGuide\Dashboard;

use App\Http\Controllers\Controller;
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
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $business = $user->business;

        if (! $business) {
            return Inertia::render('downtown-guide/dashboard/business/create');
        }

        $coupons = $this->couponService->getCouponsForBusiness($business, false); // false for include inactive

        return Inertia::render('downtown-guide/dashboard/coupons/index', [
            'coupons' => $coupons,
            'business' => $business,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('downtown-guide/dashboard/coupons/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $user = $request->user();
        $business = $user->business;

        if (! $business) {
            abort(403, 'No business associated with user.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'code' => 'required|string|max:50|unique:coupons,code',
            'discount_type' => 'required|in:percentage,fixed,offer',
            'discount_value' => 'nullable|numeric',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after_or_equal:valid_from',
            'usage_limit' => 'nullable|integer|min:0',
            'terms' => 'nullable|string',
        ]);

        $validated['business_id'] = $business->id;
        $this->couponService->create($validated, $user->id);

        return redirect()->route('downtown-guide.dashboard.coupons.index')
            ->with('success', 'Coupon created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Coupon $coupon): Response
    {
        // Add authorization check here (policy)

        return Inertia::render('downtown-guide/dashboard/coupons/edit', [
            'coupon' => $coupon,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Coupon $coupon): \Illuminate\Http\RedirectResponse
    {
        // Add authorization check here

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            // Code uniqueness check ignoring current coupon
            'code' => 'required|string|max:50|unique:coupons,code,'.$coupon->id,
            'discount_type' => 'required|in:percentage,fixed,offer',
            'discount_value' => 'nullable|numeric',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after_or_equal:valid_from',
            'usage_limit' => 'nullable|integer|min:0',
            'terms' => 'nullable|string',
            'status' => 'required|in:active,inactive,expired',
        ]);

        $this->couponService->update($coupon, $validated);

        return redirect()->route('downtown-guide.dashboard.coupons.index')
            ->with('success', 'Coupon updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Coupon $coupon): \Illuminate\Http\RedirectResponse
    {
        // Add authorization check here

        $this->couponService->delete($coupon);

        return redirect()->route('downtown-guide.dashboard.coupons.index')
            ->with('success', 'Coupon deleted successfully.');
    }
}
