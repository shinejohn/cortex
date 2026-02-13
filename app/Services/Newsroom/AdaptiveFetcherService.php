<?php

declare(strict_types=1);

namespace App\Services\Newsroom;

use App\Models\CollectionMethod;
use App\Models\FetchPerformanceLog;
use App\Models\NewsSource;
use App\Models\PlatformProfile;
use App\Models\RawContent;
use DOMDocument;
use DOMXPath;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

/**
 * Adaptive Fetcher Service
 *
 * The brain of the collection system. For any URL:
 * 1. Check if source has a known platform profile
 * 2. If yes → use the proven best method for that platform
 * 3. If no → detect platform, then fetch
 * 4. If detection fails → use "strip HTML + AI extract" approach
 * 5. Log performance to feed back into platform profiles
 *
 * This replaces hardcoded scraping logic with platform-aware intelligence.
 */
final class AdaptiveFetcherService
{
    public function __construct(
        private readonly PlatformDetectorService $detector,
        private readonly RssCollectionService $rssService,
        private readonly WebScrapingService $scrapingService,
    ) {}

    /**
     * Fetch content from a source using the best available method.
     * This is the main entry point — call this instead of WebScrapingService directly.
     */
    public function fetch(CollectionMethod $method): array
    {
        $source = $method->source;
        $profile = $this->getOrDetectProfile($source);
        $startTime = microtime(true);

        try {
            $result = match (true) {
                // If method is RSS, always use RSS service
                $method->method_type === CollectionMethod::TYPE_RSS => $this->fetchViaRss($method),

                // If we have a profile with a proven method, use it
                $profile !== null && $profile->isTrusted() => $this->fetchWithProfile($method, $profile),

                // If method has manual override, respect it
                $method->requires_javascript => $this->fetchWithPlaywright($method),

                // Default: try simple HTTP first, fall back to AI extract
                default => $this->fetchWithFallback($method, $profile),
            };

            $this->logPerformance($source, $method, $profile, $startTime, $result);

            return $result['items'];

        } catch (Exception $e) {
            $this->logFailure($source, $method, $profile, $startTime, $e->getMessage());
            throw $e;
        }
    }

