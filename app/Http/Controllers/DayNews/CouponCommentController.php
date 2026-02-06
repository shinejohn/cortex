<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Http\Requests\DayNews\StoreCouponCommentRequest;
use App\Models\Comment;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CouponCommentController extends Controller
{
    /**
     * Store a new comment on a coupon.
     */
    public function store(StoreCouponCommentRequest $request, Coupon $coupon): JsonResponse
    {
        $this->authorize('comment', $coupon);

        $comment = $coupon->comments()->create([
            'user_id' => $request->user()->id,
            'content' => $request->validated('content'),
            'parent_id' => $request->validated('parent_id'),
            'is_active' => true,
        ]);

        $comment->load('user');

        return response()->json([
            'success' => true,
            'comment' => [
                'id' => $comment->id,
                'content' => $comment->content,
                'created_at' => $comment->created_at->toISOString(),
                'user' => [
                    'id' => $comment->user->id,
                    'name' => $comment->user->name,
                ],
                'likes_count' => 0,
                'is_liked' => false,
                'replies' => [],
            ],
        ]);
    }

    /**
     * Delete a comment.
     */
    public function destroy(Request $request, Coupon $coupon, Comment $comment): JsonResponse
    {
        // Ensure comment belongs to this coupon
        if ((string) $comment->commentable_id !== (string) $coupon->id || $comment->commentable_type !== Coupon::class) {
            abort(404, 'Comment not found.');
        }

        // Only allow comment owner to delete
        if ((string) $comment->user_id !== (string) $request->user()->id) {
            abort(403, 'You can only delete your own comments.');
        }

        $comment->update(['is_active' => false]);

        return response()->json([
            'success' => true,
        ]);
    }
}
