<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Services\BusinessService;
use App\Services\AlphaSite\SubscriptionLifecycleService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

final class ClaimController extends Controller
{
    public function __construct(
        private readonly BusinessService $businessService,
        private readonly SubscriptionLifecycleService $subscriptionService
    ) {}

    /**
     * Start claim process
     */
    public function start(string $slug): Response
    {
        $business = $this->businessService->findBySlug($slug);
        
        if (!$business) {
            abort(404);
        }

        return Inertia::render('alphasite/claim/start', [
            'business' => $business,
        ]);
    }

    /**
     * Verify business ownership
     */
    public function verify(Request $request, string $slug): RedirectResponse
    {
        $business = $this->businessService->findBySlug($slug);
        
        if (!$business) {
            abort(404);
        }

        // TODO: Implement verification logic (phone, email, document)
        $request->validate([
            'verification_method' => 'required|in:phone,email,document',
            'verification_data' => 'required',
        ]);

        // Store verification attempt in session
        $request->session()->put("claim_verification:{$business->id}", [
            'method' => $request->verification_method,
            'data' => $request->verification_data,
            'verified' => false, // TODO: Implement actual verification
        ]);

        return redirect()->route('alphasite.claim.complete', $slug);
    }

    /**
     * Complete claim and subscription
     */
    public function complete(Request $request, string $slug): Response
    {
        $business = $this->businessService->findBySlug($slug);
        
        if (!$business) {
            abort(404);
        }

        $verification = $request->session()->get("claim_verification:{$business->id}");

        if (!$verification || !$verification['verified']) {
            return redirect()->route('alphasite.claim.start', $slug)
                ->with('error', 'Please verify your ownership first.');
        }

        return Inertia::render('alphasite/claim/complete', [
            'business' => $business,
            'subscriptionTiers' => [
                'standard' => ['name' => 'Standard', 'price' => 29.99],
                'premium' => ['name' => 'Premium', 'price' => 79.99],
                'enterprise' => ['name' => 'Enterprise', 'price' => 199.99],
            ],
        ]);
    }

    /**
     * Subscribe after claiming
     */
    public function subscribe(Request $request, string $slug): RedirectResponse
    {
        $business = $this->businessService->findBySlug($slug);
        
        if (!$business) {
            abort(404);
        }

        $request->validate([
            'tier' => 'required|in:standard,premium,enterprise',
            'stripe_subscription_id' => 'required|string',
        ]);

        // Get or create subscription
        $subscription = $business->subscription ?? $this->subscriptionService->initializeTrial($business);
        
        // Convert to paid
        $this->subscriptionService->convertToPaid(
            $subscription,
            $request->tier,
            $request->stripe_subscription_id,
            [] // AI services will be added separately
        );

        return redirect()->route('alphasite.business.show', $slug)
            ->with('success', 'Business claimed successfully!');
    }
}
