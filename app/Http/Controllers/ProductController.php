<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Models\Store;
use App\Services\StripeConnectService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Log;

final class ProductController extends Controller
{
    public function __construct(
        private StripeConnectService $stripeService
    ) {}

    /**
     * Show the ecommerce discovery page with recommended products
     */
    public function discover(Request $request): Response
    {
        // Get random featured products from approved stores
        $featuredProducts = Product::query()
            ->whereHas('store', function ($query) {
                $query->where('status', 'approved');
            })
            ->where('is_active', true)
            ->inRandomOrder()
            ->limit(8)
            ->with(['store'])
            ->get();

        // Get more recommended products
        $recommendedProducts = Product::query()
            ->whereHas('store', function ($query) {
                $query->where('status', 'approved');
            })
            ->where('is_active', true)
            ->inRandomOrder()
            ->limit(12)
            ->with(['store'])
            ->get();

        return Inertia::render('ecommerce/discover', [
            'featuredProducts' => $featuredProducts,
            'recommendedProducts' => $recommendedProducts,
        ]);
    }

    /**
     * Show the form for creating a new product
     */
    public function create(Request $request, Store $store): Response
    {
        if (! $request->user()->isMemberOfWorkspace($store->workspace_id)) {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('products/create', [
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
                'workspace' => [
                    'can_accept_payments' => $store->workspace->canAcceptPayments(),
                ],
            ],
        ]);
    }

    /**
     * Store a newly created product
     */
    public function store(StoreProductRequest $request): RedirectResponse
    {
        $store = Store::findOrFail($request->store_id);

        if (! $request->user()->isMemberOfWorkspace($store->workspace_id)) {
            abort(403, 'Unauthorized');
        }

        $data = $request->validated();

        // Handle image uploads
        if ($request->hasFile('images')) {
            $images = [];
            foreach ($request->file('images') as $image) {
                $images[] = $image->store('products/images', 'public');
            }
            $data['images'] = $images;
        }

        $product = Product::create($data);

        // Create product in Stripe if workspace has Stripe Connect
        if ($store->workspace->stripe_connect_id) {
            try {
                $stripeProduct = $this->stripeService->createProduct(
                    $store->workspace,
                    $product->name,
                    $product->description
                );

                $stripePrice = $this->stripeService->createPrice(
                    $store->workspace,
                    $stripeProduct->id,
                    (int) ($product->price * 100) // Convert to cents
                );

                $product->update([
                    'stripe_product_id' => $stripeProduct->id,
                    'stripe_price_id' => $stripePrice->id,
                ]);
            } catch (Exception $e) {
                // Log error but don't fail product creation
                Log::error('Failed to create Stripe product: '.$e->getMessage());
            }
        }

        return redirect()->route('stores.show', $store->slug)
            ->with('success', 'Product created successfully!');
    }

    /**
     * Display the specified product
     */
    public function show(Request $request, Store $store, Product $product): Response
    {
        if ($product->store_id !== $store->id) {
            abort(404);
        }

        // Only show active products to non-owners
        if (! $product->is_active && ! $request->user()?->isMemberOfWorkspace($store->workspace_id)) {
            abort(403, 'Product is not available');
        }

        return Inertia::render('products/show', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => $product->price,
                'compare_at_price' => $product->compare_at_price,
                'images' => $product->images,
                'quantity' => $product->quantity,
                'is_in_stock' => $product->isInStock(),
                'discount_percentage' => $product->discount_percentage,
                'sku' => $product->sku,
            ],
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
                'logo' => $store->logo,
            ],
            'is_owner' => $request->user()?->isMemberOfWorkspace($store->workspace_id) ?? false,
        ]);
    }

    /**
     * Show the form for editing the specified product
     */
    public function edit(Request $request, Store $store, Product $product): Response
    {
        if (! $request->user()->isMemberOfWorkspace($store->workspace_id)) {
            abort(403, 'Unauthorized');
        }

        if ($product->store_id !== $store->id) {
            abort(404);
        }

        return Inertia::render('products/edit', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => $product->price,
                'compare_at_price' => $product->compare_at_price,
                'images' => $product->images,
                'quantity' => $product->quantity,
                'track_inventory' => $product->track_inventory,
                'sku' => $product->sku,
                'is_active' => $product->is_active,
                'is_featured' => $product->is_featured,
            ],
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
                'workspace' => [
                    'can_accept_payments' => $store->workspace->canAcceptPayments(),
                ],
            ],
        ]);
    }

    /**
     * Update the specified product
     */
    public function update(UpdateProductRequest $request, Store $store, Product $product): RedirectResponse
    {
        if (! $request->user()->isMemberOfWorkspace($store->workspace_id)) {
            abort(403, 'Unauthorized');
        }

        if ($product->store_id !== $store->id) {
            abort(404);
        }

        $data = $request->validated();

        // Handle image uploads
        if ($request->hasFile('images')) {
            // Delete old images
            if ($product->images) {
                foreach ($product->images as $image) {
                    Storage::disk('public')->delete($image);
                }
            }

            $images = [];
            foreach ($request->file('images') as $image) {
                $images[] = $image->store('products/images', 'public');
            }
            $data['images'] = $images;
        }

        $product->update($data);

        return redirect()->route('products.show', [$store->slug, $product->slug])
            ->with('success', 'Product updated successfully!');
    }

    /**
     * Remove the specified product
     */
    public function destroy(Request $request, Store $store, Product $product): RedirectResponse
    {
        if (! $request->user()->isMemberOfWorkspace($store->workspace_id)) {
            abort(403, 'Unauthorized');
        }

        if ($product->store_id !== $store->id) {
            abort(404);
        }

        // Delete images
        if ($product->images) {
            foreach ($product->images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $product->delete();

        return redirect()->route('stores.show', $store->slug)
            ->with('success', 'Product deleted successfully!');
    }
}
