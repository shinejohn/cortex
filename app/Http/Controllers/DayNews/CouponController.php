<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Http\Requests\DayNews\StoreCouponRequest;
use App\Http\Requests\DayNews\UpdateCouponRequest;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class CouponController extends Controller
{
    public function __construct(
        private readonly \App\Services\CouponService $couponService
    ) {}

    /**
     * Display coupons listing
     */
    public function index(Request $request): Response
    {
        $currentRegion = $request->attributes->get('detected_region');
        $search = $request->get('search', '');
        $businessId = $request->get('business_id');

        // Use shared CouponService
        $filters = [
            'region_id' => $currentRegion?->id,
            'business_id' => $businessId,
        ];

        $coupons = $this->couponService->getActiveCoupons($filters, 20);

        // Filter by search if provided
        if ($search) {
            $coupons = $coupons->filter(function ($coupon) use ($search) {
                return stripos($coupon->title, $search) !== false
                    || stripos($coupon->description ?? '', $search) !== false
                    || stripos($coupon->business_name ?? '', $search) !== false;
            });
        }

        // Paginate manually since getActiveCoupons returns Collection
        $perPage = 20;
        $currentPage = (int) $request->get('page', 1);
        $items = $coupons->slice(($currentPage - 1) * $perPage, $perPage);
        $total = $coupons->count();

        return Inertia::render('day-news/coupons/index', [
            'coupons' => [
                'data' => $items->map(fn ($coupon) => [
                'id' => $coupon->id,
                'title' => $coupon->title,
                'description' => $coupon->description,
                'discount_type' => $coupon->discount_type,
                'discount_value' => $coupon->discount_value,
                'terms' => $coupon->terms,
                'code' => $coupon->code,
                'image' => $coupon->image,
                'business_name' => $coupon->business_name,
                'business_location' => $coupon->business_location,
                'start_date' => $coupon->start_date->toDateString(),
                'end_date' => $coupon->end_date->toDateString(),
                'usage_limit' => $coupon->usage_limit,
                'used_count' => $coupon->used_count,
                'views_count' => $coupon->views_count,
                'clicks_count' => $coupon->clicks_count,
                'business' => $coupon->business ? [
                    'id' => $coupon->business->id,
                    'name' => $coupon->business->name,
                ] : null,
                'regions' => $coupon->regions->map(fn ($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                ]),
                ])->values(),
                'current_page' => $currentPage,
                'last_page' => (int) ceil($total / $perPage),
                'per_page' => $perPage,
                'total' => $total,
            ],
            'filters' => [
                'search' => $search,
                'business_id' => $businessId,
            ],
            'currentRegion' => $currentRegion,
        ]);
    }

    /**
     * Show coupon creation form
     */
    public function create(): Response
    {
        return Inertia::render('day-news/coupons/create');
    }

    /**
     * Store new coupon
     */
    public function store(StoreCouponRequest $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();
        $currentRegion = $request->attributes->get('detected_region');

        // Prepare data for CouponService
        $couponData = [
            'business_id' => $validated['business_id'] ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'discount_type' => $validated['discount_type'],
            'discount_value' => $validated['discount_value'] ?? null,
            'terms' => $validated['terms'] ?? null,
            'code' => $validated['code'] ?? null,
            'business_name' => $validated['business_name'],
            'business_location' => $validated['business_location'] ?? null,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'usage_limit' => $validated['usage_limit'] ?? null,
            'status' => 'active', // Coupons are free to publish
        ];

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('coupons', 'public');
            $couponData['image'] = $path;
        }

        // Attach regions
        if (!empty($validated['region_ids'])) {
            $couponData['regions'] = $validated['region_ids'];
        } elseif ($currentRegion) {
            $couponData['regions'] = [$currentRegion->id];
        }

        // Use CouponService to create
        $coupon = $this->couponService->create($couponData, $request->user()->id);

        return redirect()
            ->route('day-news.coupons.show', $coupon->id)
            ->with('success', 'Coupon published successfully!');
    }

    /**
     * Display single coupon
     */
    public function show(Request $request, Coupon $coupon): Response
    {
        $coupon->load(['business', 'regions']);
        
        // Track view using CouponService
        $this->couponService->trackView($coupon);

        // Get related coupons using CouponService
        $relatedFilters = [
            'region_id' => $coupon->regions->first()?->id,
        ];
        $allRelated = $this->couponService->getActiveCoupons($relatedFilters, 10);
        $related = $allRelated->filter(fn ($c) => $c->id !== $coupon->id)->take(6);

        return Inertia::render('day-news/coupons/show', [
            'coupon' => [
                'id' => $coupon->id,
                'title' => $coupon->title,
                'description' => $coupon->description,
                'discount_type' => $coupon->discount_type,
                'discount_value' => $coupon->discount_value,
                'terms' => $coupon->terms,
                'code' => $coupon->code,
                'image' => $coupon->image,
                'business_name' => $coupon->business_name,
                'business_location' => $coupon->business_location,
                'start_date' => $coupon->start_date->toDateString(),
                'end_date' => $coupon->end_date->toDateString(),
                'usage_limit' => $coupon->usage_limit,
                'used_count' => $coupon->used_count,
                'views_count' => $coupon->views_count,
                'clicks_count' => $coupon->clicks_count,
                'business' => $coupon->business ? [
                    'id' => $coupon->business->id,
                    'name' => $coupon->business->name,
                ] : null,
                'regions' => $coupon->regions->map(fn ($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                ]),
            ],
            'related' => $related->map(fn ($item) => [
                'id' => $item->id,
                'title' => $item->title,
                'description' => $item->description,
            ]),
        ]);
    }

    /**
     * Record coupon usage (click/use)
     */
    public function use(Request $request, Coupon $coupon): \Illuminate\Http\JsonResponse
    {
        // Validate coupon using CouponService
        $validation = $this->couponService->validate($coupon->code, $request->user()?->id);
        
        if (!$validation['valid']) {
            return response()->json([
                'error' => $validation['error'],
            ], 422);
        }

        // Track click using CouponService
        $this->couponService->trackClick($coupon);

        // Record usage if user is authenticated
        if ($request->user()) {
            try {
                $this->couponService->apply($coupon, $request->user()->id);
            } catch (\Exception $e) {
                return response()->json([
                    'error' => $e->getMessage(),
                ], 422);
            }
        }

        return response()->json([
            'message' => 'Coupon usage recorded',
            'coupon' => [
                'code' => $coupon->code,
                'discount_type' => $coupon->discount_type,
                'discount_value' => $coupon->discount_value,
                'terms' => $coupon->terms,
            ],
        ]);
    }

    /**
     * Show edit form
     */
    public function edit(Coupon $coupon): Response
    {
        $this->authorize('update', $coupon);

        $coupon->load(['regions']);

        return Inertia::render('day-news/coupons/edit', [
            'coupon' => $coupon,
        ]);
    }

    /**
     * Update coupon
     */
    public function update(UpdateCouponRequest $request, Coupon $coupon): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('coupons', 'public');
            $validated['image'] = $path;
        }

        // Update regions if provided
        if (isset($validated['region_ids'])) {
            $validated['regions'] = $validated['region_ids'];
            unset($validated['region_ids']);
        }

        // Use CouponService to update
        $this->couponService->update($coupon, $validated);

        return redirect()
            ->route('day-news.coupons.show', $coupon->id)
            ->with('success', 'Coupon updated successfully!');
    }

    /**
     * Delete coupon
     */
    public function destroy(Coupon $coupon): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('delete', $coupon);

        $coupon->delete();

        return redirect()
            ->route('day-news.coupons.index')
            ->with('success', 'Coupon deleted successfully!');
    }
}

