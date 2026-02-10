<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Http\Requests\DayNews\StoreCouponRequest;
use App\Http\Requests\DayNews\UpdateCouponRequest;
use App\Models\Comment;
use App\Models\Coupon;
use App\Models\CouponVote;
use App\Models\SavedCoupon;
use App\Services\CouponService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                    'is_verified' => $coupon->business->is_verified,
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
                    'is_verified' => $coupon->business->is_verified,
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
     * Toggle an upvote or downvote on a coupon.
     */
    public function vote(Request $request, Coupon $coupon): JsonResponse
    {
        $request->validate([
            'vote_type' => ['required', 'in:up,down'],
        ]);

        $user = $request->user();
        $voteType = $request->input('vote_type');

        $existingVote = CouponVote::where('coupon_id', $coupon->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingVote) {
            if ($existingVote->vote_type === $voteType) {
                $existingVote->delete();
            } else {
                $existingVote->update(['vote_type' => $voteType]);
            }
        } else {
            CouponVote::create([
                'coupon_id' => $coupon->id,
                'user_id' => $user->id,
                'vote_type' => $voteType,
            ]);
        }

        $coupon->recalculateScore();
        $coupon->refresh();

        return response()->json([
            'score' => $coupon->score,
            'upvotes_count' => $coupon->upvotes_count,
            'downvotes_count' => $coupon->downvotes_count,
            'user_vote' => $coupon->getUserVote($user),
        ]);
    }

    /**
     * Store a comment on a coupon.
     */
    public function storeComment(Request $request, Coupon $coupon): JsonResponse
    {
        $request->validate([
            'content' => ['required', 'string', 'max:2000'],
            'parent_id' => ['nullable', 'exists:comments,id'],
        ]);

        $comment = $coupon->comments()->create([
            'user_id' => $request->user()->id,
            'content' => $request->input('content'),
            'parent_id' => $request->input('parent_id'),
            'is_active' => true,
        ]);

        $comment->load('user');

        return response()->json([
            'comment' => $this->transformComment($comment, $request->user()),
        ], 201);
    }

    /**
     * Toggle save/unsave a coupon for the authenticated user.
     */
    public function toggleSave(Request $request, Coupon $coupon): JsonResponse
    {
        $user = $request->user();

        $existing = SavedCoupon::where('coupon_id', $coupon->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $isSaved = false;
        } else {
            SavedCoupon::create([
                'coupon_id' => $coupon->id,
                'user_id' => $user->id,
            ]);
            $isSaved = true;
        }

        $coupon->recalculateScore();

        return response()->json([
            'is_saved' => $isSaved,
            'saves_count' => $coupon->fresh()->saves_count,
        ]);
    }

    /**
     * Toggle like on a coupon comment.
     */
    public function toggleCommentLike(Request $request, int $commentId): JsonResponse
    {
        $userId = $request->user()->id;

        $existing = DB::table('comment_likes')
            ->where('comment_type', 'coupon_comment')
            ->where('comment_id', $commentId)
            ->where('user_id', $userId)
            ->first();

        if ($existing) {
            DB::table('comment_likes')
                ->where('comment_type', 'coupon_comment')
                ->where('comment_id', $commentId)
                ->where('user_id', $userId)
                ->delete();

            $isLiked = false;
        } else {
            DB::table('comment_likes')->insert([
                'comment_type' => 'coupon_comment',
                'comment_id' => $commentId,
                'user_id' => $userId,
                'created_at' => now(),
            ]);

            $isLiked = true;
        }

        $likesCount = DB::table('comment_likes')
            ->where('comment_type', 'coupon_comment')
            ->where('comment_id', $commentId)
            ->count();

        return response()->json([
            'is_liked' => $isLiked,
            'likes_count' => $likesCount,
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
