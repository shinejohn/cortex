<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\BusinessServiceArea;
use App\Models\City;
use App\Models\County;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class ServiceAreaController extends Controller
{
    /**
     * Show current service areas and available options.
     */
    public function index(Request $request, string $slug): Response
    {
        $business = Business::where('slug', $slug)->firstOrFail();

        abort_unless(
            $business->isClaimed() || $this->ownsBusinessViaWorkspace($request, $business),
            403,
            'You do not have permission to manage this business.'
        );

        $planTier = $business->subscription_tier ?? 'influencer';

        $currentServiceAreas = $business->serviceAreas()
            ->with(['city', 'county'])
            ->orderBy('area_type')
            ->orderBy('created_at', 'desc')
            ->get();

        // Nearby cities not already service areas (within 50 miles)
        $existingCityIds = $currentServiceAreas
            ->where('area_type', BusinessServiceArea::AREA_TYPE_CITY)
            ->pluck('city_id')
            ->filter()
            ->toArray();

        $nearbyCities = collect();
        if ($business->cityRecord && $business->cityRecord->latitude && $business->cityRecord->longitude) {
            $nearbyCities = City::active()
                ->where('id', '!=', $business->city_id)
                ->whereNotIn('id', $existingCityIds)
                ->nearby(
                    (float) $business->cityRecord->latitude,
                    (float) $business->cityRecord->longitude,
                    50
                )
                ->limit(50)
                ->get();
        }

        // Available counties in same state
        $existingCountyIds = $currentServiceAreas
            ->where('area_type', BusinessServiceArea::AREA_TYPE_COUNTY)
            ->pluck('county_id')
            ->filter()
            ->toArray();

        $availableCounties = County::active()
            ->where('state', $business->state)
            ->whereNotIn('id', $existingCountyIds)
            ->orderBy('name')
            ->get();

        // Pricing for current plan
        $pricing = BusinessServiceArea::PRICING[$planTier] ?? BusinessServiceArea::PRICING['influencer'];

        // Monthly total from active service areas
        $monthlyTotal = $currentServiceAreas
            ->where('status', 'active')
            ->sum('monthly_price');

        return Inertia::render('alphasite/admin/service-areas', [
            'business' => $business,
            'planTier' => $planTier,
            'currentServiceAreas' => $currentServiceAreas,
            'nearbyCities' => $nearbyCities,
            'availableCounties' => $availableCounties,
            'pricing' => $pricing,
            'monthlyTotal' => (float) $monthlyTotal,
        ]);
    }

    /**
     * Add a new service area.
     */
    public function store(Request $request, string $slug): RedirectResponse
    {
        $business = Business::where('slug', $slug)->firstOrFail();

        abort_unless(
            $business->isClaimed() || $this->ownsBusinessViaWorkspace($request, $business),
            403
        );

        $validated = $request->validate([
            'area_type' => 'required|in:city,county',
            'city_id' => 'required_if:area_type,city|nullable|exists:cities,id',
            'county_id' => 'required_if:area_type,county|nullable|exists:counties,id',
            'billing_cycle' => 'required|in:monthly,annual',
        ]);

        // Check for duplicates
        $existsQuery = $business->serviceAreas()
            ->where('area_type', $validated['area_type'])
            ->where('status', 'active');

        if ($validated['area_type'] === BusinessServiceArea::AREA_TYPE_CITY) {
            $existsQuery->where('city_id', $validated['city_id']);
        } else {
            $existsQuery->where('county_id', $validated['county_id']);
        }

        if ($existsQuery->exists()) {
            return back()->withErrors(['area_type' => 'This service area is already active.']);
        }

        $planTier = $business->subscription_tier ?? 'influencer';
        $price = BusinessServiceArea::getPriceFor($planTier, $validated['billing_cycle']);

        BusinessServiceArea::create([
            'business_id' => $business->id,
            'area_type' => $validated['area_type'],
            'city_id' => $validated['city_id'] ?? null,
            'county_id' => $validated['county_id'] ?? null,
            'status' => 'active',
            'plan_tier' => $planTier,
            'monthly_price' => $validated['billing_cycle'] === 'annual'
                ? round($price / 12, 2)
                : $price,
            'billing_cycle' => $validated['billing_cycle'],
            'show_in_listings' => true,
            'show_in_search' => true,
            'started_at' => now(),
        ]);

        return back()->with('success', 'Service area added successfully.');
    }

    /**
     * Remove (cancel) a service area.
     */
    public function destroy(Request $request, string $slug, string $id): RedirectResponse
    {
        $business = Business::where('slug', $slug)->firstOrFail();

        abort_unless(
            $business->isClaimed() || $this->ownsBusinessViaWorkspace($request, $business),
            403
        );

        $serviceArea = $business->serviceAreas()->findOrFail($id);

        $serviceArea->update([
            'status' => 'canceled',
            'canceled_at' => now(),
        ]);

        return back()->with('success', 'Service area canceled successfully.');
    }

    /**
     * Check if the current user owns the business via workspace.
     */
    private function ownsBusinessViaWorkspace(Request $request, Business $business): bool
    {
        $user = $request->user();

        if (! $user || ! $business->workspace_id) {
            return false;
        }

        return $user->workspaces()
            ->where('workspaces.id', $business->workspace_id)
            ->exists();
    }
}
