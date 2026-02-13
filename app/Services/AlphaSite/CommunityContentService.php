<?php

declare(strict_types=1);

namespace App\Services\AlphaSite;

use App\Models\AlphasiteCategory;
use App\Models\Business;
use App\Models\City;
use App\Models\CityCategoryContent;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Generates unique AI content for city pages and city+category pages
 * using the Anthropic Claude API.
 */
final class CommunityContentService
{
    private string $apiKey;

    private string $model;

    public function __construct()
    {
        $this->apiKey = config('services.anthropic.api_key');
        $this->model = config('services.ai.model', 'claude-sonnet-4-5-20250514');
    }

    /**
     * Generate SEO content for a city page.
     * Skips generation if content was generated within the last 3 months.
     */
    public function generateCityContent(City $city): City
    {
        if ($city->content_generated_at && $city->content_generated_at->isAfter(Carbon::now()->subMonths(3))) {
            return $city;
        }

        $prompt = $this->buildCityPrompt($city);
        $raw = $this->callAI($prompt);

        if (! $raw) {
            Log::warning('CommunityContentService: AI returned no content for city', ['city_id' => $city->id]);

            return $city;
        }

        $data = $this->parseJson($raw);

        if (empty($data)) {
            Log::warning('CommunityContentService: Failed to parse AI response for city', ['city_id' => $city->id]);

            return $city;
        }

        $city->update([
            'seo_description' => $data['seo_description'] ?? null,
            'ai_overview' => $data['overview'] ?? null,
            'ai_business_climate' => $data['business_climate'] ?? null,
            'ai_community_highlights' => $data['community_highlights'] ?? null,
            'ai_faqs' => $data['faqs'] ?? null,
            'content_generated_at' => Carbon::now(),
        ]);

        return $city->refresh();
    }

    /**
     * Generate content for a city+category intersection.
     * Uses firstOrCreate on the city_category_content table.
     */
    public function generateCityCategoryContent(City $city, AlphasiteCategory $category): CityCategoryContent
    {
        $content = CityCategoryContent::firstOrCreate(
            [
                'city_id' => $city->id,
                'category_id' => $category->id,
            ],
            [
                'business_count' => 0,
            ]
        );

        if ($content->content_generated_at && $content->content_generated_at->isAfter(Carbon::now()->subMonths(3))) {
            return $content;
        }

        $businessCount = Business::where('city_id', $city->id)
            ->where('category_id', $category->id)
            ->count();

        $prompt = $this->buildCityCategoryPrompt($city, $category, $businessCount);
        $raw = $this->callAI($prompt);

        if (! $raw) {
            Log::warning('CommunityContentService: AI returned no content for city+category', [
                'city_id' => $city->id,
                'category_id' => $category->id,
            ]);

            return $content;
        }

        $data = $this->parseJson($raw);

        if (empty($data)) {
            Log::warning('CommunityContentService: Failed to parse AI response for city+category', [
                'city_id' => $city->id,
                'category_id' => $category->id,
            ]);

            return $content;
        }

        $content->update([
            'seo_title' => $data['seo_title'] ?? null,
            'seo_description' => $data['seo_description'] ?? null,
            'ai_intro' => $data['intro'] ?? null,
            'ai_hiring_guide' => $data['hiring_guide'] ?? null,
            'ai_local_insights' => $data['local_insights'] ?? null,
            'ai_cost_guide' => $data['cost_guide'] ?? null,
            'ai_faqs' => $data['faqs'] ?? null,
            'ai_tips' => $data['tips'] ?? null,
            'business_count' => $businessCount,
            'content_generated_at' => Carbon::now(),
            'business_count_updated_at' => Carbon::now(),
        ]);

        return $content->refresh();
    }

    /**
     * Bulk generate content for all active categories in a city.
     * Rate limits with 0.5s sleep between API calls.
     *
     * @return int Number of categories processed
     */
    public function generateAllContentForCity(City $city): int
    {
        $this->generateCityContent($city);

        $categories = AlphasiteCategory::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $count = 0;

        foreach ($categories as $category) {
            $this->generateCityCategoryContent($city, $category);
            $count++;

            usleep(500_000);
        }

        return $count;
    }

