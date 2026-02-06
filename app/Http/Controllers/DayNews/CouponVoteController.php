<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Services\CouponService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CouponVoteController extends Controller
{
    public function __construct(
        private readonly CouponService $couponService
    ) {}

    /**
     * Vote on a coupon.
     */
    public function vote(Request $request, Coupon $coupon): JsonResponse
    {
        $this->authorize('vote', $coupon);

        $validated = $request->validate([
            'vote_type' => ['required', 'in:up,down'],
        ]);

        $this->couponService->vote($coupon, $request->user(), $validated['vote_type']);

        $coupon->refresh();

        return response()->json([
            'success' => true,
            'score' => $coupon->score,
            'upvotes_count' => $coupon->upvotes_count,
            'downvotes_count' => $coupon->downvotes_count,
            'user_vote' => $coupon->getUserVote($request->user()),
        ]);
    }

    /**
     * Remove vote from a coupon.
     */
    public function removeVote(Request $request, Coupon $coupon): JsonResponse
    {
        $this->authorize('vote', $coupon);

        $this->couponService->removeVote($coupon, $request->user());

        $coupon->refresh();

        return response()->json([
            'success' => true,
            'score' => $coupon->score,
            'upvotes_count' => $coupon->upvotes_count,
            'downvotes_count' => $coupon->downvotes_count,
            'user_vote' => null,
        ]);
    }
}
