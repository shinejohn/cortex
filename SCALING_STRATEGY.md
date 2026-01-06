# Day.News Platform - Enterprise Scaling Strategy

> **Note**: This is a generic scaling strategy. For AWS-specific implementation, see `AWS_SCALING_STRATEGY.md` which uses AWS-native services (CloudFront, ElastiCache, RDS, etc.)

## Scale Requirements

- **8,000 communities**
- **8,000 publications daily**
- **10-20 articles per publication = 80,000-160,000 articles/day**
- **Announcements, classifieds, coupons, etc.**
- **Potential: Millions of mobile app users**

## Database Load Analysis

### Without Optimization
- **160,000 articles/day** × **Multiple queries per article** = **500,000+ queries/day**
- **Mobile app users** browsing = **Millions of queries/day**
- **Database will be overwhelmed**

### Required Optimization
- **Target: 95-99% reduction in database queries**
- **Response time: <50ms from cache**
- **Database: <1% of requests hit database**

## Multi-Layer Caching Architecture

### Layer 1: CDN Edge Caching (CloudFront/Cloudflare)
**Cache at edge locations worldwide**

```
User Request → CDN Edge → Cache Hit (95% of requests) → Instant Response
                      ↓
                   Cache Miss → Origin Server → Database
```

**Configuration:**
- **TTL**: 5-15 minutes for articles
- **Cache Key**: Include region, category, page
- **Invalidation**: On post update (selective)
- **Coverage**: 95%+ of requests served from edge

**Impact**: Eliminates 95% of requests before they reach your server

### Layer 2: Application-Level Caching (Redis Cluster)
**Cache API responses in Redis**

```php
// Cache strategy
- Posts list: 5 minutes
- Single post: 15 minutes  
- Categories/Regions: 1 hour (rarely change)
- Search results: 1 minute
- Comments: 2 minutes
```

**Redis Cluster Setup:**
- **Primary**: Write operations
- **Replicas**: Read operations (horizontal scaling)
- **Memory**: 32GB+ per node
- **Persistence**: AOF + RDB snapshots

**Impact**: 90%+ cache hit rate at application level

### Layer 3: Database Query Caching
**Cache expensive queries**

```php
// Cache complex queries
Cache::remember("query:posts:region:{$regionId}:category:{$category}", 300, function() {
    return DayNewsPost::published()
        ->whereHas('regions', fn($q) => $q->where('id', $regionId))
        ->where('category', $category)
        ->with(['author', 'regions'])
        ->get();
});
```

**Impact**: Reduces database load by 80%+

### Layer 4: Database Read Replicas
**Separate read and write operations**

```
Primary DB (Write) → Replicas (Read)
```

**Setup:**
- **Primary**: Handles writes, updates, deletes
- **Replicas**: 3-5 read replicas for queries
- **Load Balancing**: Distribute reads across replicas
- **Lag**: <100ms replication lag acceptable

**Impact**: Distributes read load across multiple databases

### Layer 5: Database Optimization

#### Indexing Strategy
```sql
-- Critical indexes
CREATE INDEX idx_posts_published ON day_news_posts(published_at, status);
CREATE INDEX idx_posts_category ON day_news_posts(category, published_at);
CREATE INDEX idx_posts_region ON day_news_post_region(region_id, day_news_post_id);
CREATE INDEX idx_posts_slug ON day_news_posts(slug);
CREATE INDEX idx_posts_workspace ON day_news_posts(workspace_id, published_at);

-- Composite indexes for common queries
CREATE INDEX idx_posts_region_category ON day_news_posts(category, published_at) 
    INCLUDE (id, title, excerpt, featured_image);
```

#### Partitioning (Optional for extreme scale)
```sql
-- Partition by date (if table gets too large)
PARTITION BY RANGE (DATE(published_at));
```

#### Connection Pooling
- **PgBouncer**: Connection pooler
- **Max connections**: 200-500 per database
- **Pool size**: 20-50 connections per app instance

### Layer 6: API Response Optimization

#### Only Send Required Data
```php
// Don't send full content in list views
public function index(Request $request): JsonResponse
{
    $posts = DayNewsPost::published()
        ->select([
            'id', 'title', 'slug', 'excerpt', 
            'featured_image', 'published_at', 
            'category', 'view_count'
        ]) // Only needed fields
        ->with(['author:id,name', 'regions:id,name']) // Minimal relations
        ->paginate(20);
    
    return response()->json($data);
}
```

#### Pagination Limits
- **Default**: 20 items per page
- **Max**: 50 items per page
- **Cursor-based pagination** for better performance

#### Lazy Loading
- Load full content only when viewing article
- List views: Title, excerpt, image only

### Layer 7: Mobile App Optimization

#### Aggressive Client-Side Caching
```typescript
// Cache for longer periods
staleTime: 15 * 60 * 1000, // 15 minutes
gcTime: 60 * 60 * 1000,    // 1 hour
```

#### Prefetching
```typescript
// Prefetch next page while user scrolls
useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});
```

#### Background Sync
- Sync in background when app opens
- Update cache silently
- User sees fresh data without waiting

## Implementation Priority

