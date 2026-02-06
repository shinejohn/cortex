<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Http\Requests\DayNews\StoreCouponRequest;
use App\Http\Requests\DayNews\UpdateCouponRequest;
use App\Models\Coupon;
use App\Services\CouponService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class CouponController extends Controller
{
    public function __construct(
        private readonly CouponService $couponService
    ) {}

    /**
     * Display the coupon discovery page.
     */
    public function index(Request $request): Response
    {
        $currentRegion = $request->attributes->get('detected_region');
        $regionId = $currentRegion?->id;

        $category = $request->query('category');
        $search = $request->query('search');
        $showGlobal = $request->boolean('global', false);

        // Get featured coupons
        $featuredCoupons = $this->couponService->getFeaturedCoupons($regionId, 6);

        // Get all coupons with pagination
        $coupons = $this->couponService->getCoupons(
            regionId: $regionId,
            category: $category,
            search: $search,
            showGlobal: $showGlobal,
            perPage: 12
        );

        // Transform coupons for frontend
        $user = $request->user();

        $transformCoupon = function ($coupon) use ($user) {
            return [
                'id' => $coupon->id,
                'title' => $coupon->title,
                'slug' => $coupon->slug,
                'code' => $coupon->code,
                'description' => $coupon->description,
                'discount_type' => $coupon->discount_type,
                'discount_value' => $coupon->discount_value,
                'discount_display' => $coupon->discount_display,
                'valid_from' => $coupon->valid_from->toDateString(),
                'valid_until' => $coupon->valid_until?->toDateString(),
                'image' => $coupon->image,
                'category' => $coupon->category,
                'is_verified' => $coupon->is_verified,
                'score' => $coupon->score,
                'upvotes_count' => $coupon->upvotes_count,
                'downvotes_count' => $coupon->downvotes_count,
                'saves_count' => $coupon->saves_count,
                'business' => [
                    'id' => $coupon->business->id,
                    'name' => $coupon->business->name,
                    'slug' => $coupon->business->slug,
                    'address' => $coupon->business->address,
                    'city' => $coupon->business->city,
                    'state' => $coupon->business->state,
                    'images' => $coupon->business->images,
                    'categories' => $coupon->business->categories,
                ],
                'regions' => $coupon->regions->map(fn ($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                    'slug' => $r->slug,
                ]),
                'user_vote' => $user ? $coupon->getUserVote($user) : null,
                'is_saved' => $user ? $coupon->isSavedBy($user) : false,
            ];
        };

        return Inertia::render('day-news/coupons/index', [
            'featuredCoupons' => $featuredCoupons->map($transformCoupon),
            'coupons' => $coupons->through($transformCoupon),
            'categories' => $this->getCategories(),
            'filters' => [
                'category' => $category,
                'search' => $search,
                'global' => $showGlobal,
            ],
            'hasRegion' => $currentRegion !== null,
        ]);
    }

    /**
     * Display a single coupon.
     */
    public function show(string $slug, Request $request): Response
    {
        $coupon = Coupon::with(['business', 'regions', 'user', 'activeRootComments.user', 'activeRootComments.activeReplies.user'])
            ->where('slug', $slug)
            ->firstOrFail();

        $this->authorize('view', $coupon);

        $coupon->incrementViewCount();

        $user = $request->user();

        // Get related coupons
        $relatedCoupons = $this->couponService->getRelatedCoupons($coupon, 4);

        return Inertia::render('day-news/coupons/show', [
            'coupon' => [
                'id' => $coupon->id,
                'title' => $coupon->title,
                'slug' => $coupon->slug,
                'code' => $coupon->code,
                'description' => $coupon->description,
                'terms_conditions' => $coupon->terms_conditions,
                'discount_type' => $coupon->discount_type,
                'discount_value' => $coupon->discount_value,
                'discount_display' => $coupon->discount_display,
                'valid_from' => $coupon->valid_from->toDateString(),
                'valid_until' => $coupon->valid_until?->toDateString(),
                'image' => $coupon->image,
                'category' => $coupon->category,
                'is_verified' => $coupon->is_verified,
                'score' => $coupon->score,
                'upvotes_count' => $coupon->upvotes_count,
                'downvotes_count' => $coupon->downvotes_count,
                'saves_count' => $coupon->saves_count,
                'view_count' => $coupon->view_count,
                'created_at' => $coupon->created_at->toISOString(),
                'user' => [
                    'id' => $coupon->user->id,
                    'name' => $coupon->user->name,
                ],
                'business' => [
                    'id' => $coupon->business->id,
                    'name' => $coupon->business->name,
                    'slug' => $coupon->business->slug,
                    'address' => $coupon->business->address,
                    'city' => $coupon->business->city,
                    'state' => $coupon->business->state,
                    'postal_code' => $coupon->business->postal_code,
                    'phone' => $coupon->business->phone,
                    'website' => $coupon->business->website,
                    'opening_hours' => $coupon->business->opening_hours,
                    'images' => $coupon->business->images,
                    'categories' => $coupon->business->categories,
                    'rating' => $coupon->business->rating,
                ],
                'regions' => $coupon->regions->map(fn ($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                    'slug' => $r->slug,
                ]),
                'user_vote' => $user ? $coupon->getUserVote($user) : null,
                'is_saved' => $user ? $coupon->isSavedBy($user) : false,
                'comments' => $coupon->activeRootComments->map(function ($comment) use ($user) {
                    return $this->transformComment($comment, $user);
                }),
            ],
            'relatedCoupons' => $relatedCoupons->map(fn ($c) => [
                'id' => $c->id,
                'title' => $c->title,
                'slug' => $c->slug,
                'code' => $c->code,
                'discount_display' => $c->discount_display,
                'valid_until' => $c->valid_until?->toDateString(),
                'business' => [
                    'name' => $c->business->name,
                    'images' => $c->business->images,
                ],
            ]),
        ]);
    }

    /**
     * Show the create coupon form.
     */
    public function create(): Response
    {
        $this->authorize('create', Coupon::class);

        return Inertia::render('day-news/coupons/create', [
            'categories' => $this->getCategories(),
        ]);
    }

    /**
     * Store a new coupon.
     */
    public function store(StoreCouponRequest $request): RedirectResponse
    {
        $coupon = $this->couponService->createCoupon(
            user: $request->user(),
            data: $request->validated()
        );

        return redirect()
            ->route('daynews.coupons.show', $coupon->slug)
            ->with('success', 'Coupon created successfully!');
    }

    /**
     * Show the edit coupon form.
     */
    public function edit(Coupon $coupon): Response
    {
        $this->authorize('update', $coupon);

        $coupon->load(['business', 'regions']);

        return Inertia::render('day-news/coupons/edit', [
            'coupon' => [
                'id' => $coupon->id,
                'title' => $coupon->title,
                'code' => $coupon->code,
                'description' => $coupon->description,
                'terms_conditions' => $coupon->terms_conditions,
                'discount_type' => $coupon->discount_type,
                'discount_value' => $coupon->discount_value,
                'valid_from' => $coupon->valid_from->toDateString(),
                'valid_until' => $coupon->valid_until?->toDateString(),
                'category' => $coupon->category,
                'business_id' => $coupon->business_id,
                'business' => [
                    'id' => $coupon->business->id,
                    'name' => $coupon->business->name,
                ],
                'region_ids' => $coupon->regions->pluck('id'),
                'regions' => $coupon->regions->map(fn ($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                    'type' => $r->type,
                ]),
            ],
            'categories' => $this->getCategories(),
        ]);
    }

    /**
     * Update a coupon.
     */
    public function update(UpdateCouponRequest $request, Coupon $coupon): RedirectResponse
    {
        $this->couponService->updateCoupon($coupon, $request->validated());

        return redirect()
            ->route('daynews.coupons.show', $coupon->slug)
            ->with('success', 'Coupon updated successfully!');
    }

    /**
     * Delete a coupon.
     */
    public function destroy(Coupon $coupon): RedirectResponse
    {
        $this->authorize('delete', $coupon);

        $this->couponService->deleteCoupon($coupon);

        return redirect()
            ->route('daynews.coupons.index')
            ->with('success', 'Coupon deleted successfully.');
    }

    /**
     * Display user's submitted coupons.
     */
    public function myCoupons(Request $request): Response
    {
        $coupons = $this->couponService->getMyCoupons($request->user());

        return Inertia::render('day-news/coupons/my-coupons', [
            'coupons' => $coupons->through(fn ($coupon) => [
                'id' => $coupon->id,
                'title' => $coupon->title,
                'slug' => $coupon->slug,
                'code' => $coupon->code,
                'discount_display' => $coupon->discount_display,
                'status' => $coupon->status,
                'is_verified' => $coupon->is_verified,
                'score' => $coupon->score,
                'saves_count' => $coupon->saves_count,
                'view_count' => $coupon->view_count,
                'valid_until' => $coupon->valid_until?->toDateString(),
                'created_at' => $coupon->created_at->toISOString(),
                'business' => [
                    'name' => $coupon->business->name,
                ],
                'can_edit' => $request->user()->can('update', $coupon),
                'can_delete' => $request->user()->can('delete', $coupon),
            ]),
        ]);
    }

    /**
     * Display user's saved coupons.
     */
    public function savedCoupons(Request $request): Response
    {
        $coupons = $this->couponService->getSavedCoupons($request->user());

        return Inertia::render('day-news/coupons/saved', [
            'coupons' => $coupons->through(fn ($coupon) => [
                'id' => $coupon->id,
                'title' => $coupon->title,
                'slug' => $coupon->slug,
                'code' => $coupon->code,
                'discount_display' => $coupon->discount_display,
                'valid_until' => $coupon->valid_until?->toDateString(),
                'business' => [
                    'id' => $coupon->business->id,
                    'name' => $coupon->business->name,
                    'images' => $coupon->business->images,
                ],
            ]),
        ]);
    }

    /**
     * Get available categories.
     *
     * @return array<int, array{value: string, label: string}>
     */
    private function getCategories(): array
    {
        return [
            ['value' => 'restaurant', 'label' => 'Restaurant'],
            ['value' => 'retail', 'label' => 'Retail'],
            ['value' => 'services', 'label' => 'Services'],
            ['value' => 'entertainment', 'label' => 'Entertainment'],
            ['value' => 'health_beauty', 'label' => 'Health & Beauty'],
            ['value' => 'automotive', 'label' => 'Automotive'],
            ['value' => 'travel', 'label' => 'Travel'],
            ['value' => 'grocery', 'label' => 'Grocery'],
            ['value' => 'electronics', 'label' => 'Electronics'],
            ['value' => 'other', 'label' => 'Other'],
        ];
    }

    /**
     * Transform a comment for the frontend.
     *
     * @return array<string, mixed>
     */
    private function transformComment($comment, $user): array
    {
        return [
            'id' => $comment->id,
            'content' => $comment->content,
            'created_at' => $comment->created_at->toISOString(),
            'user' => [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
            ],
            'likes_count' => $comment->likesCount(),
            'is_liked' => $user ? $comment->isLikedBy($user) : false,
            'replies' => $comment->activeReplies->map(function ($reply) use ($user) {
                return $this->transformComment($reply, $user);
            }),
        ];
    }
}
