<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreTagRequest;
use App\Http\Requests\Api\V1\UpdateTagRequest;
use App\Http\Resources\Api\V1\TagResource;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Tags
 * 
 * Tag management endpoints for content categorization.
 */
final class TagController extends BaseController
{
    /**
     * List all tags.
     * 
     * @queryParam trending boolean Show only trending tags. Example: true
     * @queryParam popular boolean Show only popular tags. Example: true
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
        $query = Tag::query();

        if ($request->has('trending')) {
            $query->trending();
        } elseif ($request->has('popular')) {
            $query->popular();
        }

        $tags = $query->paginate($request->get('per_page', 20));

        return $this->paginated($tags);
    }

    /**
     * Get tag by slug.
     * 
     * @urlParam slug string required The tag slug. Example: news
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "name": "News",
     *     "slug": "news"
     *   }
     * }
     * 
     * @unauthenticated
     */
    public function show(string $slug): JsonResponse
    {
        $tag = Tag::where('slug', $slug)->firstOrFail();

        return $this->success(new TagResource($tag));
    }

    /**
     * Get posts with tag.
     * 
     * @urlParam tag string required The tag UUID. Example: 550e8400-e29b-41d4-a716-446655440000
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
    public function posts(Request $request, Tag $tag): JsonResponse
    {
        $posts = $tag->posts()
            ->published()
            ->paginate($request->get('per_page', 20));

        return $this->paginated($posts);
    }

    /**
     * Create tag.
     * 
     * @bodyParam name string required The tag name. Example: News
     * @bodyParam slug string The tag slug (auto-generated if not provided). Example: news
     * 
     * @response 201 {
     *   "success": true,
     *   "message": "Tag created successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function store(StoreTagRequest $request): JsonResponse
    {
        $tag = Tag::create($request->validated());

        return $this->success(new TagResource($tag), 'Tag created successfully', 201);
    }

    /**
     * Update tag.
     * 
     * @urlParam tag string required The tag UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam name string The tag name. Example: Updated Tag Name
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Tag updated successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function update(UpdateTagRequest $request, Tag $tag): JsonResponse
    {
        $tag->update($request->validated());

        return $this->success(new TagResource($tag), 'Tag updated successfully');
    }

    /**
     * Delete tag.
     * 
     * @urlParam tag string required The tag UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 204
     * 
     * @authenticated
     */
    public function destroy(Tag $tag): JsonResponse
    {
        $tag->delete();

        return $this->noContent();
    }
}

