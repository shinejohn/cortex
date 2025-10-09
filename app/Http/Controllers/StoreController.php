<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreStoreRequest;
use App\Http\Requests\UpdateStoreRequest;
use App\Models\Store;
use App\Services\StripeConnectService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Log;

final class StoreController extends Controller
{
    public function __construct(
        private StripeConnectService $stripeService
    ) {}

    /**
     * Display a listing of approved stores (public)
     */
    public function index(Request $request): Response
    {
        $query = Store::where('status', 'approved')
            ->with(['workspace', 'products' => fn ($q) => $q->where('is_active', true)->limit(4)]);

        // Apply search filter
        if ($request->filled('search')) {
            $query->where('name', 'ilike', '%'.$request->search.'%');
        }

        $stores = $query->latest('approved_at')
            ->paginate(12)
            ->through(fn ($store) => [
                'id' => $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
                'description' => $store->description,
                'logo' => $store->logo,
                'banner' => $store->banner,
                'products_count' => $store->products()->where('is_active', true)->count(),
                'products' => $store->products->map(fn ($product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'images' => $product->images,
                ]),
            ]);

        return Inertia::render('stores/index', [
            'stores' => $stores,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Display workspace's stores
     */
    public function myStores(Request $request): Response
    {
        $workspace = $request->user()->currentWorkspace;

        if (! $workspace) {
            abort(403, 'No workspace selected');
        }

        $stores = Store::where('workspace_id', $workspace->id)
            ->withCount('products', 'orders')
            ->latest()
            ->get()
            ->map(fn ($store) => [
                'id' => $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
                'description' => $store->description,
                'logo' => $store->logo,
                'status' => $store->status,
                'can_accept_payments' => $store->canAcceptPayments(),
                'products_count' => $store->products_count,
                'orders_count' => $store->orders_count,
                'created_at' => $store->created_at,
            ]);

        return Inertia::render('stores/my-stores', [
            'stores' => $stores,
        ]);
    }

    /**
     * Show the form for creating a new store
     */
    public function create(): Response
    {
        return Inertia::render('stores/create');
    }

    /**
     * Store a newly created store
     */
    public function store(StoreStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // Handle file uploads
        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('stores/logos', 'public');
        }

        if ($request->hasFile('banner')) {
            $data['banner'] = $request->file('banner')->store('stores/banners', 'public');
        }

        $store = Store::create($data);

        return redirect()->route('stores.show', $store->slug)
            ->with('success', 'Store created successfully! Please complete Stripe Connect onboarding to start selling.');
    }

    /**
     * Display the specified store
     */
    public function show(Request $request, string $slug): Response
    {
        $store = Store::where('slug', $slug)
            ->with(['workspace'])
            ->firstOrFail();

        // Only show approved stores to non-owners
        if ($store->status !== 'approved' && ! $request->user()?->isMemberOfWorkspace($store->workspace_id)) {
            abort(403, 'Store is not available');
        }

        $products = $store->products()
            ->where('is_active', true)
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'ilike', '%'.$request->search.'%'))
            ->when($request->filled('sort'), function ($q) use ($request) {
                match ($request->sort) {
                    'price_asc' => $q->orderBy('price', 'asc'),
                    'price_desc' => $q->orderBy('price', 'desc'),
                    'newest' => $q->latest(),
                    default => $q->latest(),
                };
            })
            ->paginate(12)
            ->through(fn ($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => $product->price,
                'compare_at_price' => $product->compare_at_price,
                'images' => $product->images,
                'is_in_stock' => $product->isInStock(),
                'discount_percentage' => $product->discount_percentage,
            ]);

        $isOwner = $request->user()?->isMemberOfWorkspace($store->workspace_id) ?? false;

        return Inertia::render('stores/show', [
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
                'description' => $store->description,
                'logo' => $store->logo,
                'banner' => $store->banner,
                'is_owner' => $isOwner,
                'stripe_connect_id' => $isOwner ? $store->workspace->stripe_connect_id : null,
                'can_accept_payments' => $isOwner ? $store->canAcceptPayments() : null,
            ],
            'products' => $products,
            'filters' => $request->only('search', 'sort'),
        ]);
    }

    /**
     * Show the form for editing the specified store
     */
    public function edit(Request $request, Store $store): Response
    {
        if (! $request->user()->isMemberOfWorkspace($store->workspace_id)) {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('stores/edit', [
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'description' => $store->description,
                'logo' => $store->logo,
                'banner' => $store->banner,
                'status' => $store->status,
            ],
        ]);
    }

    /**
     * Update the specified store
     */
    public function update(UpdateStoreRequest $request, Store $store): RedirectResponse
    {
        if (! $request->user()->isMemberOfWorkspace($store->workspace_id)) {
            abort(403, 'Unauthorized');
        }

        $data = $request->validated();

        // Handle file uploads
        if ($request->hasFile('logo')) {
            if ($store->logo) {
                Storage::disk('public')->delete($store->logo);
            }
            $data['logo'] = $request->file('logo')->store('stores/logos', 'public');
        }

        if ($request->hasFile('banner')) {
            if ($store->banner) {
                Storage::disk('public')->delete($store->banner);
            }
            $data['banner'] = $request->file('banner')->store('stores/banners', 'public');
        }

        $store->update($data);

        return redirect()->route('stores.show', $store->slug)
            ->with('success', 'Store updated successfully!');
    }

    /**
     * Start Stripe Connect onboarding
     */
    public function connectStripe(Request $request, Store $store): RedirectResponse
    {
        if (! $request->user()->isMemberOfWorkspace($store->workspace_id)) {
            abort(403, 'Unauthorized');
        }

        $workspace = $store->workspace;

        Log::info('Stripe Connect: Starting onboarding', [
            'store_id' => $store->id,
            'workspace_id' => $workspace->id,
            'has_stripe_id' => ! empty($workspace->stripe_connect_id),
            'stripe_id' => $workspace->stripe_connect_id,
        ]);

        try {
            // Create Stripe Connect account if it doesn't exist or verify existing account
            if (! $workspace->stripe_connect_id) {
                Log::info('Stripe Connect: Creating new account', ['workspace_id' => $workspace->id]);
                $this->stripeService->createConnectAccount($workspace);
                Log::info('Stripe Connect: Account created', [
                    'workspace_id' => $workspace->id,
                    'stripe_id' => $workspace->stripe_connect_id,
                ]);
            } else {
                // Verify the account still exists in Stripe
                try {
                    Log::info('Stripe Connect: Verifying existing account', [
                        'workspace_id' => $workspace->id,
                        'stripe_id' => $workspace->stripe_connect_id,
                    ]);
                    $this->stripeService->getAccount($workspace->stripe_connect_id);
                    Log::info('Stripe Connect: Account verified', ['stripe_id' => $workspace->stripe_connect_id]);
                } catch (Exception $e) {
                    // Account doesn't exist, create a new one
                    Log::warning('Stripe Connect: Account verification failed, creating new account', [
                        'workspace_id' => $workspace->id,
                        'old_stripe_id' => $workspace->stripe_connect_id,
                        'error' => $e->getMessage(),
                    ]);
                    $this->stripeService->createConnectAccount($workspace);
                    Log::info('Stripe Connect: Account recreated', [
                        'workspace_id' => $workspace->id,
                        'new_stripe_id' => $workspace->stripe_connect_id,
                    ]);
                }
            }

            // Create account link for onboarding
            Log::info('Stripe Connect: Creating account link', [
                'workspace_id' => $workspace->id,
                'stripe_id' => $workspace->stripe_connect_id,
                'refresh_url' => route('stores.connect-refresh', $store),
                'return_url' => route('stores.connect-return', $store),
            ]);

            $accountLink = $this->stripeService->createAccountLink(
                $workspace,
                route('stores.connect-refresh', $store),
                route('stores.connect-return', $store)
            );

            Log::info('Stripe Connect: Account link created', [
                'workspace_id' => $workspace->id,
                'link_url' => $accountLink->url,
                'expires_at' => $accountLink->expires_at,
            ]);

            return redirect($accountLink->url);
        } catch (Exception $e) {
            Log::error('Stripe Connect: Failed to start onboarding', [
                'workspace_id' => $workspace->id,
                'error' => $e->getMessage(),
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            $errorMessage = $e->getMessage();

            // Provide helpful error messages for common Stripe issues
            if (str_contains($errorMessage, 'Please review the responsibilities')) {
                $errorMessage = 'Please configure your Stripe Connect platform settings at https://dashboard.stripe.com/settings/connect/platform-profile before setting up stores.';
            } elseif (str_contains($errorMessage, 'No such account')) {
                $errorMessage = 'Stripe account not found. Please try again.';
            } elseif (str_contains($errorMessage, 'Not a valid URL')) {
                $errorMessage = 'Invalid store URL. Please ensure your APP_URL is set to a valid public URL (not localhost) in production.';
            }

            return redirect()->back()
                ->with('error', 'Failed to start Stripe Connect onboarding: '.$errorMessage);
        }
    }

    /**
     * Handle Stripe Connect onboarding return
     */
    public function connectReturn(Request $request, Store $store): RedirectResponse
    {
        $workspace = $store->workspace;

        Log::info('Stripe Connect: Return callback received', [
            'store_id' => $store->id,
            'workspace_id' => $workspace->id,
            'user_id' => $request->user()?->id,
            'is_authenticated' => $request->user() !== null,
        ]);

        // Update workspace capabilities
        $this->stripeService->updateWorkspaceCapabilities($workspace);

        Log::info('Stripe Connect: Capabilities updated', [
            'workspace_id' => $workspace->id,
            'can_accept_payments' => $workspace->canAcceptPayments(),
            'charges_enabled' => $workspace->stripe_charges_enabled,
            'payouts_enabled' => $workspace->stripe_payouts_enabled,
        ]);

        // Check if Stripe setup is complete
        $stripeSetupComplete = $workspace->stripe_charges_enabled && $workspace->stripe_payouts_enabled;

        if ($store->canAcceptPayments()) {
            return redirect()->route('stores.show', $store->slug)
                ->with('success', 'Stripe Connect setup completed! You can now accept payments.');
        }

        // If Stripe is set up but store isn't approved, show awaiting approval message
        if ($stripeSetupComplete && $store->isPending()) {
            return redirect()->route('stores.show', $store->slug)
                ->with('info', 'Stripe Connect setup completed! Your store is awaiting admin approval before you can start accepting payments.');
        }

        return redirect()->route('stores.show', $store->slug)
            ->with('info', 'Please complete additional requirements to start accepting payments.');
    }

    /**
     * Handle Stripe Connect onboarding refresh
     */
    public function connectRefresh(Request $request, Store $store): RedirectResponse
    {
        try {
            $accountLink = $this->stripeService->createAccountLink(
                $store->workspace,
                route('stores.connect-refresh', $store),
                route('stores.connect-return', $store)
            );

            return redirect($accountLink->url);
        } catch (Exception $e) {
            return redirect()->route('stores.show', $store->slug)
                ->with('error', 'Failed to refresh onboarding: '.$e->getMessage());
        }
    }

    /**
     * Get Stripe dashboard link
     */
    public function stripeDashboard(Request $request, Store $store): RedirectResponse
    {
        if (! $request->user()->isMemberOfWorkspace($store->workspace_id)) {
            abort(403, 'Unauthorized');
        }

        try {
            $url = $this->stripeService->createDashboardLink($store->workspace);

            return redirect($url);
        } catch (Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to open Stripe dashboard: '.$e->getMessage());
        }
    }
}