    /**
     * Auto-configure a CollectionMethod for a source based on platform detection.
     * Call this when creating new sources to auto-set the best collection strategy.
     */
    public function autoConfigureMethod(NewsSource $source): ?CollectionMethod
    {
        $url = $source->website_url;
        if (empty($url)) {
            return null;
        }

        $profile = $this->getOrDetectProfile($source);

        // Check for RSS first — always preferred
        $rssUrl = $this->discoverRss($url, $profile);
        if ($rssUrl) {
            return $this->createOrUpdateMethod($source, [
                'method_type' => CollectionMethod::TYPE_RSS,
                'endpoint_url' => $rssUrl,
                'is_auto_configured' => true,
                'requires_javascript' => false,
                'auto_detected_config' => [
                    'platform' => $profile?->slug,
                    'rss_discovered' => true,
                    'detected_at' => now()->toIso8601String(),
                ],
            ]);
        }

        // No RSS — set up scraping based on platform profile
        $config = $this->buildScrapeConfig($profile);

        return $this->createOrUpdateMethod($source, [
            'method_type' => CollectionMethod::TYPE_SCRAPE,
            'endpoint_url' => $url,
            'requires_javascript' => $profile?->needs_js_rendering ?? false,
            'is_auto_configured' => true,
            'scrape_config' => $config,
            'auto_detected_config' => [
                'platform' => $profile?->slug,
                'fetch_method' => $profile?->best_fetch_method ?? 'ai_extract',
                'detected_at' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Get existing profile or detect one for a source.
     */
    private function getOrDetectProfile(NewsSource $source): ?PlatformProfile
    {
        // Already detected?
        if ($source->platform_profile_id) {
            return PlatformProfile::find($source->platform_profile_id);
        }

        // Try to detect
        $url = $source->website_url;
        if (empty($url)) {
            return null;
        }

        $profile = $this->detector->detect($url);

        if ($profile) {
            $source->update([
                'platform_profile_id' => $profile->id,
                'detected_platform_slug' => $profile->slug,
                'platform_detected_at' => now(),
            ]);
        }

        return $profile;
    }

    /**
     * Fetch using the proven method for a known platform.
     */
    private function fetchWithProfile(CollectionMethod $method, PlatformProfile $profile): array
    {
        $fetchMethod = $profile->best_fetch_method;

        Log::info('AdaptiveFetcher: Using profile', [
            'source' => $method->source->name,
            'platform' => $profile->slug,
            'method' => $fetchMethod,
        ]);

        return match ($fetchMethod) {
            PlatformProfile::METHOD_HTTP_GET => $this->fetchSimpleHttp($method, $profile),
            PlatformProfile::METHOD_PLAYWRIGHT => $this->fetchWithPlaywright($method),
            PlatformProfile::METHOD_AI_EXTRACT => $this->fetchWithAiExtract($method, $profile),
            PlatformProfile::METHOD_RSS => $this->fetchViaRss($method),
            PlatformProfile::METHOD_SCRAPINGBEE => $this->fetchWithScrapingBee($method, false),
            PlatformProfile::METHOD_SCRAPINGBEE_JS => $this->fetchWithScrapingBee($method, true),
            default => $this->fetchWithFallback($method, $profile),
        };
    }

    /**
     * Simple HTTP GET + DOM extraction using platform-aware selectors.
     */
    private function fetchSimpleHttp(CollectionMethod $method, ?PlatformProfile $profile = null): array
    {
        $response = Http::timeout(30)
            ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; DayNewsBot/1.0)'])
            ->get($method->endpoint_url);

        if (! $response->successful()) {
            throw new Exception("HTTP GET failed: {$response->status()}");
        }

        $html = $response->body();
        $items = $this->extractWithSelectors($html, $method, $profile);

        // If selectors found nothing, fall through to AI extract
        if (empty($items)) {
            return $this->aiExtractFromHtml($html, $method);
        }

        return [
            'items' => $this->storeItems($method, $items),
            'fetch_method' => PlatformProfile::METHOD_HTTP_GET,
            'content_length' => mb_strlen($html),
            'items_count' => count($items),
        ];
    }

    /**
     * The key innovation: strip ALL HTML, feed raw text to AI, let it find news and events.
     * Works on ANY website regardless of DOM structure.
     */
    private function fetchWithAiExtract(CollectionMethod $method, ?PlatformProfile $profile = null): array
    {
        $response = Http::timeout(30)
            ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; DayNewsBot/1.0)'])
            ->get($method->endpoint_url);

        if (! $response->successful()) {
            throw new Exception("HTTP GET failed: {$response->status()}");
        }

        return $this->aiExtractFromHtml($response->body(), $method);
    }

    /**
     * Core AI extraction: strip HTML → clean text → store as single RawContent for classification.
     * The ContentClassificationService will handle finding news items, events, etc.
     */
    private function aiExtractFromHtml(string $html, CollectionMethod $method): array
    {
        $text = $this->stripHtmlToText($html);

        // If barely any text, nothing to extract
        if (mb_strlen(mb_trim($text)) < 100) {
            return ['items' => [], 'fetch_method' => PlatformProfile::METHOD_AI_EXTRACT, 'content_length' => 0, 'items_count' => 0];
        }

        // Store the full page text as a single RawContent item.
        // ContentClassificationService will analyze it and may split into multiple pieces.
        $title = $this->extractPageTitle($html) ?? $method->source->name.' - Update';
        $url = $method->endpoint_url;
        $hash = RawContent::generateContentHash($title, $url);

        if (RawContent::isDuplicate($hash, $method->source->community_id)) {
            return ['items' => [], 'fetch_method' => PlatformProfile::METHOD_AI_EXTRACT, 'content_length' => mb_strlen($text), 'items_count' => 0];
        }

        $item = RawContent::create([
            'source_id' => $method->source_id,
            'collection_method_id' => $method->id,
            'community_id' => $method->source->community_id,
            'region_id' => $method->source->region_id,
            'source_url' => $url,
            'source_title' => $title,
            'source_content' => $text,
            'source_html' => mb_substr($html, 0, 100000), // Keep first 100KB of HTML for reference
            'content_hash' => $hash,
            'collection_method' => 'ai_extract',
            'raw_metadata' => [
                'extraction_method' => 'adaptive_ai_extract',
                'platform' => $method->source->detected_platform_slug,
                'text_length' => mb_strlen($text),
                'html_length' => mb_strlen($html),
            ],
        ]);

        $method->recordCollection(1, 0);

        return [
            'items' => [$item],
            'fetch_method' => PlatformProfile::METHOD_AI_EXTRACT,
            'content_length' => mb_strlen($text),
            'items_count' => 1,
        ];
    }

    /**
     * Try simple HTTP first; if it finds nothing, fall back to AI extract.
     */
    private function fetchWithFallback(CollectionMethod $method, ?PlatformProfile $profile = null): array
    {
        try {
            $response = Http::timeout(30)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; DayNewsBot/1.0)'])
                ->get($method->endpoint_url);

            if (! $response->successful()) {
                throw new Exception("HTTP failed: {$response->status()}");
            }

            $html = $response->body();

            // Try DOM extraction first
            $items = $this->extractWithSelectors($html, $method, $profile);
            if (! empty($items)) {
                return [
                    'items' => $this->storeItems($method, $items),
                    'fetch_method' => PlatformProfile::METHOD_HTTP_GET,
                    'content_length' => mb_strlen($html),
                    'items_count' => count($items),
                ];
            }

            // DOM found nothing — check if page is JS-rendered (mostly empty body)
            $textContent = strip_tags($html);
            if (mb_strlen(mb_trim($textContent)) < 200) {
                // Probably needs JS rendering — try Playwright if available
                if ($this->playwrightAvailable()) {
                    return $this->fetchWithPlaywright($method);
                }

                // Otherwise ScrapingBee with JS
                return $this->fetchWithScrapingBee($method, true);
            }

            // Page has content but selectors didn't match — use AI extract
            return $this->aiExtractFromHtml($html, $method);

        } catch (Exception $e) {
            Log::warning('AdaptiveFetcher: Fallback chain failed', [
                'source' => $method->source->name,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Fetch via RSS (delegate to existing service).
     */
    private function fetchViaRss(CollectionMethod $method): array
    {
        $items = $this->rssService->collect($method);

        return [
            'items' => $items,
            'fetch_method' => PlatformProfile::METHOD_RSS,
            'content_length' => 0,
            'items_count' => count($items),
        ];
    }

    /**
     * Fetch with Playwright (delegate to existing service).
     */
    private function fetchWithPlaywright(CollectionMethod $method): array
    {
        $items = $this->scrapingService->scrape($method);

        return [
            'items' => $items,
            'fetch_method' => PlatformProfile::METHOD_PLAYWRIGHT,
            'content_length' => 0,
            'items_count' => count($items),
        ];
    }

    /**
     * Fetch with ScrapingBee.
     */
    private function fetchWithScrapingBee(CollectionMethod $method, bool $renderJs): array
    {
        $apiKey = config('news-workflow.apis.scrapingbee_key');
        if (empty($apiKey)) {
            // Fall back to AI extract if ScrapingBee not configured
            return $this->fetchWithAiExtract($method);
        }

        $response = Http::timeout(60)->get('https://app.scrapingbee.com/api/v1', [
            'api_key' => $apiKey,
            'url' => $method->endpoint_url,
            'render_js' => $renderJs ? 'true' : 'false',
            'premium_proxy' => 'false',
            'country_code' => 'us',
        ]);

        if (! $response->successful()) {
            throw new Exception("ScrapingBee failed: {$response->status()}");
        }

        return $this->aiExtractFromHtml($response->body(), $method);
    }

    // ========================================================================
    // Content Extraction Helpers
    // ========================================================================

    /**
     * Try to extract items using known selectors (platform-aware or from config).
     */
    private function extractWithSelectors(string $html, CollectionMethod $method, ?PlatformProfile $profile = null): array
    {
        libxml_use_internal_errors(true);
        $dom = new DOMDocument();
        $dom->loadHTML($html, LIBXML_NOERROR);
        $xpath = new DOMXPath($dom);
        libxml_use_internal_errors(false);

        // Priority: method config > platform profile > generic
        $config = $method->scrape_config ?? [];
        $selectors = $config['selectors'] ?? [];

        $listSelector = $selectors['list'] ?? null;
        $titleSelector = $selectors['title'] ?? null;

        // Fall back to platform profile selectors
        if (! $listSelector && $profile && ! empty($profile->content_selectors)) {
            $listSelector = implode(' | ', array_map(
                fn ($s) => $this->cssToXpath($s),
                $profile->content_selectors
            ));
        }

        // Fall back to generic selectors
        if (! $listSelector) {
            $listSelector = '//article | //*[contains(@class, "news-item")] | //*[contains(@class, "post")] | //*[contains(@class, "entry")]';
        } else {
            $listSelector = $this->cssToXpath($listSelector);
        }

        $items = [];
        $nodes = $xpath->query($listSelector);

        if ($nodes === false) {
            return [];
        }

        foreach ($nodes as $node) {
            $title = mb_trim($xpath->evaluate('string(.//h1 | .//h2 | .//h3 | .//*[contains(@class, "title")])', $node));
            if (empty($title)) {
                continue;
            }

            $items[] = [
                'title' => $title,
                'content' => mb_trim($xpath->evaluate('string(.//p)', $node)),
                'url' => $xpath->evaluate('string(.//a/@href)', $node),
            ];
        }

        return $items;
    }

    /**
     * Strip HTML to clean readable text.
     * Removes scripts, styles, nav, footer, ads — keeps the meat.
     */
    private function stripHtmlToText(string $html): string
    {
        // Remove elements that are never content
        $html = preg_replace('/<script\b[^>]*>.*?<\/script>/si', '', $html);
        $html = preg_replace('/<style\b[^>]*>.*?<\/style>/si', '', $html);
        $html = preg_replace('/<nav\b[^>]*>.*?<\/nav>/si', '', $html);
        $html = preg_replace('/<footer\b[^>]*>.*?<\/footer>/si', '', $html);
        $html = preg_replace('/<header\b[^>]*>.*?<\/header>/si', '', $html);
        $html = preg_replace('/<aside\b[^>]*>.*?<\/aside>/si', '', $html);
        $html = preg_replace('/<!--.*?-->/s', '', $html);

        // Remove common ad/noise patterns
        $html = preg_replace('/<[^>]*(cookie|consent|popup|modal|overlay|sidebar|widget|advertisement)[^>]*>.*?<\/[^>]+>/si', '', $html);

        // Convert block elements to newlines for readability
        $html = preg_replace('/<\/(p|div|li|h[1-6]|tr|br|hr)[^>]*>/i', "\n", $html);

        // Strip remaining tags
        $text = strip_tags($html);

        // Clean whitespace
        $text = html_entity_decode($text, ENT_QUOTES, 'UTF-8');
        $text = preg_replace('/[ \t]+/', ' ', $text);           // Collapse horizontal whitespace
        $text = preg_replace('/\n\s*\n\s*\n/', "\n\n", $text);  // Max 2 consecutive newlines
        $text = mb_trim($text);

        // Truncate to reasonable size for AI processing (roughly 8K tokens)
        if (mb_strlen($text) > 32000) {
            $text = mb_substr($text, 0, 32000)."\n\n[Content truncated]";
        }

        return $text;
    }

    /**
     * Extract page title from HTML.
     */
    private function extractPageTitle(string $html): ?string
    {
        if (preg_match('/<title[^>]*>([^<]+)<\/title>/i', $html, $m)) {
            $title = html_entity_decode(mb_trim($m[1]), ENT_QUOTES, 'UTF-8');
            // Remove common suffixes like "| City of Tampa" or "- WordPress"
            $title = preg_replace('/\s*[\|–—-]\s*[^|–—-]+$/', '', $title);

            return $title ?: null;
        }

        return null;
    }

    /**
     * Try to discover RSS feed URL for a website.
     */
    private function discoverRss(string $url, ?PlatformProfile $profile = null): ?string
    {
        try {
            $response = Http::timeout(15)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; DayNewsBot/1.0)'])
                ->get($url);

            if (! $response->successful()) {
                return null;
            }

            $html = $response->body();

            // Check <link> tags for RSS/Atom feeds
            if (preg_match('/<link[^>]+type=["\']application\/(rss|atom)\+xml["\'][^>]+href=["\']([^"\']+)/i', $html, $m)) {
                return $this->absoluteUrl($m[2], $url);
            }

            // Check platform-specific RSS patterns
            if ($profile && ! empty($profile->rss_patterns)) {
                $base = mb_rtrim($url, '/');
                foreach ($profile->rss_patterns as $pattern) {
                    $testUrl = $base.$pattern;
                    if ($this->isValidRss($testUrl)) {
                        return $testUrl;
                    }
                }
            }

            // Try common patterns
            $base = mb_rtrim($url, '/');
            $commonPaths = ['/feed', '/rss', '/feed.xml', '/rss.xml', '/atom.xml', '/feed/rss2'];
            foreach ($commonPaths as $path) {
                if ($this->isValidRss($base.$path)) {
                    return $base.$path;
                }
            }

        } catch (Exception $e) {
            // RSS discovery is best-effort
        }

        return null;
    }

    /**
     * Test if a URL returns valid RSS/Atom XML.
     */
    private function isValidRss(string $url): bool
    {
        try {
            $response = Http::timeout(10)->get($url);
            if (! $response->successful()) {
                return false;
            }

            $body = $response->body();

            return str_contains($body, '<rss') || str_contains($body, '<feed') || str_contains($body, '<channel');
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Store extracted items as RawContent (reusing WebScrapingService pattern).
     */
    private function storeItems(CollectionMethod $method, array $items): array
    {
        $stored = [];
        $duplicates = 0;

        foreach ($items as $item) {
            $title = mb_trim($item['title'] ?? '');
            if (empty($title)) {
                continue;
            }

            $url = $this->absoluteUrl($item['url'] ?? '', $method->endpoint_url);
            $hash = RawContent::generateContentHash($title, $url);

            if (RawContent::isDuplicate($hash, $method->source->community_id)) {
                $duplicates++;

                continue;
            }

            $stored[] = RawContent::create([
                'source_id' => $method->source_id,
                'collection_method_id' => $method->id,
                'community_id' => $method->source->community_id,
                'region_id' => $method->source->region_id,
                'source_url' => $url,
                'source_title' => $title,
                'source_content' => $item['content'] ?? '',
                'content_hash' => $hash,
                'collection_method' => 'adaptive_scrape',
            ]);
        }

        $method->recordCollection(count($stored), $duplicates);

        return $stored;
    }

    // ========================================================================
    // Performance Logging
    // ========================================================================

    private function logPerformance(NewsSource $source, CollectionMethod $method, ?PlatformProfile $profile, float $startTime, array $result): void
    {
        $responseTimeMs = (int) ((microtime(true) - $startTime) * 1000);

        FetchPerformanceLog::create([
            'source_id' => $source->id,
            'collection_method_id' => $method->id,
            'platform_slug' => $profile?->slug ?? $source->detected_platform_slug,
            'fetch_method' => $result['fetch_method'] ?? 'unknown',
            'success' => true,
            'response_time_ms' => $responseTimeMs,
            'content_length' => $result['content_length'] ?? 0,
            'items_extracted' => $result['items_count'] ?? count($result['items'] ?? []),
            'content_changed' => true, // TODO: implement hash comparison
        ]);

        // Feed back into platform profile
        if ($profile) {
            $profile->recordFetchResult($responseTimeMs, $result['items_count'] > 0 ? 80.0 : 20.0);
        }
    }

    private function logFailure(NewsSource $source, CollectionMethod $method, ?PlatformProfile $profile, float $startTime, string $error): void
    {
        $responseTimeMs = (int) ((microtime(true) - $startTime) * 1000);

        FetchPerformanceLog::create([
            'source_id' => $source->id,
            'collection_method_id' => $method->id,
            'platform_slug' => $profile?->slug ?? $source->detected_platform_slug,
            'fetch_method' => 'unknown',
            'success' => false,
            'response_time_ms' => $responseTimeMs,
            'error_message' => mb_substr($error, 0, 500),
        ]);
    }

    // ========================================================================
    // Utilities
    // ========================================================================

    private function buildScrapeConfig(?PlatformProfile $profile): array
    {
        if (! $profile) {
            return ['method' => 'ai_extract'];
        }

        return [
            'method' => $profile->best_fetch_method,
            'platform' => $profile->slug,
            'selectors' => [
                'list' => $profile->content_selectors[0] ?? 'article',
                'title' => 'h1, h2, h3, .title',
            ],
            'noise_remove' => $profile->noise_selectors ?? [],
        ];
    }

    private function createOrUpdateMethod(NewsSource $source, array $data): CollectionMethod
    {
        return CollectionMethod::updateOrCreate(
            ['source_id' => $source->id, 'method_type' => $data['method_type'], 'is_auto_configured' => true],
            array_merge($data, ['name' => "{$source->name} - Auto", 'is_enabled' => true, 'is_primary' => true])
        );
    }

    private function absoluteUrl(?string $url, string $base): ?string
    {
        if (! $url) {
            return null;
        }
        if (str_starts_with($url, 'http')) {
            return $url;
        }
        if (str_starts_with($url, '//')) {
            return 'https:'.$url;
        }
        if (str_starts_with($url, '/')) {
            $p = parse_url($base);

            return ($p['scheme'] ?? 'https').'://'.($p['host'] ?? '').$url;
        }

        return mb_rtrim($base, '/').'/'.$url;
    }

    private function cssToXpath(string $css): string
    {
        // Simple CSS → XPath conversion for common patterns
        $css = mb_trim($css);
        if (str_starts_with($css, '//') || str_starts_with($css, './/')) {
            return $css;
        } // Already XPath

        if (str_starts_with($css, '.')) {
            $class = mb_substr($css, 1);

            return "//*[contains(@class, '{$class}')]";
        }
        if (str_starts_with($css, '#')) {
            $id = mb_substr($css, 1);

            return "//*[@id='{$id}']";
        }

        return "//{$css}";
    }

    private function playwrightAvailable(): bool
    {
        try {
            $result = Process::timeout(5)->run(['which', 'npx']);

            return $result->successful();
        } catch (Exception $e) {
            return false;
        }
    }
}
