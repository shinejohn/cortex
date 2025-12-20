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
    /**
     * Display coupons listing
     */
    public function index(Request $request): Response
    {
        $currentRegion = $request->attributes->get('detected_region');
        $search = $request->get('search', '');
        $businessId = $request->get('business_id');

        $query = Coupon::active()
            ->with(['business', 'regions'])
            ->orderBy('end_date', 'asc')
            ->orderBy('created_at', 'desc');

        // Filter by region
        if ($currentRegion) {
            $query->forRegion($currentRegion->id);
        }

        // Filter by business
        if ($businessId) {
            $query->byBusiness($businessId);
        }

        // Search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('business_name', 'like', "%{$search}%");
            });
        }

        $coupons = $query->paginate(20)->withQueryString();

        return Inertia::render('day-news/coupons/index', [
            'coupons' => $coupons->through(fn ($coupon) => [
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
            ]),
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

        $coupon = Coupon::create([
            'user_id' => $request->user()->id,
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
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('coupons', 'public');
            $coupon->update(['image' => $path]);
        }

        // Attach regions
        if (!empty($validated['region_ids'])) {
            $coupon->regions()->attach($validated['region_ids']);
        } elseif ($currentRegion = $request->attributes->get('detected_region')) {
            $coupon->regions()->attach($currentRegion->id);
        }

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
        $coupon->incrementViewsCount();

        // Get related coupons
        $related = Coupon::active()
            ->where('id', '!=', $coupon->id)
            ->whereHas('regions', function ($q) use ($coupon) {
                $q->whereIn('region_id', $coupon->regions->pluck('id'));
            })
            ->with(['business', 'regions'])
            ->limit(6)
            ->get();

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
        if (!$coupon->canBeUsed()) {
            return response()->json([
                'error' => 'This coupon is no longer available',
            ], 422);
        }

        $coupon->incrementClicksCount();

        // Record usage if user is authenticated
        if ($request->user()) {
            $coupon->recordUsage($request->user()->id);
        } else {
            $coupon->recordUsage(null, $request->ip());
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

        $coupon->update($validated);

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('coupons', 'public');
            $coupon->update(['image' => $path]);
        }

        // Update regions
        if (isset($validated['region_ids'])) {
            $coupon->regions()->sync($validated['region_ids']);
        }

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

