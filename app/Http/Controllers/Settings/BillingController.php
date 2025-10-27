<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\StripeConnectService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

final class BillingController extends Controller
{
    public function __construct(
        private StripeConnectService $stripeService
    ) {}

    /**
     * Show the billing/payouts page
     */
    public function show(Request $request): Response
    {
        $workspace = $request->user()->currentWorkspace;

        return Inertia::render('event-city/settings/workspace/billing', [
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'stripe_connect_id' => $workspace->stripe_connect_id,
                'stripe_charges_enabled' => $workspace->stripe_charges_enabled,
                'stripe_payouts_enabled' => $workspace->stripe_payouts_enabled,
                'stripe_admin_approved' => $workspace->stripe_admin_approved,
                'can_accept_payments' => $workspace->canAcceptPayments(),
            ],
            'canManage' => $workspace->owner->id === $request->user()->id,
        ]);
    }

    /**
     * Start Stripe Connect onboarding
     */
    public function connectStripe(Request $request): JsonResponse
    {
        $workspace = $request->user()->currentWorkspace;

        Log::info('Stripe Connect: Starting onboarding', [
            'workspace_id' => $workspace->id,
            'has_stripe_id' => ! empty($workspace->stripe_connect_id),
            'stripe_id' => $workspace->stripe_connect_id,
        ]);

        try {
            // Create onboarding session - Stripe will handle account creation
            Log::info('Stripe Connect: Creating onboarding session', [
                'workspace_id' => $workspace->id,
                'workspace_name' => $workspace->name,
            ]);

            $onboardingUrl = $this->stripeService->createOnboardingSession(
                $workspace,
                route('settings.workspace.billing.stripe-refresh'),
                route('settings.workspace.billing.stripe-return')
            );

            Log::info('Stripe Connect: Onboarding session created', [
                'workspace_id' => $workspace->id,
            ]);

            return response()->json([
                'url' => $onboardingUrl,
            ]);
        } catch (Exception $e) {
            Log::error('Stripe Connect: Failed to start onboarding', [
                'workspace_id' => $workspace->id,
                'error' => $e->getMessage(),
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            $errorMessage = $e->getMessage();

            // Provide helpful error messages for common Stripe issues
            if (str_contains($errorMessage, 'Please review the responsibilities')) {
                $errorMessage = 'Please configure your Stripe Connect platform settings at https://dashboard.stripe.com/settings/connect/platform-profile before setting up payments.';
            } elseif (str_contains($errorMessage, 'Not a valid URL')) {
                $errorMessage = 'Invalid URL. Please ensure your APP_URL is set to a valid public URL (not localhost) in production.';
            }

            return response()->json([
                'error' => 'Failed to start Stripe Connect onboarding: '.$errorMessage,
            ], 500);
        }
    }

    /**
     * Handle Stripe Connect onboarding return
     */
    public function stripeReturn(Request $request): RedirectResponse
    {
        $workspace = $request->user()->currentWorkspace;

        Log::info('Stripe Connect: Return callback received', [
            'workspace_id' => $workspace->id,
            'is_authenticated' => $request->user() !== null,
            'stripe_connect_id' => $workspace->stripe_connect_id,
        ]);

        // Retrieve and store account ID from Stripe session if not already stored
        try {
            $this->stripeService->handleOnboardingReturn($workspace);

            Log::info('Stripe Connect: Onboarding return handled', [
                'workspace_id' => $workspace->id,
                'stripe_connect_id' => $workspace->fresh()->stripe_connect_id,
                'can_accept_payments' => $workspace->fresh()->canAcceptPayments(),
            ]);
        } catch (Exception $e) {
            Log::error('Stripe Connect: Failed to handle onboarding return', [
                'workspace_id' => $workspace->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->route('settings.workspace.billing')
                ->with('error', 'Failed to complete Stripe setup. Please try again.');
        }

        $workspace = $workspace->fresh();

        if ($workspace->canAcceptPayments()) {
            return redirect()->route('settings.workspace.billing')
                ->with('success', 'Stripe Connect setup completed! You can now accept payments.');
        }

        return redirect()->route('settings.workspace.billing')
            ->with('info', 'Please complete additional requirements to start accepting payments.');
    }

    /**
     * Handle Stripe Connect onboarding refresh
     */
    public function stripeRefresh(Request $request): RedirectResponse
    {
        $workspace = $request->user()->currentWorkspace;

        try {
            $onboardingUrl = $this->stripeService->createOnboardingSession(
                $workspace,
                route('settings.workspace.billing.stripe-refresh'),
                route('settings.workspace.billing.stripe-return')
            );

            return redirect($onboardingUrl);
        } catch (Exception $e) {
            return redirect()->route('settings.workspace.billing')
                ->with('error', 'Failed to refresh onboarding: '.$e->getMessage());
        }
    }

    /**
     * Get Stripe dashboard link
     */
    public function stripeDashboard(Request $request): JsonResponse
    {
        $workspace = $request->user()->currentWorkspace;

        try {
            $url = $this->stripeService->createDashboardLink($workspace);

            return response()->json([
                'url' => $url,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to open Stripe dashboard: '.$e->getMessage(),
            ], 500);
        }
    }
}
