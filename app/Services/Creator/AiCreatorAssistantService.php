<?php

declare(strict_types=1);

namespace App\Services\Creator;

use App\Models\Region;
use App\Services\News\ImageStorageService;
use App\Services\News\PerformerMatchingService;
use App\Services\News\PrismAiService;
use App\Services\News\UnsplashService;
use App\Services\News\VenueMatchingService;
use Exception;
use Illuminate\Support\Facades\Log;

final class AiCreatorAssistantService
{
    public function __construct(
        private readonly PrismAiService $ai,
        private readonly UnsplashService $unsplash,
        private readonly VenueMatchingService $venueMatching,
        private readonly PerformerMatchingService $performerMatching,
        private readonly ImageStorageService $imageStorage,
    ) {}

    /**
     * Analyze content and return comprehensive quality metrics.
     * Called as user types (debounced on frontend to every 3 seconds).
     * Returns: seo_analysis, quality_analysis, classification
     */
    public function analyzeContent(string $title, string $content, string $contentType, ?Region $region = null): array
    {
        $prompt = $this->buildAnalysisPrompt($title, $content, $contentType, $region);

        try {
            $result = $this->ai->chat($prompt, 'google/gemini-2.0-flash-001');
            $parsed = $this->parseJsonResponse($result);

            return [
                'seo_analysis' => [
                    'score' => $parsed['seo_score'] ?? 0,
                    'keyword_density' => $parsed['keyword_density'] ?? [],
                    'meta_description_quality' => $parsed['meta_quality'] ?? 'poor',
                    'heading_structure' => $parsed['heading_structure'] ?? 'missing',
                    'readability_grade' => $parsed['readability_grade'] ?? 0,
                    'readability_level' => $parsed['readability_level'] ?? 'unknown',
                    'suggestions' => $parsed['seo_suggestions'] ?? [],
                ],
                'quality_analysis' => [
                    'score' => $parsed['quality_score'] ?? 0,
                    'relevance' => $parsed['relevance_score'] ?? 0,
                    'completeness' => $parsed['completeness_score'] ?? 0,
                    'bias_score' => $parsed['bias_score'] ?? 0,
                    'bias_flags' => $parsed['bias_flags'] ?? [],
                    'suggestions' => $parsed['quality_suggestions'] ?? [],
                ],
                'classification' => [
                    'content_type' => $parsed['detected_content_type'] ?? $contentType,
                    'category' => $parsed['category'] ?? null,
                    'subcategories' => $parsed['subcategories'] ?? [],
                    'topic_tags' => $parsed['topic_tags'] ?? [],
                ],
            ];
        } catch (Exception $e) {
            Log::error('AiCreatorAssistantService::analyzeContent failed', [
                'error' => $e->getMessage(),
            ]);

            return [
                'seo_analysis' => ['score' => 0, 'suggestions' => ['Analysis temporarily unavailable']],
                'quality_analysis' => ['score' => 0, 'suggestions' => ['Analysis temporarily unavailable']],
                'classification' => ['content_type' => $contentType, 'topic_tags' => []],
            ];
        }
    }

    /**
     * Extract and verify factual claims from content.
     */
    public function extractAndCheckFacts(string $content): array
    {
        $prompt = <<<PROMPT
        Extract all factual claims from this text. For each claim, assess if it is:
        - "verified" = commonly known fact or clearly attributed to named source
        - "unverified" = specific claim that needs external verification
        - "opinion" = subjective statement, not a factual claim
        - "disputed" = contradicts commonly known information

        Return ONLY valid JSON array:
        [{"claim": "string", "status": "verified|unverified|opinion|disputed", "confidence": 0.0-1.0, "suggestion": "string or null"}]

        Text:
        {$content}
        PROMPT;

        try {
            $result = $this->ai->chat($prompt, 'google/gemini-2.0-flash-001');

            return $this->parseJsonResponse($result) ?? [];
        } catch (Exception $e) {
            Log::error('AiCreatorAssistantService::extractAndCheckFacts failed', ['error' => $e->getMessage()]);

            return [];
        }
    }

