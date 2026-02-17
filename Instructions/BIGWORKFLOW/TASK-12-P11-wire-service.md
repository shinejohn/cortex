# TASK-12-P11: Create Wire Service Tables + WireServiceCollectionService

## Context

Wire services (PR Newswire, Business Wire, GlobeNewswire) provide a steady stream of press releases. These enter through Pipeline B (RSS → RawContent) and need geographic dateline parsing to map to active communities.

**Depends on:** TASK-09 (ContentRoutingService routes classified content to Pipeline A).

### Existing Infrastructure

- `RssCollectionService` EXISTS — handles RSS feed polling
- `CollectionMethod` model EXISTS — has RSS, email, scrape types
- `RawContent` model EXISTS — handles all content intake
- `NewsSource` model EXISTS — needs `TYPE_WIRE_SERVICE` constant

---

## Objective

Create wire service feed tables, add wire service constants, and create `WireServiceCollectionService` with geographic dateline parsing.

---

## Files to Create

### 1. CREATE: Migration

**File:** `database/migrations/2026_02_16_000005_create_wire_service_tables.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wire_service_feeds', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('service_provider'); // pr_newswire|business_wire|globenewswire
            $table->string('feed_url');
            $table->string('feed_format')->default('rss'); // rss|atom|api
            $table->jsonb('geographic_filters')->nullable(); // state codes to include
            $table->jsonb('industry_filters')->nullable();
            $table->boolean('is_enabled')->default(true);
            $table->timestamp('last_polled_at')->nullable();
            $table->integer('polling_interval_minutes')->default(15);
            $table->timestamps();
        });

        Schema::create('wire_service_runs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('feed_id');
            $table->integer('items_found')->default(0);
            $table->integer('items_new')->default(0);
            $table->integer('items_duplicate')->default(0);
            $table->integer('items_geographic_match')->default(0);
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->text('error')->nullable();

            $table->foreign('feed_id')->references('id')->on('wire_service_feeds')->cascadeOnDelete();
            $table->index(['feed_id', 'started_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wire_service_runs');
        Schema::dropIfExists('wire_service_feeds');
    }
};
```

### 2. MODIFY: NewsSource.php — Add Wire Service Constant

```php
// Add these constants to the existing NewsSource model:
public const TYPE_WIRE_SERVICE = 'wire_service';
public const SUBTYPE_PR_NEWSWIRE = 'pr_newswire';
public const SUBTYPE_BUSINESS_WIRE = 'business_wire';
public const SUBTYPE_GLOBENEWSWIRE = 'globenewswire';
```

### 3. MODIFY: CollectionMethod.php — Add Wire Service Type

```php
// Add this constant:
public const TYPE_WIRE_SERVICE = 'wire_service';
```

### 4. CREATE: WireServiceCollectionService

**File:** `app/Services/Newsroom/WireServiceCollectionService.php`

