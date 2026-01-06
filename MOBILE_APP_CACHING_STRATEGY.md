# Mobile App Caching Strategy - Minimize Database Impact

## The Challenge

- **SSR (Web)**: Pages rendered once, cached, minimal DB hits
- **Mobile App**: Each API call hits database directly
- **Goal**: Cache API responses to reduce database load

## Solution: Multi-Layer Caching Strategy

### Layer 1: Laravel Response Caching (Server-Side)

Cache API responses in Laravel using Redis/Memcached.

#### Implementation

```php
<?php
// app/Http/Controllers/Api/DayNews/PostController.php

namespace App\Http\Controllers\Api\DayNews;

use App\Http\Controllers\Controller;
use App\Models\DayNewsPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

final class PostController extends Controller
{
    /**
     * List posts with caching
     */
    public function index(Request $request): JsonResponse
    {
        // Build cache key from request parameters
        $cacheKey = 'api:posts:' . md5(json_encode([
            'category' => $request->input('category'),
            'region' => $request->input('region'),
            'search' => $request->input('search'),
            'page' => $request->input('page', 1),
        ]));

        // Cache for 5 minutes (300 seconds)
        $data = Cache::remember($cacheKey, 300, function () use ($request) {
            $postsQuery = DayNewsPost::published()
                ->with(['author', 'regions', 'workspace'])
                ->orderBy('published_at', 'desc');

            if ($request->has('category')) {
                $postsQuery->where('category', $request->input('category'));
            }

            if ($request->has('region')) {
                $postsQuery->whereHas('regions', function ($q) use ($request) {
                    $q->where('regions.id', $request->input('region'));
                });
            }

            if ($request->has('search')) {
                $search = $request->input('search');
                $postsQuery->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%");
                });
            }

            $perPage = min((int) $request->input('per_page', 20), 50);
            $posts = $postsQuery->paginate($perPage);

            return [
                'data' => $posts->map(fn ($post) => $this->formatPost($post)),
                'meta' => [
                    'current_page' => $posts->currentPage(),
                    'last_page' => $posts->lastPage(),
                    'per_page' => $posts->perPage(),
                    'total' => $posts->total(),
                ],
            ];
        });

        return response()->json($data);
    }

    /**
     * Get single post with longer cache (posts don't change often)
     */
    public function show(int $id): JsonResponse
    {
        $cacheKey = "api:post:{$id}";
        
        // Cache individual posts for 15 minutes
        $data = Cache::remember($cacheKey, 900, function () use ($id) {
            $post = DayNewsPost::where('id', $id)
                ->published()
                ->with(['author', 'writerAgent', 'regions', 'workspace'])
                ->firstOrFail();

            return ['data' => $this->formatPost($post)];
        });

        // Track view (async, doesn't block response)
        dispatch(function () use ($id) {
            DayNewsPost::where('id', $id)->increment('view_count');
        })->afterResponse();

        return response()->json($data);
    }

    /**
     * Invalidate cache when post is updated
     */
    public function invalidateCache(int $postId): void
    {
        Cache::forget("api:post:{$postId}");
        Cache::flush(); // Or use tags: Cache::tags(['posts'])->flush();
    }
}
```

#### Cache Invalidation on Post Update

```php
<?php
// app/Models/DayNewsPost.php

protected static function booted(): void
{
    // Clear cache when post is updated
    static::updated(function (DayNewsPost $post) {
        Cache::forget("api:post:{$post->id}");
        Cache::forget("api:post:slug:{$post->slug}");
        
        // Clear list caches (or use cache tags)
        Cache::tags(['posts'])->flush();
    });

    static::created(function (DayNewsPost $post) {
        Cache::tags(['posts'])->flush();
    });
}
```

### Layer 2: HTTP Caching Headers (Browser/CDN Cache)

Add HTTP cache headers so CDN and mobile clients can cache responses.

```php
<?php
// app/Http/Controllers/Api/DayNews/PostController.php

public function index(Request $request): JsonResponse
{
    $data = Cache::remember($cacheKey, 300, function () use ($request) {
        // ... fetch data
    });

    return response()
        ->json($data)
        ->header('Cache-Control', 'public, max-age=300') // 5 minutes
        ->header('ETag', md5(json_encode($data)))
        ->header('Last-Modified', now()->toRfc7231String());
}

public function show(int $id): JsonResponse
{
    $data = Cache::remember($cacheKey, 900, function () use ($id) {
        // ... fetch data
    });

    $post = DayNewsPost::find($id);
    
    return response()
        ->json($data)
        ->header('Cache-Control', 'public, max-age=900') // 15 minutes
        ->header('ETag', md5(json_encode($data)))
        ->header('Last-Modified', $post->updated_at->toRfc7231String());
}
```

### Layer 3: CDN Caching (AWS CloudFront)

Cache API responses at the CDN level before they hit your server.

**CloudFront Configuration:**
- Cache based on query string parameters
- Cache-Control headers respected
- TTL: 5-15 minutes for posts
- Invalidate on post updates

```php
<?php
// When post is updated, invalidate CloudFront cache
use Aws\CloudFront\CloudFrontClient;

public function invalidateCloudFrontCache(int $postId): void
{
    $cloudfront = new CloudFrontClient([
        'version' => 'latest',
        'region' => 'us-east-1',
    ]);

    $cloudfront->createInvalidation([
        'DistributionId' => config('services.cloudfront.distribution_id'),
        'InvalidationBatch' => [
            'Paths' => [
                'Quantity' => 2,
                'Items' => [
                    "/api/day-news/posts/{$postId}",
                    "/api/day-news/posts/slug/*",
                ],
            ],
            'CallerReference' => 'post-update-' . $postId . '-' . time(),
        ],
    ]);
}
```

