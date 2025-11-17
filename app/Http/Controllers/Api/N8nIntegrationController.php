<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\DayNewsPost;
use App\Models\Region;
use App\Models\RssFeed;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

final class N8nIntegrationController extends Controller
{
    /**
     * Get all active regions
     */
    public function getRegions(Request $request): JsonResponse
    {
        $regions = Region::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'type', 'parent_id', 'latitude', 'longitude']);

        return response()->json([
            'success' => true,
            'data' => $regions,
            'total' => $regions->count(),
        ]);
    }

    /**
     * Add or update a business (upsert by google_place_id)
     */
    public function upsertBusiness(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'google_place_id' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'website' => ['nullable', 'url', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:50'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:100'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'categories' => ['nullable', 'array'],
            'rating' => ['nullable', 'numeric', 'between:0,5'],
            'reviews_count' => ['nullable', 'integer', 'min:0'],
            'opening_hours' => ['nullable', 'array'],
            'images' => ['nullable', 'array'],
            'serp_metadata' => ['nullable', 'array'],
            // SERP API: Multiple identifiers
            'data_id' => ['nullable', 'string', 'max:255'],
            'data_cid' => ['nullable', 'string', 'max:255'],
            'lsig' => ['nullable', 'string', 'max:255'],
            'provider_id' => ['nullable', 'string', 'max:255'],
            'local_services_cid' => ['nullable', 'string', 'max:255'],
            'local_services_bid' => ['nullable', 'string', 'max:255'],
            'local_services_pid' => ['nullable', 'string', 'max:255'],
            // SERP API: Source tracking
            'serp_source' => ['nullable', 'string', 'in:local,maps,local_services'],
            'serp_last_synced_at' => ['nullable', 'date'],
            // SERP API: Business type
            'primary_type' => ['nullable', 'string', 'max:255'],
            'type_id' => ['nullable', 'string', 'max:255'],
            'type_ids' => ['nullable', 'array'],
            // SERP API: Pricing and hours
            'price_level' => ['nullable', 'string', 'max:10'],
            'open_state' => ['nullable', 'string', 'max:50'],
            'hours_display' => ['nullable', 'string', 'max:255'],
            // SERP API: Local Services
            'google_badge' => ['nullable', 'string', 'max:100'],
            'service_area' => ['nullable', 'array'],
            'years_in_business' => ['nullable', 'integer', 'min:0'],
            'bookings_nearby' => ['nullable', 'integer', 'min:0'],
            // SERP API: Enhanced verification
            'verification_status' => ['nullable', 'string', 'in:unverified,claimed,verified,google_guaranteed'],
            'verified_at' => ['nullable', 'date'],
            'claimed_at' => ['nullable', 'date'],
            // SERP API: Service options and URLs
            'service_options' => ['nullable', 'array'],
            'reserve_url' => ['nullable', 'url', 'max:255'],
            'order_online_url' => ['nullable', 'url', 'max:255'],
            'region_ids' => ['nullable', 'array'],
            'region_ids.*' => ['uuid', 'exists:regions,id'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $businessData = $request->only([
                'google_place_id',
                'name',
                'description',
                'website',
                'phone',
                'email',
                'address',
                'city',
                'state',
                'postal_code',
                'country',
                'latitude',
                'longitude',
                'categories',
                'rating',
                'reviews_count',
                'opening_hours',
                'images',
                'serp_metadata',
                // SERP API: Multiple identifiers
                'data_id',
                'data_cid',
                'lsig',
                'provider_id',
                'local_services_cid',
                'local_services_bid',
                'local_services_pid',
                // SERP API: Source tracking
                'serp_source',
                'serp_last_synced_at',
                // SERP API: Business type
                'primary_type',
                'type_id',
                'type_ids',
                // SERP API: Pricing and hours
                'price_level',
                'open_state',
                'hours_display',
                // SERP API: Local Services
                'google_badge',
                'service_area',
                'years_in_business',
                'bookings_nearby',
                // SERP API: Enhanced verification
                'verification_status',
                'verified_at',
                'claimed_at',
                // SERP API: Service options and URLs
                'service_options',
                'reserve_url',
                'order_online_url',
            ]);

            if (empty($businessData['slug'])) {
                $businessData['slug'] = Str::slug($businessData['name']);
            }

            $business = Business::updateOrCreate(
                ['google_place_id' => $businessData['google_place_id']],
                $businessData
            );

            if ($request->has('region_ids') && is_array($request->input('region_ids'))) {
                $business->regions()->sync($request->input('region_ids'));
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $business->load('regions'),
                'message' => 'Business saved successfully',
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to save business',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all feeds for a specific business
     */
    public function getBusinessFeeds(Request $request, string $businessId): JsonResponse
    {
        $business = Business::find($businessId);

        if ($business === null) {
            return response()->json([
                'success' => false,
                'message' => 'Business not found',
            ], 404);
        }

        $feeds = $business->rssFeeds()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $feeds,
            'total' => $feeds->count(),
        ]);
    }

    /**
     * Add or update an RSS feed
     */
    public function upsertFeed(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'business_id' => ['required', 'uuid', 'exists:businesses,id'],
            'url' => ['required', 'url', 'max:255'],
            'feed_type' => ['nullable', 'string', 'in:blog,news,events,articles,podcast,video,other'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'metadata' => ['nullable', 'array'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $feedData = $request->only([
                'business_id',
                'url',
                'feed_type',
                'title',
                'description',
                'metadata',
            ]);

            $feed = RssFeed::updateOrCreate(
                [
                    'business_id' => $feedData['business_id'],
                    'url' => $feedData['url'],
                ],
                $feedData
            );

            return response()->json([
                'success' => true,
                'data' => $feed,
                'message' => 'Feed saved successfully',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save feed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all active and healthy feeds
     */
    public function getAllFeeds(Request $request): JsonResponse
    {
        $query = RssFeed::with('business')
            ->where('status', 'active');

        if ($request->has('health_status')) {
            $query->where('health_status', $request->input('health_status'));
        }

        if ($request->has('feed_type')) {
            $query->where('feed_type', $request->input('feed_type'));
        }

        $feeds = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $feeds,
            'total' => $feeds->count(),
        ]);
    }

    /**
     * Update feed health status
     */
    public function updateFeedHealth(Request $request, string $feedId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'health_status' => ['required', 'string', 'in:healthy,degraded,unhealthy'],
            'last_error' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:active,inactive,broken'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $feed = RssFeed::find($feedId);

        if ($feed === null) {
            return response()->json([
                'success' => false,
                'message' => 'Feed not found',
            ], 404);
        }

        try {
            $updateData = [
                'health_status' => $request->input('health_status'),
                'last_checked_at' => now(),
            ];

            if ($request->has('last_error')) {
                $updateData['last_error'] = $request->input('last_error');
            }

            if ($request->input('health_status') === 'healthy') {
                $updateData['last_successful_fetch_at'] = now();
                $updateData['last_error'] = null;
            }

            if ($request->has('status')) {
                $updateData['status'] = $request->input('status');
            }

            $feed->update($updateData);

            return response()->json([
                'success' => true,
                'data' => $feed,
                'message' => 'Feed health updated successfully',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update feed health',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Publish a generated article
     */
    public function publishArticle(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'workspace_id' => ['required', 'uuid', 'exists:workspaces,id'],
            'author_id' => ['required', 'uuid', 'exists:users,id'],
            'rss_feed_id' => ['nullable', 'uuid', 'exists:rss_feeds,id'],
            'rss_feed_item_id' => ['nullable', 'uuid', 'exists:rss_feed_items,id'],
            'source_type' => ['nullable', 'string', 'max:50'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'excerpt' => ['nullable', 'string'],
            'featured_image' => ['nullable', 'url'],
            'category' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', 'string', 'max:100'],
            'metadata' => ['nullable', 'array'],
            'region_ids' => ['nullable', 'array'],
            'region_ids.*' => ['uuid', 'exists:regions,id'],
            'status' => ['nullable', 'string', 'in:draft,published'],
            'published_at' => ['nullable', 'date'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $postData = $request->only([
                'workspace_id',
                'author_id',
                'rss_feed_id',
                'rss_feed_item_id',
                'source_type',
                'title',
                'content',
                'excerpt',
                'featured_image',
                'category',
                'type',
                'metadata',
                'status',
            ]);

            $postData['slug'] = Str::slug($postData['title']);
            $postData['status'] = $postData['status'] ?? 'draft';
            $postData['type'] = $postData['type'] ?? 'article';

            if ($request->has('published_at')) {
                $postData['published_at'] = $request->input('published_at');
            } elseif ($postData['status'] === 'published') {
                $postData['published_at'] = now();
            }

            $post = DayNewsPost::create($postData);

            if ($request->has('region_ids') && is_array($request->input('region_ids'))) {
                $post->regions()->sync($request->input('region_ids'));
            }

            if ($request->filled('rss_feed_item_id')) {
                $feedItem = \App\Models\RssFeedItem::find($request->input('rss_feed_item_id'));
                if ($feedItem !== null) {
                    $feedItem->markAsProcessed();
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $post->load('regions', 'rssFeed', 'rssFeedItem'),
                'message' => 'Article published successfully',
            ], 201);
        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to publish article',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update article status (draft to published or vice versa)
     */
    public function updateArticleStatus(Request $request, int $articleId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => ['required', 'string', 'in:draft,published'],
            'published_at' => ['nullable', 'date'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $article = DayNewsPost::find($articleId);

        if ($article === null) {
            return response()->json([
                'success' => false,
                'message' => 'Article not found',
            ], 404);
        }

        try {
            $updateData = [
                'status' => $request->input('status'),
            ];

            if ($request->input('status') === 'published') {
                // If publishing, set published_at if not provided
                $updateData['published_at'] = $request->input('published_at', now());
            } elseif ($request->input('status') === 'draft') {
                // If moving back to draft, clear published_at
                $updateData['published_at'] = null;
            }

            $article->update($updateData);

            return response()->json([
                'success' => true,
                'data' => $article->load('regions', 'rssFeed', 'rssFeedItem'),
                'message' => 'Article status updated successfully',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update article status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
