<?php

declare(strict_types=1);

namespace App\Services\News;

use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UnsplashService
{
    private const API_BASE_URL = 'https://api.unsplash.com';

    private const PICSUM_BASE_URL = 'https://picsum.photos';

    private const CACHE_TTL_HOURS = 24;

    public function __construct(
        private readonly ImageStorageService $imageStorage
    ) {}

    /**
     * Search for a relevant image based on keywords.
     *
     * Returns the image URL with proper attribution data, or null if no image found.
     * Falls back to Picsum if Unsplash is not configured or fails.
     */
    public function searchImage(array $keywords, string $orientation = 'landscape'): ?array
    {
        if (! $this->isConfigured()) {
            Log::debug('Unsplash API key not configured, using Picsum fallback');

            return $this->getPicsumImage($orientation);
        }

        // Build search query from keywords
        $query = $this->buildSearchQuery($keywords);

        if (empty($query)) {
            return null;
        }

        // Check cache first
        $cacheKey = 'unsplash:'.md5($query.$orientation);
        $cached = Cache::get($cacheKey);

        if ($cached !== null) {
            Log::debug('Unsplash image found in cache', ['query' => $query]);

            return $cached;
        }

        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => 'Client-ID '.$this->getAccessKey(),
                    'Accept-Version' => 'v1',
                ])
                ->get(self::API_BASE_URL.'/search/photos', [
                    'query' => $query,
                    'orientation' => $orientation,
                    'per_page' => 5,
                    'content_filter' => 'high', // Safe content only
                ]);

            if ($response->failed()) {
                Log::warning('Unsplash API request failed, using Picsum fallback', [
                    'status' => $response->status(),
                    'query' => $query,
                ]);

                return $this->getPicsumImage($orientation);
            }

            $data = $response->json();
            $results = $data['results'] ?? [];

            if (empty($results)) {
                Log::debug('No Unsplash images found for query, using Picsum fallback', ['query' => $query]);

                // Get Picsum fallback and cache it
                $picsumImage = $this->getPicsumImage($orientation);
                Cache::put($cacheKey, $picsumImage ?? [], now()->addHours(self::CACHE_TTL_HOURS));

                return $picsumImage;
            }

            // Pick a random image from the top results for variety
            $photo = $results[array_rand($results)];

            $imageData = $this->formatImageData($photo);

            // Download and store image locally
            $imageData = $this->downloadAndStoreImage($imageData);

            // Cache the result
            Cache::put($cacheKey, $imageData, now()->addHours(self::CACHE_TTL_HOURS));

            // Trigger download tracking (required by Unsplash API guidelines)
            $this->trackDownload($photo);

            Log::info('Unsplash image fetched', [
                'query' => $query,
                'photo_id' => $photo['id'],
            ]);

            return $imageData;
        } catch (Exception $e) {
            Log::error('Unsplash API error, using Picsum fallback', [
                'query' => $query,
                'error' => $e->getMessage(),
            ]);

            return $this->getPicsumImage($orientation);
        }
    }

    /**
     * Get a random image for a topic/category.
     * Falls back to Picsum if Unsplash is not configured or fails.
     */
    public function getRandomImage(string $topic, string $orientation = 'landscape'): ?array
    {
        if (! $this->isConfigured()) {
            return $this->getPicsumImage($orientation);
        }

        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => 'Client-ID '.$this->getAccessKey(),
                    'Accept-Version' => 'v1',
                ])
                ->get(self::API_BASE_URL.'/photos/random', [
                    'query' => $topic,
                    'orientation' => $orientation,
                    'content_filter' => 'high',
                ]);

            if ($response->failed()) {
                return $this->getPicsumImage($orientation);
            }

            $photo = $response->json();

            if (empty($photo) || ! isset($photo['urls'])) {
                return $this->getPicsumImage($orientation);
            }

            $imageData = $this->formatImageData($photo);

            // Download and store image locally
            $imageData = $this->downloadAndStoreImage($imageData);

            $this->trackDownload($photo);

            return $imageData;
        } catch (Exception $e) {
            Log::error('Unsplash random image error, using Picsum fallback', [
                'topic' => $topic,
                'error' => $e->getMessage(),
            ]);

            return $this->getPicsumImage($orientation);
        }
    }

    /**
     * Download and store an image locally.
     *
     * Returns the image data with storage path/disk added.
     */
    public function downloadAndStoreImage(array $imageData): array
    {
        if (! config('news-workflow.unsplash.storage.enabled', true)) {
            return $imageData; // Storage disabled, return as-is
        }

        try {
            $size = config('news-workflow.unsplash.storage.size', 'regular');
            $url = $imageData["{$size}_url"] ?? $imageData['url'];
            $photoId = $imageData['photo_id'] ?? 'unknown';

            $storageData = $this->imageStorage->downloadAndStore($url, $photoId);

            return array_merge($imageData, $storageData);
        } catch (Exception $e) {
            Log::warning('Image storage failed, falling back to URL', [
                'photo_id' => $imageData['photo_id'] ?? 'unknown',
                'error' => $e->getMessage(),
            ]);

            return $imageData; // Return without storage data
        }
    }

    /**
     * Build search query from keywords.
     */
    private function buildSearchQuery(array $keywords): string
    {
        // Filter out common/generic words and limit to top keywords
        $stopWords = [
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
            'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
            'this', 'that', 'these', 'those', 'it', 'its', 'new', 'local',
        ];

        $filtered = array_filter($keywords, function ($word) use ($stopWords) {
            $word = mb_strtolower(mb_trim($word));

            return mb_strlen($word) > 2 && ! in_array($word, $stopWords);
        });

        // Take top 3 keywords for better search results
        $topKeywords = array_slice(array_values($filtered), 0, 3);

        return implode(' ', $topKeywords);
    }

    /**
     * Format photo data with attribution.
     */
    private function formatImageData(array $photo): array
    {
        $user = $photo['user'] ?? [];

        return [
            'url' => $photo['urls']['regular'] ?? $photo['urls']['full'] ?? '',
            'thumb_url' => $photo['urls']['thumb'] ?? '',
            'small_url' => $photo['urls']['small'] ?? '',
            'photographer_name' => $user['name'] ?? 'Unknown',
            'photographer_username' => $user['username'] ?? '',
            'photographer_url' => $this->addUtmParams($user['links']['html'] ?? ''),
            'unsplash_url' => $this->addUtmParams('https://unsplash.com'),
            'photo_id' => $photo['id'] ?? '',
            'alt_description' => $photo['alt_description'] ?? $photo['description'] ?? '',
            'color' => $photo['color'] ?? '#cccccc',
            'width' => $photo['width'] ?? 0,
            'height' => $photo['height'] ?? 0,
            // Attribution HTML as per Unsplash guidelines
            'attribution' => $this->buildAttribution($user, $photo),
        ];
    }

    /**
     * Build attribution HTML as required by Unsplash API guidelines.
     */
    private function buildAttribution(array $user, array $photo): string
    {
        $photographerName = $user['name'] ?? 'Unknown';
        $photographerUrl = $this->addUtmParams($user['links']['html'] ?? '');
        $unsplashUrl = $this->addUtmParams('https://unsplash.com');

        return sprintf(
            'Photo by <a href="%s" target="_blank" rel="noopener noreferrer">%s</a> on <a href="%s" target="_blank" rel="noopener noreferrer">Unsplash</a>',
            $photographerUrl,
            htmlspecialchars($photographerName),
            $unsplashUrl
        );
    }

    /**
     * Add UTM params to a URL for Unsplash attribution tracking.
     */
    private function addUtmParams(string $url): string
    {
        if ($url === '') {
            return '';
        }
        $separator = str_contains($url, '?') ? '&' : '?';

        return $url.$separator.'utm_source='.urlencode(config('app.name')).'&utm_medium=referral';
    }

    /**
     * Track download as required by Unsplash API guidelines.
     *
     * This must be called when an image is actually used/displayed.
     */
    private function trackDownload(array $photo): void
    {
        $downloadLocation = $photo['links']['download_location'] ?? null;

        if (! $downloadLocation) {
            return;
        }

        try {
            Http::timeout(5)
                ->withHeaders([
                    'Authorization' => 'Client-ID '.$this->getAccessKey(),
                ])
                ->get($downloadLocation);
        } catch (Exception $e) {
            Log::debug('Unsplash download tracking failed', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Check if Unsplash is configured.
     */
    private function isConfigured(): bool
    {
        return ! empty($this->getAccessKey());
    }

    /**
     * Get the Unsplash access key.
     */
    private function getAccessKey(): string
    {
        return config('news-workflow.unsplash.access_key', '');
    }

    /**
     * Get a random image from Picsum as fallback.
     *
     * Picsum provides free placeholder images without requiring an API key.
     */
    private function getPicsumImage(string $orientation = 'landscape'): array
    {
        // Determine dimensions based on orientation
        [$width, $height] = match ($orientation) {
            'portrait' => [800, 1200],
            'squarish' => [1000, 1000],
            default => [1200, 800], // landscape
        };

        // Generate a random seed for consistent but varied images
        $seed = random_int(1, 1000);

        // Build Picsum URLs
        $baseUrl = self::PICSUM_BASE_URL;
        $regularUrl = "{$baseUrl}/seed/{$seed}/{$width}/{$height}";
        $thumbUrl = "{$baseUrl}/seed/{$seed}/200/200";
        $smallUrl = "{$baseUrl}/seed/{$seed}/400/300";

        Log::debug('Using Picsum fallback image', [
            'seed' => $seed,
            'orientation' => $orientation,
        ]);

        $imageData = [
            'url' => $regularUrl,
            'thumb_url' => $thumbUrl,
            'small_url' => $smallUrl,
            'regular_url' => $regularUrl,
            'photographer_name' => 'Picsum Photos',
            'photographer_username' => 'picsum',
            'photographer_url' => 'https://picsum.photos',
            'unsplash_url' => '',
            'photo_id' => "picsum-{$seed}",
            'alt_description' => 'Placeholder image from Picsum Photos',
            'color' => '#888888',
            'width' => $width,
            'height' => $height,
            'attribution' => 'Image from <a href="https://picsum.photos" target="_blank" rel="noopener noreferrer">Picsum Photos</a>',
            'is_fallback' => true,
        ];

        // Download and store Picsum image locally
        $imageData = $this->downloadAndStoreImage($imageData);

        return $imageData;
    }
}
