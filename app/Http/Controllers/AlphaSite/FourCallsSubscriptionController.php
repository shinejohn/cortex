<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Services\AlphaSite\FourCallsBillingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Controller for managing 4calls.ai service subscriptions
 */
final class FourCallsSubscriptionController extends Controller
{
    public function __construct(
        private readonly FourCallsBillingService $billingService
    ) {
        $this->middleware('auth');
    }

    /**
     * Subscribe to a 4calls.ai service package
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'business_id' => 'required|uuid|exists:businesses,id',
            'package_slug' => 'required|string|in:ai_receptionist,ai_sales,ai_business_suite,ai_enterprise',
            'payment_method_id' => 'required|string',
            'email' => 'nullable|email',
        ]);

        $business = Business::findOrFail($request->input('business_id'));
        
        // Verify user owns this business
        if ($business->claimed_by_id !== $request->user()->id) {
            abort(403, 'You do not own this business');
        }

        try {
            $result = $this->billingService->subscribe(
                $business,
                $request->input('package_slug'),
                $request->input('payment_method_id'),
                $request->input('email')
            );

            return response()->json([
                'success' => true,
                'subscription' => $result,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to subscribe to 4calls.ai service', [
                'business_id' => $business->id,
                'package' => $request->input('package_slug'),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Change subscription package
     */
    public function changePackage(Request $request)
    {
        $request->validate([
            'business_id' => 'required|uuid|exists:businesses,id',
            'package_slug' => 'required|string|in:ai_receptionist,ai_sales,ai_business_suite,ai_enterprise',
            'payment_method_id' => 'nullable|string',
        ]);

        $business = Business::findOrFail($request->input('business_id'));
        
        if ($business->claimed_by_id !== $request->user()->id) {
            abort(403, 'You do not own this business');
        }

        try {
            $result = $this->billingService->changePackage(
                $business,
                $request->input('package_slug'),
                $request->input('payment_method_id')
            );

            return response()->json([
                'success' => true,
                'subscription' => $result,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to change 4calls.ai package', [
                'business_id' => $business->id,
                'package' => $request->input('package_slug'),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Cancel subscription
     */
    public function cancel(Request $request)
    {
        $request->validate([
            'business_id' => 'required|uuid|exists:businesses,id',
            'immediate' => 'nullable|boolean',
        ]);

        $business = Business::findOrFail($request->input('business_id'));
        
        if ($business->claimed_by_id !== $request->user()->id) {
            abort(403, 'You do not own this business');
        }

        try {
            $result = $this->billingService->cancel(
                $business,
                $request->boolean('immediate', false)
            );

            return response()->json([
                'success' => $result,
                'message' => $result 
                    ? 'Subscription cancelled successfully' 
                    : 'Failed to cancel subscription',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to cancel 4calls.ai subscription', [
                'business_id' => $business->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Resume subscription
     */
    public function resume(Request $request)
    {
        $request->validate([
            'business_id' => 'required|uuid|exists:businesses,id',
        ]);

        $business = Business::findOrFail($request->input('business_id'));
        
        if ($business->claimed_by_id !== $request->user()->id) {
            abort(403, 'You do not own this business');
        }

        try {
            $result = $this->billingService->resume($business);

            return response()->json([
                'success' => $result,
                'message' => $result 
                    ? 'Subscription resumed successfully' 
                    : 'Failed to resume subscription',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to resume 4calls.ai subscription', [
                'business_id' => $business->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get subscription details
     */
    public function show(Request $request, string $businessId)
    {
        $business = Business::findOrFail($businessId);
        
        if ($business->claimed_by_id !== $request->user()->id) {
            abort(403, 'You do not own this business');
        }

        $details = $this->billingService->getSubscriptionDetails($business);

        return response()->json([
            'success' => true,
            'subscription' => $details,
        ]);
    }
}

