<?php

declare(strict_types=1);

namespace App\Services\News;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

final class ScrapingBeeService
{
    private readonly string $apiKey;

    private readonly string $baseUrl;

    public function __construct()
    {
        $apiKey = config('news-workflow.apis.scrapingbee_key');
        if (empty($apiKey)) {
            throw new \RuntimeException('ScrapingBee API key not configured. Please set SCRAPINGBEE_KEY in your .env file.');
        }
        $this->apiKey = $apiKey;
        $this->baseUrl = 'https://app.scrapingbee.com/api/v1';
    }

    /**
     * Scrape a URL and return its HTML content
     */
    public function scrapeUrl(string $url): string
    {
        try {
            return $this->retryWithBackoff(function () use ($url) {
                return $this->fetchUrl($url);
            });
        } catch (Exception $e) {
            Log::error('ScrapingBee URL scrape failed', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Extract main content from HTML
     */
    public function extractMainContent(string $html): string
    {
        // Remove script and style tags
        $html = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $html);
        $html = preg_replace('/<style\b[^>]*>(.*?)<\/style>/is', '', $html);

        // Remove HTML tags but keep text
        $text = strip_tags($html);

        // Clean up whitespace
        $text = preg_replace('/\s+/', ' ', $text);
        $text = mb_trim($text);

        return $text;
    }

    /**
     * Search for a claim across multiple source URLs
     */
    public function searchForClaim(string $claim, array $sourceUrls): array
    {
        $results = [];
        $maxSources = config('news-workflow.fact_checking.max_sources_per_claim', 3);
        $checkedSources = 0;

        foreach ($sourceUrls as $url) {
            if ($checkedSources >= $maxSources) {
                break;
            }

            try {
                $html = $this->scrapeUrl($url);
                $content = $this->extractMainContent($html);

                // Search for claim or related keywords in content
                $claimFound = $this->searchClaimInContent($claim, $content);

                $results[] = [
                    'url' => $url,
                    'claim_found' => $claimFound,
                    'evidence' => $claimFound ? $this->extractRelevantContext($claim, $content) : null,
                    'scraped_at' => now()->toIso8601String(),
                ];

                $checkedSources++;
            } catch (Exception $e) {
                Log::warning('ScrapingBee claim search failed for URL', [
                    'url' => $url,
                    'claim' => $claim,
                    'error' => $e->getMessage(),
                ]);

                $results[] = [
                    'url' => $url,
                    'claim_found' => false,
                    'evidence' => null,
                    'error' => $e->getMessage(),
                    'scraped_at' => now()->toIso8601String(),
                ];

                $checkedSources++;
            }
        }

        return $results;
    }

    /**
     * Fetch URL content via ScrapingBee API
     */
    private function fetchUrl(string $url): string
    {
        $response = Http::timeout(60)->get($this->baseUrl, [
            'api_key' => $this->apiKey,
            'url' => $url,
            'render_js' => 'false', // Set to true if JavaScript rendering needed
            'premium_proxy' => 'false',
            'country_code' => 'us',
        ]);

        if (! $response->successful()) {
            throw new Exception("ScrapingBee request failed: {$response->status()}");
        }

        return $response->body();
    }

    /**
     * Search for claim in content using fuzzy matching
     */
    private function searchClaimInContent(string $claim, string $content): bool
    {
        // Normalize both claim and content
        $normalizedClaim = mb_strtolower(mb_trim($claim));
        $normalizedContent = mb_strtolower($content);

        // Direct substring match
        if (str_contains($normalizedContent, $normalizedClaim)) {
            return true;
        }

        // Extract key terms from claim (words longer than 3 characters)
        $claimWords = array_filter(
            explode(' ', $normalizedClaim),
            fn ($word) => mb_strlen($word) > 3
        );

        if (empty($claimWords)) {
            return false;
        }

        // Check if majority of key terms are present
        $foundWords = 0;
        foreach ($claimWords as $word) {
            if (str_contains($normalizedContent, $word)) {
                $foundWords++;
            }
        }

        // Consider claim found if at least 70% of key words are present
        $threshold = 0.7;

        return ($foundWords / count($claimWords)) >= $threshold;
    }

    /**
     * Extract relevant context around the claim
     */
    private function extractRelevantContext(string $claim, string $content, int $contextLength = 500): string
    {
        $normalizedClaim = mb_strtolower(mb_trim($claim));
        $normalizedContent = mb_strtolower($content);

        // Find position of claim or first key term
        $position = mb_strpos($normalizedContent, $normalizedClaim);

        if ($position === false) {
            // Try to find first key term
            $claimWords = array_filter(
                explode(' ', $normalizedClaim),
                fn ($word) => mb_strlen($word) > 3
            );

            foreach ($claimWords as $word) {
                $position = mb_strpos($normalizedContent, $word);
                if ($position !== false) {
                    break;
                }
            }
        }

        if ($position === false) {
            // Return beginning of content if claim not found
            return mb_substr($content, 0, $contextLength).'...';
        }

        // Extract context around the found position
        $start = max(0, $position - ($contextLength / 2));
        $length = $contextLength;

        $context = mb_substr($content, (int) $start, $length);

        // Add ellipsis if not at start/end
        if ($start > 0) {
            $context = '...'.$context;
        }

        if (($start + $length) < mb_strlen($content)) {
            $context .= '...';
        }

        return $context;
    }

    /**
     * Retry logic with exponential backoff
     */
    private function retryWithBackoff(callable $callback, int $maxAttempts = 3): mixed
    {
        $attempt = 0;

        while ($attempt < $maxAttempts) {
            try {
                return $callback();
            } catch (Exception $e) {
                $attempt++;

                if ($attempt >= $maxAttempts) {
                    throw $e;
                }

                $delay = pow(2, $attempt) * config('news-workflow.error_handling.retry_delay_seconds', 5);
                sleep($delay);

                Log::warning('ScrapingBee request retry', [
                    'attempt' => $attempt,
                    'max_attempts' => $maxAttempts,
                    'delay' => $delay,
                ]);
            }
        }

        throw new Exception('Retry failed');
    }
}
