<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreCommentRequest;
use App\Http\Requests\Api\V1\UpdateCommentRequest;
use App\Http\Resources\Api\V1\CommentResource;
use App\Models\ArticleComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Comments
 * 
 * Comment management endpoints for article comments.
 */
final class CommentController extends BaseController
{
    /**
     * List comments.
     * 
     * @queryParam article_id string Filter by article ID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @queryParam per_page integer Items per page. Example: 20
     * 
     * @response 200 {
     *   "success": true,
     *   "data": [...],
     *   "meta": {...}
     * }
     * 
     * @unauthenticated
     */
    public function index(Request $request): JsonResponse
    {
        $query = ArticleComment::query()->with(['user', 'replies']);

        if ($request->has('article_id')) {
            $query->where('article_id', $request->article_id);
        }

        $comments = $query->topLevel()->active()->paginate($request->get('per_page', 20));

        return $this->paginated($comments);
    }

    /**
     * Get comment.
     * 
     * @urlParam comment string required The comment UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "content": "Great article!",
     *     "user": {...}
     *   }
     * }
     * 
     * @unauthenticated
     */
    public function show(ArticleComment $comment): JsonResponse
    {
        return $this->success(new CommentResource($comment->load(['user', 'replies', 'parent'])));
    }

    /**
     * Create comment.
     * 
     * @bodyParam article_id string required The article UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam content string required The comment content. Example: Great article!
     * @bodyParam parent_id string The parent comment UUID (for replies). Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 201 {
     *   "success": true,
     *   "message": "Comment created successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function store(StoreCommentRequest $request): JsonResponse
    {
        $comment = ArticleComment::create([
            'article_id' => $request->article_id,
            'user_id' => $request->user()->id,
            'parent_id' => $request->parent_id,
            'content' => $request->content,
        ]);

        return $this->success(new CommentResource($comment->load('user')), 'Comment created successfully', 201);
    }

    /**
     * Update comment.
     * 
     * @urlParam comment string required The comment UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam content string required The updated comment content. Example: Updated comment
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Comment updated successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function update(UpdateCommentRequest $request, ArticleComment $comment): JsonResponse
    {
        $this->authorize('update', $comment);

        $comment->update($request->validated());

        return $this->success(new CommentResource($comment->load('user')), 'Comment updated successfully');
    }

    /**
     * Delete comment.
     * 
     * @urlParam comment string required The comment UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 204
     * 
     * @authenticated
     */
    public function destroy(ArticleComment $comment): JsonResponse
    {
        $this->authorize('delete', $comment);

        $comment->delete();

        return $this->noContent();
    }

    /**
     * Like comment.
     * 
     * @urlParam comment string required The comment UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Comment liked successfully",
     *   "data": null
     * }
     * 
     * @authenticated
     */
    public function like(Request $request, ArticleComment $comment): JsonResponse
    {
        $like = $comment->likes()->firstOrCreate(['user_id' => $request->user()->id]);

        return $this->success(null, 'Comment liked successfully');
    }

    /**
     * Unlike comment.
     * 
     * @urlParam comment string required The comment UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 204
     * 
     * @authenticated
     */
    public function unlike(Request $request, ArticleComment $comment): JsonResponse
    {
        $comment->likes()->where('user_id', $request->user()->id)->delete();

        return $this->noContent();
    }

    /**
     * Report comment.
     * 
     * @urlParam comment string required The comment UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam reason string The reason for reporting. Example: Spam
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Comment reported successfully",
     *   "data": null
     * }
     * 
     * @authenticated
     */
    public function report(Request $request, ArticleComment $comment): JsonResponse
    {
        $request->validate(['reason' => ['sometimes', 'string']]);

        $comment->increment('reports_count');

        // TODO: Create comment report record

        return $this->success(null, 'Comment reported successfully');
    }
}

