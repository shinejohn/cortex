<?php

declare(strict_types=1);

namespace App\Services\Newsroom;

use App\Models\PlatformProfile;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Platform Detector Service
 *
 * Identifies what platform/CMS a website runs on using HTTP headers and HTML signatures.
 * Fast, cheap (single GET request), runs on every new source URL.
 *
 * Detection happens at the PLATFORM level — a WordPress site in Clearwater behaves
 * identically to a WordPress site in Tampa. Learn once, apply everywhere.
 */
final class PlatformDetectorService
{
    /**
     * Detect the platform for a given URL.
     * Returns the matched PlatformProfile or null if unknown.
     */
    public function detect(string $url): ?PlatformProfile
    {
        try {
            $startTime = microtime(true);

            $response = Http::timeout(15)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; DayNewsBot/1.0)'])
                ->get($url);

            $responseTimeMs = (int) ((microtime(true) - $startTime) * 1000);

            if (! $response->successful()) {
                Log::debug('PlatformDetector: HTTP failed', ['url' => $url, 'status' => $response->status()]);

                return null;
            }

            $headers = $response->headers();
            $html = $response->body();
            // Only need first 15KB for detection — saves memory
            $htmlHead = mb_substr($html, 0, 15000);

            $signals = $this->extractSignals($url, $headers, $htmlHead);
            $slug = $this->matchPlatform($signals);

            if ($slug) {
                Log::info('PlatformDetector: Detected', [
                    'url' => $url,
                    'platform' => $slug,
                    'response_time_ms' => $responseTimeMs,
                ]);

                return PlatformProfile::findBySlug($slug);
            }

            Log::debug('PlatformDetector: No match', ['url' => $url]);

            return null;

        } catch (Exception $e) {
            Log::warning('PlatformDetector: Exception', ['url' => $url, 'error' => $e->getMessage()]);

            return null;
        }
    }

    /**
     * Detect platform and return the slug string (without DB lookup).
     * Useful for classification without needing a stored profile.
     */
    public function detectSlug(string $url): ?string
    {
        try {
            $response = Http::timeout(15)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; DayNewsBot/1.0)'])
                ->get($url);

            if (! $response->successful()) {
                return null;
            }

            $signals = $this->extractSignals($url, $response->headers(), mb_substr($response->body(), 0, 15000));

            return $this->matchPlatform($signals);

        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Detect platform from already-fetched response (avoids double fetch).
     */
    public function detectFromResponse(string $url, array $headers, string $html): ?PlatformProfile
    {
        $signals = $this->extractSignals($url, $headers, mb_substr($html, 0, 15000));
        $slug = $this->matchPlatform($signals);

        return $slug ? PlatformProfile::findBySlug($slug) : null;
    }

    /**
     * Bulk detect platforms for multiple URLs.
     * Returns ['url' => 'slug'] map.
     */
    public function detectBatch(array $urls): array
    {
        $results = [];
        foreach ($urls as $url) {
            $results[$url] = $this->detectSlug($url);
        }

        return $results;
    }

    /**
     * Extract all detectable signals from URL, headers, and HTML.
     */
    private function extractSignals(string $url, array $headers, string $html): array
    {
        $htmlLower = mb_strtolower($html);

        return [
            'url' => $url,
            'server' => $this->getHeader($headers, 'Server'),
            'x_powered_by' => $this->getHeader($headers, 'X-Powered-By'),
            'x_generator' => $this->getHeader($headers, 'X-Generator'),
            'meta_generator' => $this->extractMeta($html, 'generator'),
            'html_lower' => $htmlLower,
        ];
    }

    /**
     * Match signals against known platform patterns.
     * Returns platform slug or null.
     *
     * Order matters — more specific patterns first, generic ones last.
     */
    private function matchPlatform(array $s): ?string
    {
        $html = $s['html_lower'];
        $gen = mb_strtolower($s['meta_generator'] ?? '');
        $server = mb_strtolower($s['server'] ?? '');
        $powered = mb_strtolower($s['x_powered_by'] ?? '');
        $url = mb_strtolower($s['url']);

        // === GOVERNMENT PLATFORMS (check first — most specific) ===

        // CivicPlus
        if (str_contains($html, 'civicplus') || str_contains($html, 'civicengage')
            || str_contains($html, '/agendacenter') || str_contains($html, '/alertcenter')
            || str_contains($html, '/documentcenter') || str_contains($html, '/rss.aspx')) {
            return 'civicplus';
        }

        // Granicus
        if (str_contains($html, 'granicus.com') || str_contains($html, 'legistar.com')
            || str_contains($url, 'granicus.com')) {
            return 'granicus';
        }

        // Legistar (standalone)
        if (str_contains($url, 'legistar.com') || str_contains($html, 'legistar')) {
            return 'legistar';
        }

        // Nixle
        if (str_contains($url, 'nixle.com') || str_contains($html, 'nixle')) {
            return 'nixle';
        }

        // CivicLive / MuniCode
        if (str_contains($html, 'civiclive') || str_contains($html, 'municode')) {
            return 'civiclive';
        }

        // === CMS PLATFORMS ===

        // WordPress
        if (str_contains($html, '/wp-content/') || str_contains($html, '/wp-includes/')
            || str_contains($gen, 'wordpress') || str_contains($html, 'wp-json')
            || str_contains($html, 'wordpress.org')) {
            return 'wordpress';
        }

        // Drupal
        if (str_contains($gen, 'drupal') || str_contains($html, 'drupal.js')
            || str_contains($html, '/sites/default/files') || str_contains($powered, 'drupal')) {
            return 'drupal';
        }

        // Joomla
        if (str_contains($gen, 'joomla') || str_contains($html, '/media/jui/')
            || str_contains($html, 'joomla')) {
            return 'joomla';
        }

        // Ghost
        if (str_contains($gen, 'ghost') || str_contains($html, 'ghost.org')
            || str_contains($html, 'content/images')) {
            return 'ghost';
        }

        // === WEBSITE BUILDERS ===

        // Squarespace
        if (str_contains($html, 'squarespace.com') || str_contains($html, 'sqsp.net')
            || str_contains($gen, 'squarespace')) {
            return 'squarespace';
        }

        // Wix
        if (str_contains($html, 'wix.com') || str_contains($html, 'wixsite.com')
            || str_contains($html, 'static.wixstatic.com') || str_contains($gen, 'wix')) {
            return 'wix';
        }

        // Weebly
        if (str_contains($html, 'weebly.com') || str_contains($gen, 'weebly')
            || str_contains($html, 'editmysite.com')) {
            return 'weebly';
        }

        // GoDaddy Website Builder
        if (str_contains($html, 'godaddy.com') || str_contains($html, 'secureserver.net')
            || str_contains($gen, 'godaddy')) {
            return 'godaddy';
        }

        // === ECOMMERCE ===

        // Shopify
        if (str_contains($html, 'cdn.shopify.com') || str_contains($html, 'shopify.com')
            || str_contains($html, 'myshopify.com')) {
            return 'shopify';
        }

        // === EVENT / CALENDAR PLATFORMS ===

        // Eventbrite
        if (str_contains($url, 'eventbrite.com') || str_contains($html, 'eventbrite')) {
            return 'eventbrite';
        }

        // Facebook Events
        if (str_contains($url, 'facebook.com/events') || str_contains($url, 'fb.com')) {
            return 'facebook';
        }

        // === NEWS PLATFORMS ===

        // Patch.com
        if (str_contains($url, 'patch.com') || str_contains($html, 'patch.com')) {
            return 'patch';
        }

        // Substack
        if (str_contains($url, 'substack.com') || str_contains($html, 'substack.com')
            || str_contains($html, 'substackcdn.com')) {
            return 'substack';
        }

        // === GENERIC DETECTION ===

        // Static HTML (no CMS detected, simple server)
        if (($server === 'apache' || $server === 'nginx') && empty($gen)
            && ! str_contains($powered, 'php') && ! str_contains($html, 'react')
            && ! str_contains($html, 'angular') && ! str_contains($html, 'vue')) {
            return 'static_html';
        }

        // SPA / JS-heavy (React, Vue, Angular — needs JS rendering)
        if (str_contains($html, 'id="root"') || str_contains($html, 'id="app"')
            || str_contains($html, 'id="__next"') || str_contains($html, 'id="__nuxt"')) {
            // Check if body is mostly empty (SPA that hasn't rendered)
            if (preg_match('/<body[^>]*>(.*?)<\/body>/si', $html, $bodyMatch)) {
                $bodyText = strip_tags($bodyMatch[1] ?? '');
                if (mb_strlen(mb_trim($bodyText)) < 200) {
                    return 'spa_javascript';
                }
            }
        }

        return null;
    }

    /**
     * Extract meta tag content by name
     */
    private function extractMeta(string $html, string $name): ?string
    {
        // name="generator" content="..."
        if (preg_match('/<meta\s+[^>]*name=["\']'.preg_quote($name, '/').'["\'][^>]*content=["\']([^"\']+)/i', $html, $m)) {
            return $m[1];
        }
        // content="..." name="generator"
        if (preg_match('/<meta\s+[^>]*content=["\']([^"\']+)["\'][^>]*name=["\']'.preg_quote($name, '/').'/i', $html, $m)) {
            return $m[1];
        }

        return null;
    }

    /**
     * Get a header value (case-insensitive)
     */
    private function getHeader(array $headers, string $key): ?string
    {
        // Headers can be keyed differently
        foreach ($headers as $k => $v) {
            if (mb_strtolower($k) === mb_strtolower($key)) {
                return is_array($v) ? ($v[0] ?? null) : $v;
            }
        }

        return null;
    }
}