### Layer 4: Mobile App Client-Side Caching

Cache responses in the mobile app using React Query or similar.

```typescript
// src/lib/dayNewsApi.ts (Updated with caching)

import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

// Use in hooks
export const useArticles = (category?: string, region?: string) => {
  return useQuery({
    queryKey: ['articles', category, region],
    queryFn: () => dayNewsApi.getPosts({ category, region }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });
};
```

### Layer 5: Database Query Caching

Cache database queries themselves using Laravel's query cache.

```php
<?php
// config/cache.php - Use Redis
'default' => env('CACHE_DRIVER', 'redis'),

// In controller
$posts = Cache::remember("query:posts:{$category}", 300, function () use ($category) {
    return DayNewsPost::published()
        ->where('category', $category)
        ->with(['author', 'regions'])
        ->get();
});
```

## Caching Strategy by Endpoint

### High Traffic, Rarely Changes
- **Posts List**: 5 minutes cache
- **Single Post**: 15 minutes cache
- **Categories**: 1 hour cache (rarely changes)
- **Regions**: 1 hour cache (rarely changes)

### Medium Traffic, Changes Occasionally
- **Comments**: 2 minutes cache
- **Search Results**: 1 minute cache
- **Related Posts**: 5 minutes cache

### Low Traffic, Real-Time
- **User Profile**: No cache (user-specific)
- **Notifications**: No cache (real-time)
- **View Tracking**: Async, doesn't block

## Cache Invalidation Strategy

### Automatic Invalidation
```php
<?php
// app/Observers/DayNewsPostObserver.php

namespace App\Observers;

use App\Models\DayNewsPost;
use Illuminate\Support\Facades\Cache;

class DayNewsPostObserver
{
    public function updated(DayNewsPost $post): void
    {
        // Clear specific post cache
        Cache::forget("api:post:{$post->id}");
        Cache::forget("api:post:slug:{$post->slug}");
        
        // Clear list caches (use tags for efficiency)
        Cache::tags(['posts', "posts:{$post->category}"])->flush();
        
        // Invalidate CDN cache
        $this->invalidateCloudFront($post);
    }

    public function created(DayNewsPost $post): void
    {
        Cache::tags(['posts'])->flush();
    }

    public function deleted(DayNewsPost $post): void
    {
        Cache::forget("api:post:{$post->id}");
        Cache::tags(['posts'])->flush();
    }
}
```

### Manual Invalidation
```php
<?php
// Artisan command for cache management
php artisan cache:clear-posts
php artisan cache:warm-posts
```

## Redis Configuration

```php
<?php
// config/database.php
'redis' => [
    'client' => env('REDIS_CLIENT', 'phpredis'),
    'default' => [
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD', null),
        'port' => env('REDIS_PORT', 6379),
        'database' => env('REDIS_DB', 0),
    ],
    'cache' => [
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD', null),
        'port' => env('REDIS_PORT', 6379),
        'database' => env('REDIS_CACHE_DB', 1),
    ],
],
```

## Performance Comparison

### Without Caching
- **Database Queries**: 100% of requests
- **Response Time**: 200-500ms
- **Database Load**: High

### With Multi-Layer Caching
- **Database Queries**: ~5-10% of requests (cache hit rate 90-95%)
- **Response Time**: 10-50ms (from cache)
- **Database Load**: Low

## Implementation Priority

1. **Phase 1**: Laravel Response Caching (Redis)
2. **Phase 2**: HTTP Cache Headers
3. **Phase 3**: Mobile App Client Caching (React Query)
4. **Phase 4**: CDN Caching (CloudFront)
5. **Phase 5**: Cache Invalidation System

## Monitoring

Track cache hit rates:
```php
// Add to response
return response()->json($data)->header('X-Cache-Status', 'HIT');
// or 'MISS'
```

Monitor Redis:
```bash
redis-cli INFO stats
# Look for: keyspace_hits, keyspace_misses
```

## Best Practices

1. **Cache Keys**: Use descriptive, unique keys
2. **TTL**: Balance freshness vs performance
3. **Invalidation**: Clear cache on updates
4. **Tags**: Use cache tags for bulk invalidation
5. **Monitoring**: Track hit rates and adjust TTLs
6. **Stale-While-Revalidate**: Serve stale data while fetching fresh

## Example: Complete Cached Endpoint

```php
<?php
public function index(Request $request): JsonResponse
{
    $cacheKey = 'api:posts:' . md5(json_encode($request->all()));
    
    $data = Cache::tags(['posts'])->remember($cacheKey, 300, function () use ($request) {
        // Database query here
        return $this->fetchPosts($request);
    });

    $etag = md5(json_encode($data));
    
    // Check if client has cached version
    if ($request->header('If-None-Match') === $etag) {
        return response()->json([], 304); // Not Modified
    }

    return response()
        ->json($data)
        ->header('Cache-Control', 'public, max-age=300')
        ->header('ETag', $etag)
        ->header('X-Cache-Status', 'HIT');
}
```

This multi-layer approach will dramatically reduce database load while keeping data fresh!

