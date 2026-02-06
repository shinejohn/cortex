<?php

declare(strict_types=1);

namespace App\Services\Civic;

use App\Models\CivicSource;
use App\Models\CivicSourcePlatform;
use App\Models\Region;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * Perplexity Discovery Service
 * 
 * Uses Perplexity Sonar API to discover civic source URLs at scale.
 * Can discover sources for individual cities, entire counties, or states.
 * 
 * ARCHITECTURE:
 * 1. Perplexity identifies the URLs (intelligent search)
 * 2. Your code validates and probes the URLs (crawling)  
 * 3. Your code stores the discovered feeds (persistence)
 * 
 * Perplexity is for "intelligence" - finding WHERE sources are.
 * Your code does the "extraction" - actually getting the content.
 * 
 * GRANICUS URL PATTERNS:
 * - Base: https://{city}.granicus.com
 * - Publishers: /ViewPublisher.php?view_id={ID}
 * - RSS: /xml/MediaRSS.php?view_id={ID}
 * - RSS: /boards/rss/{ID}
 */
class PerplexityDiscoveryService
{
    private const API_BASE_URL = 'https://api.perplexity.ai';
    private const MODEL_SONAR = 'sonar';
    private const MODEL_SONAR_PRO = 'sonar-pro';
    private const REQUEST_TIMEOUT = 60;

    private string $apiKey;
    private string $model;
    private ?GranicusMediaService $granicusService = null;
    private ?LegistarService $legistarService = null;
    private ?CivicPlusService $civicPlusService = null;

    public function __construct(
        ?GranicusMediaService $granicusService = null,
        ?LegistarService $legistarService = null,
        ?CivicPlusService $civicPlusService = null
    ) {
        $this->apiKey = config('civic-sources.perplexity.api_key', '');
        $this->model = config('civic-sources.perplexity.model', self::MODEL_SONAR);
        $this->granicusService = $granicusService ?? app(GranicusMediaService::class);
        $this->legistarService = $legistarService ?? app(LegistarService::class);
        $this->civicPlusService = $civicPlusService ?? app(CivicPlusService::class);
    }

    /**
     * Check if Perplexity API is configured
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiKey);
    }

    /**
     * Discover civic sources for a single city
     * 
     * @param string $cityName City name
     * @param string $state State abbreviation (e.g., "FL")
     * @return array Discovered sources and URLs
     */
    public function discoverForCity(string $cityName, string $state): array
    {
        if (!$this->isConfigured()) {
            throw new Exception('Perplexity API key not configured');
        }

        Log::info('PerplexityDiscovery: Discovering for city', [
            'city' => $cityName,
            'state' => $state,
        ]);

        $cacheKey = "perplexity_discovery:{$cityName}:{$state}";
        
        // Check cache (24 hour TTL)
        if ($cached = Cache::get($cacheKey)) {
            Log::info('PerplexityDiscovery: Using cached result', ['city' => $cityName]);
            return $cached;
        }

        $prompt = $this->buildCityDiscoveryPrompt($cityName, $state);
        $response = $this->querySonar($prompt);
        
        $parsed = $this->parseCityDiscoveryResponse($response, $cityName, $state);

        // Cache for 24 hours
        Cache::put($cacheKey, $parsed, now()->addHours(24));

        Log::info('PerplexityDiscovery: City discovery completed', [
            'city' => $cityName,
            'state' => $state,
            'granicus_found' => !empty($parsed['granicus_urls']),
            'legistar_found' => !empty($parsed['legistar_client']),
            'civicplus_found' => !empty($parsed['civicplus_url']),
        ]);

        return $parsed;
    }

