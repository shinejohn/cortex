<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreNewsArticleRequest;
use App\Http\Requests\Api\V1\UpdateNewsArticleRequest;
use App\Http\Resources\Api\V1\NewsArticleResource;
use App\Models\NewsArticle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group News Articles
 * 
 * News article management endpoints for published articles.
 */
final class NewsArticleController extends BaseController
{
    /**
     * List news articles.
     * 
     * @queryParam region_id string Filter by region ID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @queryParam processed boolean Filter by processed status. Example: true
     * @queryParam source_type string Filter by source type. Example: rss
     * @queryParam per_page integer Items per page. Example: 20
     * 
     * @response 200 {
     *   "success": true,
     *   "data": [...],
     *   "meta": {...}
     * }
     * 
     * @authenticated
     */
    public function index(Request $request): JsonResponse
    {
        $query = NewsArticle::query()->with(['region', 'business']);

        if ($request->has('region_id')) {
            $query->where('region_id', $request->region_id);
        }

        if ($request->has('processed')) {
            $query->where('processed', $request->boolean('processed'));
        }

        if ($request->has('source_type')) {
            $query->where('source_type', $request->source_type);
        }

        $articles = $query->orderBy('published_at', 'desc')->paginate($request->get('per_page', 20));

        return $this->paginated($articles);
    }

    /**
     * Get article details.
     * 
     * @urlParam newsArticle string required The article UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "title": "Article Title",
     *     "content": "Article content"
     *   }
     * }
     * 
     * @authenticated
     */
    public function show(NewsArticle $newsArticle): JsonResponse
    {
        return $this->success(new NewsArticleResource($newsArticle->load(['region', 'business', 'drafts'])));
    }

    /**
     * Create article.
     * 
     * @bodyParam region_id string required The region ID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam title string required The article title. Example: Breaking News
     * @bodyParam content string required The article content.
     * @bodyParam source_url string The source URL. Example: https://example.com/article
     * 
     * @response 201 {
     *   "success": true,
     *   "message": "Article created successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function store(StoreNewsArticleRequest $request): JsonResponse
    {
        $article = NewsArticle::create($request->validated());

        return $this->success(new NewsArticleResource($article), 'Article created successfully', 201);
    }

    /**
     * Update article.
     * 
     * @urlParam newsArticle string required The article UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam title string The article title. Example: Updated Title
     * @bodyParam content string The article content.
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Article updated successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function update(UpdateNewsArticleRequest $request, NewsArticle $newsArticle): JsonResponse
    {
        $this->authorize('update', $newsArticle);

        $newsArticle->update($request->validated());

        return $this->success(new NewsArticleResource($newsArticle), 'Article updated successfully');
    }

    /**
     * Approve for publication.
     * 
     * @urlParam newsArticle string required The article UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Article approved successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function approve(Request $request, NewsArticle $newsArticle): JsonResponse
    {
        $this->authorize('update', $newsArticle);

        $newsArticle->update(['processed' => true]);

        return $this->success(new NewsArticleResource($newsArticle), 'Article approved successfully');
    }

    /**
     * Reject article.
     * 
     * @urlParam newsArticle string required The article UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Article rejected",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function reject(Request $request, NewsArticle $newsArticle): JsonResponse
    {
        $this->authorize('update', $newsArticle);

        // TODO: Implement rejection logic
        return $this->success(new NewsArticleResource($newsArticle), 'Article rejected');
    }
}