    /**
     * Build the prompt for city-level content generation.
     */
    private function buildCityPrompt(City $city): string
    {
        $countyName = $city->countyRecord?->name ?? $city->county ?? 'Unknown County';
        $population = $city->population ? number_format($city->population) : 'unknown';

        return <<<PROMPT
You are a local community content writer. Generate unique, SEO-optimized content for the city of {$city->name}, {$city->state_full} (population: {$population}, located in {$countyName} County).

Return a JSON object with these keys:
- "seo_description": A compelling 150-160 character meta description for the city's business directory page
- "overview": A 2-3 paragraph overview of the city, its economy, and what makes it a great place for businesses and residents (300-500 words)
- "business_climate": A 1-2 paragraph description of the local business climate, industries, and economic outlook (150-300 words)
- "community_highlights": A 1-2 paragraph description of community features, lifestyle, and what makes this city special (150-300 words)
- "faqs": An array of 4-6 FAQ objects, each with "question" and "answer" keys, about living, working, and doing business in this city

Write in a professional, informative tone. Be specific to this city — avoid generic content. Do not invent specific statistics or business names.

Return ONLY valid JSON, no additional text.
PROMPT;
    }

    /**
     * Build the prompt for city+category content generation.
     */
    private function buildCityCategoryPrompt(City $city, AlphasiteCategory $category, int $businessCount): string
    {
        $categoryName = $category->name;
        $singularName = $category->singular_name ?? $category->name;
        $countyName = $city->countyRecord?->name ?? $city->county ?? 'Unknown County';

        return <<<PROMPT
You are a local business directory content writer. Generate unique, SEO-optimized content for the "{$categoryName}" category page in {$city->name}, {$city->state_full} ({$countyName} County). There are currently {$businessCount} {$categoryName} businesses listed in this area.

Return a JSON object with these keys:
- "seo_title": A compelling page title under 60 characters for "{$categoryName} in {$city->name}, {$city->state}" format
- "seo_description": A 150-160 character meta description for this category page
- "intro": A 1-2 paragraph introduction about finding {$categoryName} services in {$city->name} (150-250 words)
- "hiring_guide": A practical guide on how to choose and hire a {$singularName} in this area (200-350 words)
- "local_insights": Local insights about the {$categoryName} market in {$city->name} — pricing trends, seasonal factors, local regulations (150-250 words)
- "cost_guide": A general cost guide for {$categoryName} services in this region (150-250 words)
- "faqs": An array of 4-6 FAQ objects, each with "question" and "answer" keys, about {$categoryName} services in this area
- "tips": An array of 4-6 practical tip strings for consumers hiring {$categoryName} services locally

Write in a professional, helpful tone. Be specific to this city and category — avoid generic content. Do not invent specific business names or exact prices.

Return ONLY valid JSON, no additional text.
PROMPT;
    }

    /**
     * Call the Anthropic API with the given prompt.
     */
    private function callAI(string $prompt): ?string
    {
        if (empty($this->apiKey)) {
            Log::error('CommunityContentService: Anthropic API key is not configured');

            return null;
        }

        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])
                ->timeout(60)
                ->post('https://api.anthropic.com/v1/messages', [
                    'model' => $this->model,
                    'max_tokens' => 2000,
                    'messages' => [
                        [
                            'role' => 'user',
                            'content' => $prompt,
                        ],
                    ],
                ]);

            if ($response->failed()) {
                Log::error('CommunityContentService: Anthropic API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return null;
            }

            $body = $response->json();

            return $body['content'][0]['text'] ?? null;
        } catch (Throwable $e) {
            Log::error('CommunityContentService: API call failed', [
                'message' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Parse a JSON string from an AI response, stripping markdown fences if present.
     *
     * @return array<string, mixed>
     */
    private function parseJson(string $raw): array
    {
        $cleaned = mb_trim($raw);

        if (str_starts_with($cleaned, '```')) {
            $cleaned = preg_replace('/^```(?:json)?\s*/i', '', $cleaned);
            $cleaned = preg_replace('/\s*```\s*$/', '', $cleaned);
        }

        $decoded = json_decode(mb_trim($cleaned), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::warning('CommunityContentService: JSON parse error', [
                'error' => json_last_error_msg(),
                'raw_length' => mb_strlen($raw),
            ]);

            return [];
        }

        return $decoded;
    }
}