    /**
     * Discover civic sources for all cities in a county
     * 
     * @param string $countyName County name
     * @param string $state State abbreviation
     * @return Collection Collection of city discoveries
     */
    public function discoverForCounty(string $countyName, string $state): Collection
    {
        if (!$this->isConfigured()) {
            throw new Exception('Perplexity API key not configured');
        }

        Log::info('PerplexityDiscovery: Discovering for county', [
            'county' => $countyName,
            'state' => $state,
        ]);

        // First, get list of cities in the county
        $cities = $this->getCitiesInCounty($countyName, $state);

        Log::info('PerplexityDiscovery: Found cities in county', [
            'county' => $countyName,
            'city_count' => count($cities),
        ]);

        $discoveries = collect();

        foreach ($cities as $city) {
            try {
                $discovery = $this->discoverForCity($city['name'], $state);
                $discoveries->push([
                    'city' => $city,
                    'discovery' => $discovery,
                ]);

                // Rate limiting - be respectful
                usleep(500000); // 500ms between requests

            } catch (Exception $e) {
                Log::warning('PerplexityDiscovery: City discovery failed', [
                    'city' => $city['name'],
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $discoveries;
    }

    /**
     * Discover civic sources for all counties/cities in a state
     * 
     * @param string $state State abbreviation
     * @param int $limit Max cities to discover (for cost control)
     * @return Collection Collection of discoveries
     */
    public function discoverForState(string $state, int $limit = 100): Collection
    {
        if (!$this->isConfigured()) {
            throw new Exception('Perplexity API key not configured');
        }

        Log::info('PerplexityDiscovery: Discovering for state', [
            'state' => $state,
            'limit' => $limit,
        ]);

        // Get major cities in the state
        $cities = $this->getMajorCitiesInState($state, $limit);

        $discoveries = collect();

        foreach ($cities as $city) {
            try {
                $discovery = $this->discoverForCity($city['name'], $state);
                $discoveries->push([
                    'city' => $city,
                    'discovery' => $discovery,
                ]);

                // Rate limiting
                usleep(500000);

            } catch (Exception $e) {
                Log::warning('PerplexityDiscovery: City discovery failed', [
                    'city' => $city['name'],
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $discoveries;
    }

    /**
     * Get list of cities in a county using Perplexity
     */
    public function getCitiesInCounty(string $countyName, string $state): array
    {
        $prompt = <<<PROMPT
List all incorporated cities, towns, and municipalities in {$countyName} County, {$state}.

Return ONLY a JSON array with this structure:
[
  {"name": "City Name", "population": 50000},
  {"name": "Town Name", "population": 10000}
]

Include approximate population if known. Order by population descending.
Return raw JSON only, no markdown formatting.
PROMPT;

        $response = $this->querySonar($prompt);
        
        return $this->parseJsonFromResponse($response) ?? [];
    }

    /**
     * Get major cities in a state using Perplexity
     */
    public function getMajorCitiesInState(string $state, int $limit = 100): array
    {
        $prompt = <<<PROMPT
List the top {$limit} largest cities and incorporated municipalities in {$state} by population.

Return ONLY a JSON array with this structure:
[
  {"name": "City Name", "county": "County Name", "population": 500000},
  {"name": "Town Name", "county": "County Name", "population": 50000}
]

Return raw JSON only, no markdown formatting.
PROMPT;

        $response = $this->querySonar($prompt);
        
        return $this->parseJsonFromResponse($response) ?? [];
    }

    /**
     * Build the discovery prompt for a city
     */
    private function buildCityDiscoveryPrompt(string $cityName, string $state): string
    {
        return <<<PROMPT
Find official government meeting and agenda resources for {$cityName}, {$state}.

I need to find:
1. The official city/town website URL
2. Any Granicus meeting portal (format: *.granicus.com with ViewPublisher.php links)
3. Any Legistar legislative portal (format: *.legistar.com)
4. RSS feeds for meeting agendas, minutes, or videos
5. If the city uses CivicPlus (look for /AgendaCenter, /AlertCenter, or /rss.aspx endpoints)
6. Any Nixle or Everbridge alert subscription pages

Return your findings as JSON with this exact structure:
{
  "official_website": "https://www.cityname.gov",
  "granicus_urls": [
    {"host": "https://cityname.granicus.com", "view_ids": [1, 2, 5], "description": "City Commission"}
  ],
  "legistar_client": "cityname",
  "legistar_portal": "https://cityname.legistar.com",
  "civicplus_url": "https://www.cityname.gov",
  "civicplus_rss": "https://www.cityname.gov/rss.aspx",
  "nixle_zip_codes": ["33601", "33602"],
  "rss_feeds": [
    {"url": "https://example.com/feed", "type": "agenda", "description": "City Commission Agendas"}
  ],
  "notes": "Any relevant notes about what was found"
}

If a field is not found, use null. Return raw JSON only, no markdown.
PROMPT;
    }

    /**
     * Parse the city discovery response
     */
    private function parseCityDiscoveryResponse(string $response, string $cityName, string $state): array
    {
        $parsed = $this->parseJsonFromResponse($response);

        if (!$parsed) {
            // Try to extract URLs manually
            return $this->extractUrlsFromText($response, $cityName, $state);
        }

        // Ensure all expected keys exist
        return [
            'city_name' => $cityName,
            'state' => $state,
            'official_website' => $parsed['official_website'] ?? null,
            'granicus_urls' => $parsed['granicus_urls'] ?? [],
            'legistar_client' => $parsed['legistar_client'] ?? null,
            'legistar_portal' => $parsed['legistar_portal'] ?? null,
            'civicplus_url' => $parsed['civicplus_url'] ?? null,
            'civicplus_rss' => $parsed['civicplus_rss'] ?? null,
            'nixle_zip_codes' => $parsed['nixle_zip_codes'] ?? [],
            'rss_feeds' => $parsed['rss_feeds'] ?? [],
            'notes' => $parsed['notes'] ?? null,
            'raw_response' => $response,
        ];
    }

    /**
     * Extract URLs from text response when JSON parsing fails
     */
    private function extractUrlsFromText(string $text, string $cityName, string $state): array
    {
        $result = [
            'city_name' => $cityName,
            'state' => $state,
            'official_website' => null,
            'granicus_urls' => [],
            'legistar_client' => null,
            'legistar_portal' => null,
            'civicplus_url' => null,
            'civicplus_rss' => null,
            'nixle_zip_codes' => [],
            'rss_feeds' => [],
            'notes' => 'Extracted from unstructured response',
            'raw_response' => $text,
        ];

        // Extract Granicus URLs
        preg_match_all('/https?:\/\/[\w.-]+\.granicus\.com[^\s"<>)]+/i', $text, $granicusMatches);
        foreach (array_unique($granicusMatches[0] ?? []) as $url) {
            $result['granicus_urls'][] = ['host' => $url, 'view_ids' => [], 'description' => ''];
        }

        // Extract Legistar URLs
        preg_match_all('/https?:\/\/([\w.-]+)\.legistar\.com/i', $text, $legistarMatches);
        if (!empty($legistarMatches[1])) {
            $result['legistar_client'] = $legistarMatches[1][0];
            $result['legistar_portal'] = "https://{$legistarMatches[1][0]}.legistar.com";
        }

        // Extract official website
        preg_match('/https?:\/\/(?:www\.)?[\w.-]+\.(?:gov|org)[^\s"<>)]*/i', $text, $officialMatch);
        if (!empty($officialMatch[0])) {
            $result['official_website'] = $officialMatch[0];
        }

        // Check for CivicPlus indicators
        if (preg_match('/(?:civicplus|\/AgendaCenter|\/AlertCenter|\/rss\.aspx)/i', $text)) {
            $result['civicplus_url'] = $result['official_website'];
            if ($result['official_website']) {
                $result['civicplus_rss'] = rtrim($result['official_website'], '/') . '/rss.aspx';
            }
        }

        // Extract ZIP codes (5 digits)
        preg_match_all('/\b(\d{5})\b/', $text, $zipMatches);
        $result['nixle_zip_codes'] = array_unique($zipMatches[1] ?? []);

        return $result;
    }

    /**
     * Query Perplexity Sonar API
     */
    private function querySonar(string $prompt, bool $usePro = false): string
    {
        $model = $usePro ? self::MODEL_SONAR_PRO : $this->model;

        $response = Http::timeout(self::REQUEST_TIMEOUT)
            ->withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ])
            ->post(self::API_BASE_URL . '/chat/completions', [
                'model' => $model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a helpful assistant that finds official government websites and meeting resources. Always return structured JSON when requested.',
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
                'temperature' => 0.1, // Low temperature for factual responses
                'max_tokens' => 2000,
            ]);

        if (!$response->successful()) {
            throw new Exception("Perplexity API error: HTTP {$response->status()} - {$response->body()}");
        }

        $data = $response->json();

        return $data['choices'][0]['message']['content'] ?? '';
    }

    /**
     * Parse JSON from a response that may contain markdown
     */
    private function parseJsonFromResponse(string $response): ?array
    {
        // Try direct parse first
        $decoded = json_decode($response, true);
        if ($decoded !== null) {
            return $decoded;
        }

        // Try extracting JSON from markdown code blocks
        if (preg_match('/```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/i', $response, $matches)) {
            $decoded = json_decode($matches[1], true);
            if ($decoded !== null) {
                return $decoded;
            }
        }

        // Try finding JSON object/array in the response
        if (preg_match('/(\{[\s\S]*\}|\[[\s\S]*\])/s', $response, $matches)) {
            $decoded = json_decode($matches[1], true);
            if ($decoded !== null) {
                return $decoded;
            }
        }

        return null;
    }

    /**
     * Create CivicSource records from discovery results
     */
    public function createSourcesFromDiscovery(array $discovery, Region $region): array
    {
        $createdSources = [];

        // Create Legistar source if found
        if (!empty($discovery['legistar_client'])) {
            $platform = CivicSourcePlatform::byName('legistar');
            if ($platform) {
                $source = CivicSource::updateOrCreate(
                    [
                        'region_id' => $region->id,
                        'platform_id' => $platform->id,
                        'api_client_name' => $discovery['legistar_client'],
                    ],
                    [
                        'name' => "{$discovery['city_name']} - Legistar",
                        'source_type' => CivicSource::TYPE_API,
                        'entity_type' => CivicSource::ENTITY_CITY,
                        'api_endpoint' => "https://webapi.legistar.com/v1/{$discovery['legistar_client']}",
                        'base_url' => $discovery['legistar_portal'],
                        'poll_interval_minutes' => 120,
                        'is_enabled' => true,
                        'auto_discovered' => true,
                        'discovered_at' => now(),
                    ]
                );
                $createdSources['legistar'] = $source;
            }
        }

        // Create Granicus Meetings sources if found
        if (!empty($discovery['granicus_urls'])) {
            $platform = CivicSourcePlatform::byName('granicus_meetings');
            if ($platform) {
                foreach ($discovery['granicus_urls'] as $granicusData) {
                    $host = is_array($granicusData) ? $granicusData['host'] : $granicusData;
                    $host = rtrim(parse_url($host, PHP_URL_SCHEME) . '://' . parse_url($host, PHP_URL_HOST), '/');

                    $source = CivicSource::updateOrCreate(
                        [
                            'region_id' => $region->id,
                            'platform_id' => $platform->id,
                            'base_url' => $host,
                        ],
                        [
                            'name' => "{$discovery['city_name']} - Granicus Meetings",
                            'source_type' => CivicSource::TYPE_RSS,
                            'entity_type' => CivicSource::ENTITY_CITY,
                            'config' => [
                                'view_ids' => $granicusData['view_ids'] ?? [],
                                'description' => $granicusData['description'] ?? null,
                            ],
                            'poll_interval_minutes' => 120,
                            'is_enabled' => true,
                            'auto_discovered' => true,
                            'discovered_at' => now(),
                        ]
                    );
                    $createdSources['granicus_meetings'][] = $source;
                }
            }
        }

        // Create CivicPlus source if found
        if (!empty($discovery['civicplus_url'])) {
            $platform = CivicSourcePlatform::byName('civicplus');
            if ($platform) {
                $source = CivicSource::updateOrCreate(
                    [
                        'region_id' => $region->id,
                        'platform_id' => $platform->id,
                        'base_url' => $discovery['civicplus_url'],
                    ],
                    [
                        'name' => "{$discovery['city_name']} - CivicPlus",
                        'source_type' => CivicSource::TYPE_RSS,
                        'entity_type' => CivicSource::ENTITY_CITY,
                        'rss_feed_url' => $discovery['civicplus_rss'],
                        'poll_interval_minutes' => 60,
                        'is_enabled' => true,
                        'auto_discovered' => true,
                        'discovered_at' => now(),
                    ]
                );
                $createdSources['civicplus'] = $source;
            }
        }

        // Create Nixle source if ZIP codes found
        if (!empty($discovery['nixle_zip_codes'])) {
            $platform = CivicSourcePlatform::byName('nixle');
            if ($platform) {
                $source = CivicSource::updateOrCreate(
                    [
                        'region_id' => $region->id,
                        'platform_id' => $platform->id,
                    ],
                    [
                        'name' => "{$discovery['city_name']} - Nixle Alerts",
                        'source_type' => CivicSource::TYPE_SCRAPE,
                        'entity_type' => CivicSource::ENTITY_POLICE,
                        'zip_codes' => implode(',', $discovery['nixle_zip_codes']),
                        'poll_interval_minutes' => 30,
                        'is_enabled' => true,
                        'auto_discovered' => true,
                        'discovered_at' => now(),
                    ]
                );
                $createdSources['nixle'] = $source;
            }
        }

        return $createdSources;
    }

    /**
     * Batch discover and create sources for multiple cities
     * 
     * @param Collection $cities Collection of ['name' => 'City', 'state' => 'FL', 'region_id' => uuid]
     * @return array Summary of discoveries
     */
    public function batchDiscover(Collection $cities): array
    {
        $summary = [
            'total' => $cities->count(),
            'successful' => 0,
            'failed' => 0,
            'sources_created' => 0,
            'errors' => [],
        ];

        foreach ($cities as $city) {
            try {
                $discovery = $this->discoverForCity($city['name'], $city['state']);

                if (!empty($city['region_id'])) {
                    $region = Region::find($city['region_id']);
                    if ($region) {
                        $sources = $this->createSourcesFromDiscovery($discovery, $region);
                        $summary['sources_created'] += count($sources, COUNT_RECURSIVE) - count($sources);
                    }
                }

                $summary['successful']++;

                // Rate limiting
                usleep(500000); // 500ms

            } catch (Exception $e) {
                $summary['failed']++;
                $summary['errors'][] = [
                    'city' => $city['name'],
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $summary;
    }
}
