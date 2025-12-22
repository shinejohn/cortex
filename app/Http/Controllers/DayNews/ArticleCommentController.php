<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Models\ArticleComment;
use App\Models\ArticleCommentLike;
use App\Models\CommentReport;
use App\Models\DayNewsPost;
use App\Models\SocialActivity;
use App\Notifications\DayNews\ArticleCommented;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class ArticleCommentController extends Controller
{
    /**
     * Get comments for an article
     */
    public function index(Request $request, DayNewsPost $post): JsonResponse
    {
        $sortBy = $request->get('sort', 'best'); // best, newest, oldest
        $includeReplies = $request->boolean('include_replies', true);

        $query = ArticleComment::where('article_id', $post->id)
            ->active()
            ->topLevel()
            ->with(['user'])
            ->withCount(['likes', 'replies']);

        // Apply sorting
        match ($sortBy) {
            'best' => $query->best(),
            'newest' => $query->newest(),
            'oldest' => $query->oldest(),
            default => $query->best(),
        };

        // Load replies if requested
        if ($includeReplies) {
            $query->with(['replies' => function ($q) {
                $q->active()->with(['user'])->withCount('likes')->orderBy('created_at', 'asc');
            }]);
        }

        $comments = $query->get()->map(function ($comment) use ($request) {
            return [
                'id' => $comment->id,
                'content' => $comment->content,
                'user' => [
                    'id' => $comment->user->id,
                    'name' => $comment->user->name,
                    'avatar' => $comment->user->profile_photo_url ?? null,
                ],
                'created_at' => $comment->created_at->toISOString(),
                'time_ago' => $comment->created_at->diffForHumans(),
                'likes_count' => $comment->likes_count,
                'replies_count' => $comment->replies_count,
                'is_liked_by_user' => $request->user() ? $comment->isLikedBy($request->user()) : false,
                'is_pinned' => $comment->is_pinned,
                'replies' => $comment->replies->map(function ($reply) use ($request) {
                    return [
                        'id' => $reply->id,
                        'content' => $reply->content,
                        'user' => [
                            'id' => $reply->user->id,
                            'name' => $reply->user->name,
                            'avatar' => $reply->user->profile_photo_url ?? null,
                        ],
                        'created_at' => $reply->created_at->toISOString(),
                        'time_ago' => $reply->created_at->diffForHumans(),
                        'likes_count' => $reply->likes()->count(),
                        'is_liked_by_user' => $request->user() ? $reply->isLikedBy($request->user()) : false,
                    ];
                }),
            ];
        });

        return response()->json([
            'comments' => $comments,
            'total' => ArticleComment::where('article_id', $post->id)->active()->count(),
        ]);
    }

    /**
     * Store a new comment
     */
    public function store(Request $request, DayNewsPost $post): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string|max:5000',
            'parent_id' => 'nullable|uuid|exists:article_comments,id',
        ]);

        $comment = ArticleComment::create([
            'article_id' => $post->id,
            'user_id' => $request->user()->id,
            'parent_id' => $validated['parent_id'] ?? null,
            'content' => $validated['content'],
        ]);

        $comment->load(['user', 'replies']);

        // Create activity
        SocialActivity::create([
            'user_id' => $post->author_id ?? $post->workspace_id, // Notify article author
            'actor_id' => $request->user()->id,
            'type' => 'article_comment',
            'subject_type' => ArticleComment::class,
            'subject_id' => $comment->id,
            'data' => [
                'article_id' => $post->id,
                'article_title' => $post->title,
            ],
        ]);

        // Send notification to article author
        if ($post->author) {
            $post->author->notify(new ArticleCommented($post, $request->user()));
        }

        return response()->json([
            'comment' => [
                'id' => $comment->id,
                'content' => $comment->content,
                'user' => [
                    'id' => $comment->user->id,
                    'name' => $comment->user->name,
                    'avatar' => $comment->user->profile_photo_url ?? null,
                ],
                'created_at' => $comment->created_at->toISOString(),
                'time_ago' => $comment->created_at->diffForHumans(),
                'likes_count' => 0,
                'replies_count' => 0,
                'is_liked_by_user' => false,
            ],
        ], 201);
    }

    /**
     * Update a comment
     */
    public function update(Request $request, ArticleComment $comment): JsonResponse
    {
        $this->authorize('update', $comment);

        $validated = $request->validate([
            'content' => 'required|string|max:5000',
        ]);

        $comment->update($validated);

        return response()->json([
            'comment' => $comment->fresh(['user']),
        ]);
    }

    /**
     * Delete a comment
     */
    public function destroy(ArticleComment $comment): JsonResponse
    {
        $this->authorize('delete', $comment);

        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully']);
    }

    /**
     * Like/unlike a comment
     */
    public function toggleLike(Request $request, ArticleComment $comment): JsonResponse
    {
        $like = ArticleCommentLike::where('comment_id', $comment->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($like) {
            $like->delete();
            $liked = false;
        } else {
            ArticleCommentLike::create([
                'comment_id' => $comment->id,
                'user_id' => $request->user()->id,
            ]);
            $liked = true;
        }

        return response()->json([
            'liked' => $liked,
            'likes_count' => $comment->likes()->count(),
        ]);
    }

    /**
     * Report a comment
     */
    public function report(Request $request, ArticleComment $comment): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|in:spam,harassment,inappropriate,other',
            'details' => 'nullable|string|max:1000',
        ]);

        // Check if user already reported this comment
        $existingReport = CommentReport::where('comment_id', $comment->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existingReport) {
            return response()->json(['message' => 'You have already reported this comment'], 422);
        }

        // Create report
        CommentReport::create([
            'comment_id' => $comment->id,
            'user_id' => $request->user()->id,
            'reason' => $validated['reason'],
            'details' => $validated['details'] ?? null,
            'status' => 'pending',
        ]);

        $comment->increment('reports_count');

        // If reports exceed threshold, auto-hide comment
        if ($comment->fresh()->reports_count >= 5) {
            $comment->update(['is_active' => false]);
            
            // Notify admins
            // TODO: Send notification to admin users
        }

        return response()->json(['message' => 'Comment reported successfully']);
    }

    /**
     * Pin/unpin a comment (admin only)
     */
    public function togglePin(Request $request, ArticleComment $comment): JsonResponse
    {
        $request->user()->can('moderate', ArticleComment::class) || abort(403);

        $comment->update(['is_pinned' => !$comment->is_pinned]);

        return response()->json([
            'pinned' => $comment->is_pinned,
            'message' => $comment->is_pinned ? 'Comment pinned' : 'Comment unpinned',
        ]);
    }

    /**
     * Moderate comment (admin only)
     */
    public function moderate(Request $request, ArticleComment $comment): JsonResponse
    {
        $request->user()->can('moderate', ArticleComment::class) || abort(403);

        $validated = $request->validate([
            'action' => 'required|string|in:hide,show,delete',
        ]);

        match ($validated['action']) {
            'hide' => $comment->update(['is_active' => false]),
            'show' => $comment->update(['is_active' => true]),
            'delete' => $comment->delete(),
        };

        // Update report statuses
        if ($validated['action'] !== 'delete') {
            CommentReport::where('comment_id', $comment->id)
                ->update(['status' => 'resolved']);
        }

        return response()->json(['message' => 'Comment moderated successfully']);
    }
}