```php
<?php

declare(strict_types=1);

namespace App\Services\Newsroom;

use App\Models\Community;
use App\Models\RawContent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WireServiceCollectionService
{
    private const DATELINE_PATTERN = '/^([A-Z][A-Za-z\s\.]+),\s*([A-Z]{2})\s*[-–—]/';

    public function __construct(
        private readonly RssCollectionService $rssService,
    ) {}

    /**
     * Poll all enabled wire service feeds.
     */
    public function pollAllFeeds(): array
    {
        $feeds = DB::table('wire_service_feeds')->where('is_enabled', true)->get();
        $totalStats = ['feeds_polled' => 0, 'items_found' => 0, 'items_new' => 0, 'geographic_matches' => 0];

        foreach ($feeds as $feed) {
            try {
                $stats = $this->pollFeed($feed);
                $totalStats['feeds_polled']++;
                $totalStats['items_found'] += $stats['items_found'];
                $totalStats['items_new'] += $stats['items_new'];
                $totalStats['geographic_matches'] += $stats['geographic_matches'];
            } catch (\Exception $e) {
                Log::error('Wire service feed poll failed', ['feed' => $feed->name, 'error' => $e->getMessage()]);
            }
        }

        return $totalStats;
    }

    /**
     * Poll a single wire service feed.
     */
    public function pollFeed(object $feed): array
    {
        $runId = (string) \Illuminate\Support\Str::uuid();
        DB::table('wire_service_runs')->insert([
            'id' => $runId,
            'feed_id' => $feed->id,
            'started_at' => now(),
            'items_found' => 0,
        ]);

        try {
            $response = Http::timeout(30)->get($feed->feed_url);
            if (!$response->successful()) throw new \Exception("HTTP {$response->status()}");

            $items = $this->parseRssFeed($response->body());
            $stats = ['items_found' => count($items), 'items_new' => 0, 'geographic_matches' => 0];

            foreach ($items as $item) {
                // Dedup by content hash
                $hash = hash('sha256', ($item['title'] ?? '') . '|' . ($item['link'] ?? ''));
                if (RawContent::where('content_hash', $hash)->exists()) continue;

                // Parse geographic dateline
                $geo = $this->parseDateline($item['content'] ?? $item['description'] ?? '');

                // Find matching community
                $communityId = null;
                $regionId = null;
                if ($geo) {
                    $community = Community::where('name', 'ILIKE', "%{$geo['city']}%")
                        ->where(function ($q) use ($geo) {
                            $q->where('state', $geo['state'])
                                ->orWhere('state_code', $geo['state']);
                        })
                        ->first();

                    if ($community) {
                        $communityId = $community->id;
                        $regionId = $community->regions()->first()?->id;
                        $stats['geographic_matches']++;
                    }
                }

                // Only store if we have a geographic match (or no filter set)
                $geoFilters = json_decode($feed->geographic_filters ?? '[]', true);
                if (!empty($geoFilters) && $geo && !in_array($geo['state'], $geoFilters)) {
                    continue;
                }

                RawContent::create([
                    'source_url' => $item['link'] ?? null,
                    'source_title' => $item['title'] ?? 'Untitled',
                    'source_content' => $item['content'] ?? $item['description'] ?? '',
                    'source_excerpt' => substr($item['description'] ?? '', 0, 500),
                    'source_published_at' => isset($item['pubDate']) ? \Carbon\Carbon::parse($item['pubDate']) : now(),
                    'content_hash' => $hash,
                    'collected_at' => now(),
                    'collection_method' => 'wire_service',
                    'community_id' => $communityId,
                    'region_id' => $regionId,
                    'raw_metadata' => ['wire_service' => $feed->service_provider, 'dateline' => $geo],
                    'classification_status' => RawContent::CLASS_PENDING,
                    'processing_status' => RawContent::PROC_PENDING,
                ]);

                $stats['items_new']++;
            }

            DB::table('wire_service_feeds')->where('id', $feed->id)->update(['last_polled_at' => now()]);
            DB::table('wire_service_runs')->where('id', $runId)->update([
                'completed_at' => now(),
                'items_found' => $stats['items_found'],
                'items_new' => $stats['items_new'],
                'items_geographic_match' => $stats['geographic_matches'],
            ]);

            return $stats;

        } catch (\Exception $e) {
            DB::table('wire_service_runs')->where('id', $runId)->update([
                'completed_at' => now(), 'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    private function parseDateline(string $content): ?array
    {
        if (preg_match(self::DATELINE_PATTERN, $content, $matches)) {
            return ['city' => trim($matches[1]), 'state' => trim($matches[2])];
        }
        return null;
    }

    private function parseRssFeed(string $xml): array
    {
        $items = [];
        try {
            $rss = simplexml_load_string($xml);
            if (!$rss) return [];

            foreach ($rss->channel->item ?? [] as $item) {
                $items[] = [
                    'title' => (string) $item->title,
                    'link' => (string) $item->link,
                    'description' => (string) $item->description,
                    'content' => (string) ($item->children('content', true)->encoded ?? $item->description),
                    'pubDate' => (string) $item->pubDate,
                ];
            }
        } catch (\Exception $e) {
            Log::warning('RSS parse failed', ['error' => $e->getMessage()]);
        }
        return $items;
    }
}
```

### 5. CREATE: Database Seeder for Initial Feeds

**File:** `database/seeders/WireServiceFeedSeeder.php`

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WireServiceFeedSeeder extends Seeder
{
    public function run(): void
    {
        $feeds = [
            ['name' => 'PR Newswire - All', 'service_provider' => 'pr_newswire', 'feed_url' => 'https://www.prnewswire.com/rss/news-releases-list.rss'],
            ['name' => 'Business Wire - All', 'service_provider' => 'business_wire', 'feed_url' => 'https://feed.businesswire.com/rss/home/?rss=G1QFDERJXkJeEFpRWA=='],
            ['name' => 'GlobeNewswire - All', 'service_provider' => 'globenewswire', 'feed_url' => 'https://www.globenewswire.com/RssFeed/subjectcode/01-Products%2fServices/feedTitle/GlobeNewswire%20-%20Products%20and%20Services'],
        ];

        foreach ($feeds as $feed) {
            DB::table('wire_service_feeds')->insert([
                'id' => Str::uuid(),
                'name' => $feed['name'],
                'service_provider' => $feed['service_provider'],
                'feed_url' => $feed['feed_url'],
                'is_enabled' => true,
                'polling_interval_minutes' => 15,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
```

---

## Verification

```bash
php artisan migrate
php artisan db:seed --class=WireServiceFeedSeeder

php artisan tinker --execute="
    echo 'wire_service_feeds: ' . DB::table('wire_service_feeds')->count() . ' feeds' . PHP_EOL;
    echo 'WireServiceCollectionService: ' . (class_exists(\App\Services\Newsroom\WireServiceCollectionService::class) ? 'OK' : 'MISSING') . PHP_EOL;
"
```
