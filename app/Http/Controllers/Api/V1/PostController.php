<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StorePostRequest;
use App\Http\Requests\Api\V1\UpdatePostRequest;
use App\Http\Resources\Api\V1\PostResource;
use App\Http\Resources\Api\V1\RegionResource;
use App\Http\Resources\Api\V1\TagResource;
use App\Models\DayNewsPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Posts
 * 
 * Day News Post endpoints for creating, managing, and publishing content.
 */
final class PostController extends BaseController
{
    /**
     * List published posts (paginated).
     * 
     * @queryParam region_id string Filter by region ID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @queryParam category string Filter by category. Example: news
     * @queryParam author_id string Filter by author ID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @queryParam status string Filter by status (draft, published, archived). Example: published
     * @queryParam sort string Sort order (latest, popular, trending). Example: latest
     * @queryParam per_page integer Items per page. Example: 20
     * @queryParam page integer Page number. Example: 1
     * 
     * @response 200 {
     *   "success": true,
     *   "data": [...],
     *   "meta": {
     *     "current_page": 1,
     *     "total": 100
     *   }
     * }
     * 
     * @unauthenticated
     */
    public function index(Request $request): JsonResponse
    {
        $query = DayNewsPost::query()->with(['author', 'regions', 'tags']);

        // Apply filters
        if ($request->has('region_id')) {
            $query->whereHas('regions', fn($q) => $q->where('regions.id', $request->region_id));
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('author_id')) {
            $query->where('author_id', $request->author_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            $query->published();
        }

        // Apply sorting
        $sort = $request->get('sort', 'latest');
        match($sort) {
            'latest' => $query->latest(),
            'popular' => $query->orderBy('view_count', 'desc'),
            'trending' => $query->orderBy('view_count', 'desc'), // TODO: Add trending_score
            default => $query->latest(),
        };

        $posts = $query->paginate($request->get('per_page', 20));

        return $this->paginated($posts);
    }

    /**
     * Get post by ID.
     * 
     * @urlParam post string required The post UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "title": "My Post",
     *     "content": "Post content",
     *     "status": "published"
     *   }
     * }
     * 
     * @unauthenticated
     */
    public function show(DayNewsPost $post): JsonResponse
    {
        // Increment view count
        $post->increment('view_count');

        return $this->success(new PostResource($post->load(['author', 'regions', 'tags', 'comments'])));
    }

    /**
     * Get post by slug.
     */
    public function showBySlug(string $slug): JsonResponse
    {
        $post = DayNewsPost::where('slug', $slug)->firstOrFail();
        $post->increment('view_count');

        return $this->success(new PostResource($post->load(['author', 'regions', 'tags', 'comments'])));
    }

    /**
     * Create new post.
     * 
     * @bodyParam workspace_id string required The workspace ID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam title string required The post title. Example: My First Post
     * @bodyParam content string required The post content.
     * @bodyParam status string The post status (draft, published). Example: draft
     * @bodyParam category string The post category. Example: news
     * @bodyParam region_ids array Array of region IDs. Example: ["550e8400-e29b-41d4-a716-446655440000"]
     * @bodyParam tag_ids array Array of tag IDs. Example: ["550e8400-e29b-41d4-a716-446655440000"]
     * 
     * @response 201 {
     *   "success": true,
     *   "message": "Post created successfully",
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "title": "My First Post",
     *     "status": "draft"
     *   }
     * }
     * 
     * @authenticated
     */
    public function store(StorePostRequest $request): JsonResponse
    {
        $post = DayNewsPost::create($request->validated());

        if ($request->has('region_ids')) {
            $post->regions()->attach($request->region_ids);
        }

        if ($request->has('tag_ids')) {
            $post->tags()->attach($request->tag_ids);
        }

        return $this->success(new PostResource($post->load(['author', 'regions', 'tags'])), 'Post created successfully', 201);
    }

    /**
     * Update post.
     * 
     * @urlParam post string required The post UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam title string The post title. Example: Updated Title
     * @bodyParam content string The post content.
     * @bodyParam status string The post status. Example: published
     * @bodyParam region_ids array Array of region IDs.
     * @bodyParam tag_ids array Array of tag IDs.
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Post updated successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function update(UpdatePostRequest $request, DayNewsPost $post): JsonResponse
    {
        $this->authorize('update', $post);

        $post->update($request->validated());

        if ($request->has('region_ids')) {
            $post->regions()->sync($request->region_ids);
        }

        if ($request->has('tag_ids')) {
            $post->tags()->sync($request->tag_ids);
        }

        return $this->success(new PostResource($post->load(['author', 'regions', 'tags'])), 'Post updated successfully');
    }

    /**
     * Publish draft post.
     * 
     * Changes post status from draft to published.
     * 
     * @urlParam post string required The post UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Post published successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function publish(Request $request, DayNewsPost $post): JsonResponse
    {
        $this->authorize('update', $post);

        $post->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        return $this->success(new PostResource($post), 'Post published successfully');
    }

    /**
     * Unpublish post.
     */
    public function unpublish(Request $request, DayNewsPost $post): JsonResponse
    {
        $this->authorize('update', $post);

        $post->update(['status' => 'draft']);

        return $this->success(new PostResource($post), 'Post unpublished successfully');
    }

    /**
     * Delete post.
     */
    public function destroy(DayNewsPost $post): JsonResponse
    {
        $this->authorize('delete', $post);

        $post->delete();

        return $this->noContent();
    }

    /**
     * Get featured posts.
     */
    public function featured(Request $request): JsonResponse
    {
        $posts = DayNewsPost::published()
            ->whereNotNull('featured_image')
            ->orderBy('view_count', 'desc')
            ->limit($request->get('limit', 10))
            ->get();

        return $this->success(PostResource::collection($posts));
    }

    /**
     * Get trending posts.
     */
    public function trending(Request $request): JsonResponse
    {
        $posts = DayNewsPost::published()
            ->orderBy('view_count', 'desc')
            ->where('created_at', '>=', now()->subDays(7))
            ->limit($request->get('limit', 10))
            ->get();

        return $this->success(PostResource::collection($posts));
    }

    /**
     * Get post regions.
     */
    public function regions(DayNewsPost $post): JsonResponse
    {
        return $this->success(RegionResource::collection($post->regions));
    }

    /**
     * Add region to post.
     */
    public function addRegion(Request $request, DayNewsPost $post): JsonResponse
    {
        $this->authorize('update', $post);

        $request->validate(['region_id' => ['required', 'uuid', 'exists:regions,id']]);

        $post->regions()->syncWithoutDetaching([$request->region_id]);

        return $this->success(null, 'Region added successfully');
    }

    /**
     * Remove region from post.
     */
    public function removeRegion(DayNewsPost $post, string $regionId): JsonResponse
    {
        $this->authorize('update', $post);

        $post->regions()->detach($regionId);

        return $this->noContent();
    }

    /**
     * Get post tags.
     */
    public function tags(DayNewsPost $post): JsonResponse
    {
        return $this->success(TagResource::collection($post->tags));
    }

    /**
     * Add tags to post.
     */
    public function addTags(Request $request, DayNewsPost $post): JsonResponse
    {
        $this->authorize('update', $post);

        $request->validate(['tag_ids' => ['required', 'array'], 'tag_ids.*' => ['uuid', 'exists:tags,id']]);

        $post->tags()->syncWithoutDetaching($request->tag_ids);

        return $this->success(null, 'Tags added successfully');
    }

    /**
     * Remove tag from post.
     */
    public function removeTag(DayNewsPost $post, string $tagId): JsonResponse
    {
        $this->authorize('update', $post);

        $post->tags()->detach($tagId);

        return $this->noContent();
    }

    /**
     * Get post comments.
     */
    public function comments(Request $request, DayNewsPost $post): JsonResponse
    {
        $comments = $post->comments()
            ->with(['user', 'replies'])
            ->topLevel()
            ->active()
            ->paginate($request->get('per_page', 20));

        return $this->paginated($comments);
    }

    /**
     * Get post payment history.
     */
    public function payments(DayNewsPost $post): JsonResponse
    {
        $payments = $post->payment;

        return $this->success($payments);
    }

    /**
     * Sponsor a post.
     */
    public function sponsor(Request $request, DayNewsPost $post): JsonResponse
    {
        $this->authorize('update', $post);

        // TODO: Implement sponsorship logic
        return $this->error('Sponsorship not yet implemented', 'NOT_IMPLEMENTED');
    }
}