    /**
     * Generate article content from a prompt/outline.
     */
    public function generateContent(string $prompt, string $contentType, ?Region $region = null, array $options = []): array
    {
        $tone = $options['tone'] ?? 'professional';
        $length = $options['length'] ?? 'medium';
        $regionContext = $region ? "This is for {$region->name}." : '';

        $systemPrompt = <<<PROMPT
        You are an AI writing assistant for Day.News, a hyperlocal news platform.
        {$regionContext}
        Content type: {$contentType}
        Desired tone: {$tone}
        Desired length: {$length} (short=200-400 words, medium=400-800, long=800-1500)

        Write high-quality, factual, engaging content. Include:
        - Strong opening that hooks the reader
        - Proper attribution for all claims
        - Local context and relevance
        - SEO-friendly structure with subheadings for articles
        - Call to action or next steps where appropriate

        Return ONLY valid JSON:
        {"title": "string", "content": "string (HTML formatted)", "excerpt": "string (150 chars max)", "suggested_tags": ["string"], "meta_description": "string (160 chars max)"}
        PROMPT;

        try {
            $result = $this->ai->chat("User request: {$prompt}", 'anthropic/claude-sonnet-4-20250514', $systemPrompt);

            return $this->parseJsonResponse($result) ?? ['error' => 'Failed to generate content'];
        } catch (Exception $e) {
            Log::error('AiCreatorAssistantService::generateContent failed', ['error' => $e->getMessage()]);

            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Generate headline variations optimized for SEO and engagement.
     */
    public function generateHeadlines(string $topic, string $contentType, ?Region $region = null): array
    {
        $regionName = $region?->name ?? 'local community';

        $prompt = <<<PROMPT
        Generate 5 headline variations for a {$contentType} about: {$topic}
        Target community: {$regionName}

        For each headline provide:
        - The headline text
        - SEO score estimate (1-100)
        - Engagement prediction (low/medium/high)
        - Style label (informative, emotional, question, how-to, listicle)

        Return ONLY valid JSON array:
        [{"headline": "string", "seo_score": int, "engagement": "string", "style": "string"}]
        PROMPT;

        try {
            $result = $this->ai->chat($prompt, 'google/gemini-2.0-flash-001');

            return $this->parseJsonResponse($result) ?? [];
        } catch (Exception $e) {
            Log::error('AiCreatorAssistantService::generateHeadlines failed', ['error' => $e->getMessage()]);

            return [];
        }
    }

    /**
     * Generate SEO metadata for content.
     */
    public function generateSeoMetadata(string $title, string $content, array $tags = []): array
    {
        $tagStr = implode(', ', $tags);

        $prompt = <<<PROMPT
        Generate complete SEO metadata for this article.
        Title: {$title}
        Tags: {$tagStr}
        Content (first 500 chars): {$this->truncate($content, 500)}

        Return ONLY valid JSON:
        {
            "meta_description": "string (max 160 chars)",
            "slug": "string (url-friendly)",
            "keywords": ["string"],
            "og_title": "string (max 60 chars)",
            "og_description": "string (max 200 chars)",
            "schema_type": "Article|Event|LocalBusiness"
        }
        PROMPT;

        try {
            $result = $this->ai->chat($prompt, 'google/gemini-2.0-flash-001');

            return $this->parseJsonResponse($result) ?? [];
        } catch (Exception $e) {
            Log::error('AiCreatorAssistantService::generateSeoMetadata failed', ['error' => $e->getMessage()]);

            return [];
        }
    }

    /**
     * Search for relevant images via Unsplash.
     */
    public function suggestImages(string $title, array $tags = [], string $orientation = 'landscape'): array
    {
        $keywords = array_merge($tags, $this->extractKeywords($title));

        $results = [];
        $imageData = $this->unsplash->searchImage($keywords, $orientation);

        if ($imageData) {
            $results[] = $imageData;
        }

        if (count($keywords) > 2) {
            $altKeywords = array_slice($keywords, 0, 2);
            $altImage = $this->unsplash->searchImage($altKeywords, $orientation);
            if ($altImage) {
                $results[] = $altImage;
            }
        }

        foreach ($results as &$img) {
            $img['suggested_alt_text'] = "Image related to {$title}";
            $img['suggested_caption'] = '';
        }

        return $results;
    }

    /**
     * Parse a natural language event description into structured fields.
     */
    public function parseEventDescription(string $description, ?Region $region = null): array
    {
        $regionContext = $region ? "Region: {$region->name}" : '';

        $prompt = <<<PROMPT
        Parse this event description into structured data.
        {$regionContext}

        Description:
        {$description}

        Return ONLY valid JSON:
        {
            "title": "string",
            "description": "string (cleaned up, HTML safe)",
            "event_date": "YYYY-MM-DD or null",
            "event_time": "HH:MM AM/PM or null",
            "end_date": "YYYY-MM-DD or null",
            "end_time": "HH:MM AM/PM or null",
            "venue_name": "string or null",
            "venue_address": "string or null",
            "category": "music|sports|arts|food|community|business|education|health|government|holiday|other",
            "subcategories": ["string"],
            "is_free": true|false|null,
            "price_min": number|null,
            "price_max": number|null,
            "is_recurring": false,
            "recurrence_pattern": null,
            "badges": ["string"],
            "tags": ["string"],
            "performer_name": "string or null",
            "organizer_name": "string or null",
            "contact_info": "string or null",
            "ticket_url": "string or null"
        }
        PROMPT;

        try {
            $result = $this->ai->chat($prompt, 'anthropic/claude-sonnet-4-20250514');

            return $this->parseJsonResponse($result) ?? [];
        } catch (Exception $e) {
            Log::error('AiCreatorAssistantService::parseEventDescription failed', ['error' => $e->getMessage()]);

            return [];
        }
    }

    /**
     * Match a venue query against the venue database.
     */
    public function matchVenue(string $query, ?Region $region = null): array
    {
        try {
            return $this->venueMatching->findVenue($query, $region);
        } catch (Exception $e) {
            Log::error('AiCreatorAssistantService::matchVenue failed', ['error' => $e->getMessage()]);

            return [];
        }
    }

    /**
     * Match a performer name against the performer database.
     */
    public function matchPerformer(string $query, ?Region $region = null): array
    {
        try {
            return $this->performerMatching->findPerformer($query, $region);
        } catch (Exception $e) {
            Log::error('AiCreatorAssistantService::matchPerformer failed', ['error' => $e->getMessage()]);

            return [];
        }
    }

    /**
     * Check content for advertising compliance.
     */
    public function checkAdCompliance(string $content, string $adType): array
    {
        $prompt = <<<PROMPT
        Review this advertisement for compliance issues.
        Ad type: {$adType}

        Check for:
        1. Misleading claims or false advertising
        2. Missing required disclosures
        3. Inappropriate content
        4. Trademark/copyright concerns
        5. Competitor disparagement
        6. Unsubstantiated superlatives ("best", "cheapest", "#1")

        Content:
        {$content}

        Return ONLY valid JSON:
        {
            "compliant": true|false,
            "score": 0-100,
            "issues": [{"type": "string", "severity": "low|medium|high", "detail": "string", "suggestion": "string"}],
            "required_disclosures": ["string"]
        }
        PROMPT;

        try {
            $result = $this->ai->chat($prompt, 'google/gemini-2.0-flash-001');

            return $this->parseJsonResponse($result) ?? ['compliant' => true, 'score' => 100, 'issues' => []];
        } catch (Exception $e) {
            Log::error('AiCreatorAssistantService::checkAdCompliance failed', ['error' => $e->getMessage()]);

            return ['compliant' => true, 'score' => 50, 'issues' => [['type' => 'error', 'severity' => 'low', 'detail' => 'Compliance check unavailable']]];
        }
    }

    private function buildAnalysisPrompt(string $title, string $content, string $contentType, ?Region $region): string
    {
        $regionContext = $region ? "Target community: {$region->name}." : '';
        $contentSnippet = $this->truncate($content, 2000);

        return <<<PROMPT
        Analyze this {$contentType} content for quality, SEO, and classification.
        {$regionContext}

        Title: {$title}
        Content: {$contentSnippet}

        Return ONLY valid JSON with these exact keys:
        {
            "seo_score": 0-100,
            "keyword_density": {"keyword": percentage},
            "meta_quality": "poor|fair|good|excellent",
            "heading_structure": "missing|poor|good|excellent",
            "readability_grade": 0-100,
            "readability_level": "elementary|middle_school|high_school|college|advanced",
            "seo_suggestions": ["string"],
            "quality_score": 0-100,
            "relevance_score": 0-100,
            "completeness_score": 0-100,
            "bias_score": 0-100,
            "bias_flags": ["string"],
            "quality_suggestions": ["string"],
            "detected_content_type": "news|feature|announcement|opinion|press_release|event|business_update",
            "category": "string",
            "subcategories": ["string"],
            "topic_tags": ["string"]
        }
        PROMPT;
    }

    private function parseJsonResponse(string $response): ?array
    {
        $cleaned = preg_replace('/```(?:json)?\s*/i', '', $response);
        $cleaned = preg_replace('/```\s*$/', '', mb_trim($cleaned));
        $cleaned = mb_trim($cleaned);

        $decoded = json_decode($cleaned, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::warning('AiCreatorAssistantService: Failed to parse AI JSON response', [
                'error' => json_last_error_msg(),
                'response_preview' => mb_substr($response, 0, 200),
            ]);

            return null;
        }

        return $decoded;
    }

    private function extractKeywords(string $text): array
    {
        $stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were'];
        $words = explode(' ', mb_strtolower($text));

        return array_values(array_filter($words, fn ($w) => ! in_array($w, $stopWords) && mb_strlen($w) > 3));
    }

    private function truncate(string $text, int $length): string
    {
        return mb_strlen($text) > $length ? mb_substr($text, 0, $length).'...' : $text;
    }
}
