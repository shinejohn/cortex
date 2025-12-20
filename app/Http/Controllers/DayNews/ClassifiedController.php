<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Http\Requests\DayNews\StoreClassifiedRequest;
use App\Services\DayNews\ClassifiedService;
use App\Services\DayNewsPaymentService;
use App\Models\Classified;
use App\Models\ClassifiedPayment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class ClassifiedController extends Controller
{
    public function __construct(
        private readonly ClassifiedService $classifiedService,
        private readonly DayNewsPaymentService $paymentService
    ) {}

    /**
     * Display classifieds listing
     */
    public function index(Request $request): Response
    {
        $currentRegion = $request->attributes->get('detected_region');
        $category = $request->get('category', 'all');
        $subcategory = $request->get('subcategory', 'all');
        $search = $request->get('search', '');

        $query = Classified::active()
            ->with(['user', 'images', 'regions'])
            ->orderBy('is_featured', 'desc')
            ->orderBy('posted_at', 'desc');

        // Filter by region
        if ($currentRegion) {
            $query->forRegion($currentRegion->id);
        }

        // Filter by category
        if ($category !== 'all') {
            $query->byCategory($category);
            if ($subcategory !== 'all') {
                $query->where('subcategory', $subcategory);
            }
        }

        // Search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $classifieds = $query->paginate(20)->withQueryString();

        return Inertia::render('day-news/classifieds/index', [
            'classifieds' => $classifieds,
            'filters' => [
                'category' => $category,
                'subcategory' => $subcategory,
                'search' => $search,
            ],
            'currentRegion' => $currentRegion,
        ]);
    }

    /**
     * Show classified creation form
     */
    public function create(): Response
    {
        return Inertia::render('day-news/classifieds/create');
    }

    /**
     * Store new classified (step 1: basic info)
     */
    public function store(StoreClassifiedRequest $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();

        $classified = $this->classifiedService->createListing(
            $validated,
            $request->user()->id,
            $request->user()->currentWorkspace
        );

        return redirect()
            ->route('day-news.classifieds.select-regions', $classified->id)
            ->with('success', 'Listing created! Now select regions.');
    }

    /**
     * Show region selection page
     */
    public function selectRegions(Classified $classified): Response
    {
        $this->authorize('update', $classified);

        $currentRegion = request()->attributes->get('detected_region');
        $regions = \App\Models\Region::where('type', 'city')
            ->orderBy('name')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'type' => $r->type,
                'full_name' => $r->name . ($r->metadata['state'] ?? ''),
            ]);

        return Inertia::render('day-news/classifieds/select-regions', [
            'classified' => [
                'id' => $classified->id,
                'title' => $classified->title,
            ],
            'regions' => $regions,
            'currentRegion' => $currentRegion,
        ]);
    }

    /**
     * Store selected regions and show timeframe selection
     */
    public function storeRegions(Request $request, Classified $classified): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('update', $classified);

        $validated = $request->validate([
            'region_ids' => 'required|array|min:1',
            'region_ids.*' => 'exists:regions,id',
        ]);

        // Store regions temporarily (will be finalized after payment)
        session(['classified_regions_' . $classified->id => $validated['region_ids']]);

        return redirect()
            ->route('day-news.classifieds.select-timeframe', $classified->id);
    }

    /**
     * Show timeframe selection page
     */
    public function selectTimeframe(Classified $classified): Response
    {
        $this->authorize('update', $classified);

        $regionIds = session('classified_regions_' . $classified->id, []);

        // Get region names for display
        $regions = \App\Models\Region::whereIn('id', $regionIds)->get();

        return Inertia::render('day-news/classifieds/select-timeframe', [
            'classified' => [
                'id' => $classified->id,
                'title' => $classified->title,
            ],
            'regionIds' => $regionIds,
            'regions' => $regions->map(fn ($r) => [
                'id' => $r->id,
                'name' => $r->name,
            ]),
        ]);
    }

    /**
     * Store timeframe and proceed to payment
     */
    public function storeTimeframe(Request $request, Classified $classified): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('update', $classified);

        $validated = $request->validate([
            'days' => 'required|integer|min:1|max:90',
        ]);

        $regionIds = session('classified_regions_' . $classified->id, []);
        $regionsData = array_map(fn ($id) => ['region_id' => $id, 'days' => $validated['days']], $regionIds);

        $totalCost = $this->classifiedService->calculateCost($regionsData, $validated['days']);

        // Create payment record
        $payment = ClassifiedPayment::create([
            'classified_id' => $classified->id,
            'workspace_id' => $classified->workspace_id,
            'amount' => $totalCost,
            'status' => 'pending',
            'regions_data' => $regionsData,
            'total_days' => $validated['days'],
        ]);

        // Create Stripe checkout session
        $session = $this->paymentService->createClassifiedCheckoutSession(
            $classified,
            $payment,
            route('day-news.classifieds.payment.success', ['classified' => $classified->id]),
            route('day-news.classifieds.payment.cancel', ['classified' => $classified->id])
        );

        return Inertia::location($session->url);
    }

    /**
     * Display single classified
     */
    public function show(Request $request, Classified $classified): Response
    {
        $classified->load(['user', 'images', 'regions']);
        $classified->incrementViewsCount();

        // Get related classifieds
        $related = Classified::active()
            ->where('id', '!=', $classified->id)
            ->where('category', $classified->category)
            ->whereHas('regions', function ($q) use ($classified) {
                $q->whereIn('region_id', $classified->regions->pluck('id'));
            })
            ->with(['user', 'images'])
            ->limit(6)
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'title' => $item->title,
                'description' => $item->description,
                'price' => $item->price,
                'price_type' => $item->price_type,
                'images' => $item->images->map(fn ($img) => [
                    'id' => $img->id,
                    'image_url' => $img->image_url,
                ]),
            ]);

        return Inertia::render('day-news/classifieds/show', [
            'classified' => [
                'id' => $classified->id,
                'category' => $classified->category,
                'subcategory' => $classified->subcategory,
                'title' => $classified->title,
                'description' => $classified->description,
                'price' => $classified->price,
                'price_type' => $classified->price_type,
                'condition' => $classified->condition,
                'location' => $classified->location,
                'is_featured' => $classified->is_featured,
                'posted_at' => $classified->posted_at?->toISOString(),
                'expires_at' => $classified->expires_at?->toISOString(),
                'views_count' => $classified->views_count,
                'images' => $classified->images->map(fn ($img) => [
                    'id' => $img->id,
                    'image_url' => $img->image_url,
                ]),
                'user' => [
                    'id' => $classified->user->id,
                    'name' => $classified->user->name,
                ],
                'regions' => $classified->regions->map(fn ($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                ]),
            ],
            'related' => $related,
        ]);
    }

    /**
     * Payment success callback
     */
    public function paymentSuccess(Request $request, Classified $classified): \Illuminate\Http\RedirectResponse
    {
        $sessionId = $request->get('session_id');

        if (!$sessionId) {
            return redirect()
                ->route('day-news.classifieds.index')
                ->with('error', 'Invalid payment session');
        }

        $payment = ClassifiedPayment::where('classified_id', $classified->id)
            ->where('stripe_checkout_session_id', $sessionId)
            ->firstOrFail();

        // Verify payment via Stripe
        $classified = $this->paymentService->handleSuccessfulClassifiedPayment($sessionId);
        $payment = $classified->payment;

        if ($payment && $payment->isPaid()) {
            // Activate classified
            $this->classifiedService->activateClassified(
                $classified,
                $payment->regions_data,
                $payment->total_days
            );

            // Clear session data
            session()->forget('classified_regions_' . $classified->id);

            return redirect()
                ->route('day-news.classifieds.confirmation', $classified->id)
                ->with('success', 'Payment successful! Your listing is now active.');
        }

        return redirect()
            ->route('day-news.classifieds.select-timeframe', $classified->id)
            ->with('error', 'Payment not completed. Please try again.');
    }

    /**
     * Payment cancel callback
     */
    public function paymentCancel(Classified $classified): \Illuminate\Http\RedirectResponse
    {
        return redirect()
            ->route('day-news.classifieds.select-timeframe', $classified->id)
            ->with('info', 'Payment cancelled. You can try again.');
    }

    /**
     * Show confirmation page
     */
    public function confirmation(Classified $classified): Response
    {
        $classified->load(['regions', 'payment']);

        return Inertia::render('day-news/classifieds/confirmation', [
            'classified' => [
                'id' => $classified->id,
                'title' => $classified->title,
                'regions' => $classified->regions->map(fn ($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                ]),
                'payment' => $classified->payment ? [
                    'amount' => $classified->payment->amount,
                    'total_days' => $classified->payment->total_days,
                ] : null,
            ],
        ]);
    }
}