### Phase 1: Critical (Week 1)
1. ✅ **Redis Caching** - Application-level cache
2. ✅ **Database Indexing** - Optimize queries
3. ✅ **API Response Optimization** - Only send needed data
4. ✅ **Connection Pooling** - PgBouncer setup

### Phase 2: High Impact (Week 2-3)
5. **CDN Caching** - CloudFront/Cloudflare
6. **Read Replicas** - Database scaling
7. **Cache Invalidation** - Smart invalidation system
8. **Monitoring** - Cache hit rates, query performance

### Phase 3: Optimization (Week 4+)
9. **Query Optimization** - Analyze slow queries
10. **Partitioning** - If needed for extreme scale
11. **GraphQL** - Consider for flexible queries
12. **Elasticsearch** - For search functionality

## Expected Performance

### Before Optimization
- **Database Queries**: 100% of requests
- **Response Time**: 200-500ms
- **Database Load**: 100% capacity
- **Cost**: High (database scaling)

### After Full Optimization
- **Database Queries**: 1-2% of requests (98% reduction)
- **Response Time**: 10-50ms (from cache)
- **Database Load**: 5-10% capacity
- **Cost**: Lower (cache is cheaper than database)

## Cost Analysis

### Database Scaling (Without Caching)
- **RDS Instance**: $500-2000/month (large instance)
- **Read Replicas**: $500-2000/month each
- **Total**: $2000-6000/month

### With Caching
- **Redis Cluster**: $200-500/month
- **CDN**: $50-200/month (CloudFront)
- **Smaller Database**: $200-500/month
- **Total**: $450-1200/month

**Savings: 60-80% cost reduction**

## Monitoring & Alerts

### Key Metrics
1. **Cache Hit Rate**: Target >95%
2. **Database Query Rate**: Target <100 queries/second
3. **Response Time**: P95 <100ms
4. **Database CPU**: <50%
5. **Cache Memory Usage**: <80%

### Alerts
- Cache hit rate drops below 90%
- Database CPU >80%
- Response time P95 >200ms
- Database connection pool exhausted

## Mobile App Updates Needed

### 1. Aggressive Caching
```typescript
// Increase cache times
staleTime: 15 * 60 * 1000, // 15 minutes
gcTime: 60 * 60 * 1000,    // 1 hour
```

### 2. Infinite Scroll with Prefetching
```typescript
// Load next page before user reaches bottom
useInfiniteQuery({
  queryKey: ['posts', category, region],
  queryFn: fetchPosts,
  getNextPageParam: (lastPage) => lastPage.nextPage,
});
```

### 3. Background Sync
```typescript
// Sync in background when app opens
useEffect(() => {
  queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });
}, []);
```

### 4. Optimistic Updates
```typescript
// Update UI immediately, sync in background
queryClient.setQueryData(['posts'], (old) => {
  return [...old, newPost];
});
```

## Database Schema Optimizations

### 1. Archive Old Data
```sql
-- Move old articles to archive table
CREATE TABLE day_news_posts_archive AS 
SELECT * FROM day_news_posts 
WHERE published_at < NOW() - INTERVAL '1 year';
```

### 2. Materialized Views (For Analytics)
```sql
CREATE MATERIALIZED VIEW mv_daily_post_counts AS
SELECT 
    DATE(published_at) as date,
    category,
    COUNT(*) as count
FROM day_news_posts
WHERE published_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(published_at), category;

-- Refresh periodically
REFRESH MATERIALIZED VIEW mv_daily_post_counts;
```

### 3. Denormalization (Selective)
```sql
-- Add computed columns for common queries
ALTER TABLE day_news_posts 
ADD COLUMN region_count INT GENERATED ALWAYS AS (
    SELECT COUNT(*) FROM day_news_post_region 
    WHERE day_news_post_id = id
) STORED;
```

## Rate Limiting

### API Rate Limits
```php
// Prevent abuse
RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});
```

### Per-Endpoint Limits
- **Posts List**: 60 requests/minute
- **Single Post**: 120 requests/minute
- **Search**: 30 requests/minute
- **Comments**: 30 requests/minute

## Disaster Recovery

### Cache Warming
```php
// Warm cache after deployment
php artisan cache:warm-posts
php artisan cache:warm-regions
```

### Fallback Strategy
```php
// If cache fails, still serve from database
try {
    return Cache::get($key);
} catch (Exception $e) {
    Log::error('Cache failure', ['error' => $e]);
    return $this->fetchFromDatabase();
}
```

## Testing at Scale

### Load Testing
- **Tools**: Apache JMeter, k6, Artillery
- **Target**: 10,000 requests/second
- **Duration**: 1 hour sustained load
- **Metrics**: Response time, error rate, cache hit rate

### Stress Testing
- **Scenario**: Cache failure
- **Test**: Database handles full load
- **Recovery**: Cache restoration time

## Conclusion

With this multi-layer approach:
- **98%+ reduction in database queries**
- **10-50ms response times**
- **60-80% cost savings**
- **Scalable to millions of users**

The key is **layering**: Each layer reduces load for the next, creating exponential efficiency gains.

