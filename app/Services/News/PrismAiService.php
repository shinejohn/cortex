<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\Region;
use Exception;
use Illuminate\Support\Facades\Log;
use Prism\Prism\Schema\RawSchema;

class PrismAiService
{
    private const CLIENT_TIMEOUT = 120; // 2 minutes

    /**
     * Score article relevance for local news (Phase 3)
     */
    public function scoreArticleRelevance(array $article, Region $region): array
    {
        try {
            $model = config('news-workflow.ai_models.scoring');
            $response = prism()
                ->structured()
                ->using(...$model)
                ->withClientOptions(['timeout' => self::CLIENT_TIMEOUT])
                ->withPrompt($this->buildRelevanceScoringPrompt($article, $region))
                ->withSchema(new RawSchema('relevance_scoring', [
                    'type' => 'object',
                    'properties' => [
                        'relevance_score' => [
                            'type' => 'number',
                            'description' => 'Relevance score from 0-100 for local news value',
                            'minimum' => 0,
                            'maximum' => 100,
                        ],
                        'topic_tags' => [
                            'type' => 'array',
                            'description' => 'List of topic tags for categorization',
                            'items' => ['type' => 'string'],
                        ],
                        'rationale' => [
                            'type' => 'string',
                            'description' => 'Brief explanation of the score',
                        ],
                    ],
                    'required' => ['relevance_score', 'topic_tags', 'rationale'],
                ]))
                ->generate();

            return $response->structured;
        } catch (Exception $e) {
            Log::error('Prism AI relevance scoring failed', [
                'article_title' => $article['title'] ?? 'Unknown',
                'region' => $region->name,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Generate article outline (Phase 4)
     */
    public function generateOutline(array $article): array
    {
        try {
            $model = config('news-workflow.ai_models.outline');
            $response = prism()
                ->structured()
                ->using(...$model)
                ->withClientOptions(['timeout' => self::CLIENT_TIMEOUT])
                ->withPrompt($this->buildOutlinePrompt($article))
                ->withSchema(new RawSchema('outline_generation', [
                    'type' => 'object',
                    'properties' => [
                        'title' => [
                            'type' => 'string',
                            'description' => 'Suggested article title',
                        ],
                        'sections' => [
                            'type' => 'array',
                            'description' => 'List of section headings',
                            'items' => ['type' => 'string'],
                        ],
                        'key_points' => [
                            'type' => 'array',
                            'description' => 'Main points to cover in the article',
                            'items' => ['type' => 'string'],
                        ],
                    ],
                    'required' => ['title', 'sections', 'key_points'],
                ]))
                ->generate();

            return $response->structured;
        } catch (Exception $e) {
            Log::error('Prism AI outline generation failed', [
                'article_title' => $article['title'] ?? 'Unknown',
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Fact-check a claim using AI
     */
    public function factCheckClaim(string $claim, array $articleContext): array
    {
        try {
            $model = config('news-workflow.ai_models.outline');
            $response = prism()
                ->structured()
                ->using(...$model)
                ->withClientOptions(['timeout' => self::CLIENT_TIMEOUT])
                ->withPrompt($this->buildFactCheckPrompt($claim, $articleContext))
                ->withSchema(new RawSchema('fact_check', [
                    'type' => 'object',
                    'properties' => [
                        'result' => [
                            'type' => 'string',
                            'description' => 'Verification result',
                            'enum' => ['verified', 'plausible', 'unverified', 'disputed'],
                        ],
                        'confidence_score' => [
                            'type' => 'number',
                            'description' => 'Confidence in the verification (0-100)',
                            'minimum' => 0,
                            'maximum' => 100,
                        ],
                        'rationale' => [
                            'type' => 'string',
                            'description' => 'Brief explanation of the verification result',
                        ],
                    ],
                    'required' => ['result', 'confidence_score', 'rationale'],
                ]))
                ->generate();

            return $response->structured;
        } catch (Exception $e) {
            Log::error('Prism AI fact-check failed', [
                'claim' => $claim,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Extract claims that need fact-checking (Phase 4)
     */
    public function extractClaimsForFactChecking(string $outline): array
    {
        try {
            $model = config('news-workflow.ai_models.outline');
            $response = prism()
                ->structured()
                ->using(...$model)
                ->withClientOptions(['timeout' => self::CLIENT_TIMEOUT])
                ->withPrompt($this->buildClaimExtractionPrompt($outline))
                ->withSchema(new RawSchema('claim_extraction', [
                    'type' => 'object',
                    'properties' => [
                        'claims' => [
                            'type' => 'array',
                            'description' => 'List of factual claims to verify',
                            'items' => [
                                'type' => 'object',
                                'properties' => [
                                    'text' => ['type' => 'string', 'description' => 'The claim statement'],
                                    'importance' => ['type' => 'string', 'enum' => ['high', 'medium', 'low']],
                                    'sources_needed' => ['type' => 'integer', 'description' => 'Number of sources to verify'],
                                ],
                                'required' => ['text', 'importance', 'sources_needed'],
                            ],
                        ],
                    ],
                    'required' => ['claims'],
                ]))
                ->generate();

            return $response->structured;
        } catch (Exception $e) {
            Log::error('Prism AI claim extraction failed', [
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Analyze trust metrics for an article draft (Phase 5)
     *
     * @return array{bias_level: int, reliability: int, objectivity: int, source_quality: int, analysis_rationale: string}
     */
    public function analyzeTrustMetrics(array $draft): array
    {
        try {
            $model = config('news-workflow.ai_models.trust_analysis');
            $response = prism()
                ->structured()
                ->using(...$model)
                ->withClientOptions(['timeout' => self::CLIENT_TIMEOUT])
                ->withPrompt($this->buildTrustAnalysisPrompt($draft))
                ->withSchema(new RawSchema('trust_analysis', [
                    'type' => 'object',
                    'properties' => [
                        'bias_level' => [
                            'type' => 'number',
                            'description' => 'How unbiased the article is (100 = completely neutral, 0 = highly biased)',
                            'minimum' => 0,
                            'maximum' => 100,
                        ],
                        'reliability' => [
                            'type' => 'number',
                            'description' => 'How reliable the information appears based on verifiable facts and sources',
                            'minimum' => 0,
                            'maximum' => 100,
                        ],
                        'objectivity' => [
                            'type' => 'number',
                            'description' => 'How objective vs opinionated the content is (100 = purely factual, 0 = purely opinion)',
                            'minimum' => 0,
                            'maximum' => 100,
                        ],
                        'source_quality' => [
                            'type' => 'number',
                            'description' => 'Quality assessment of information sources (100 = high-quality primary sources, 0 = no verifiable sources)',
                            'minimum' => 0,
                            'maximum' => 100,
                        ],
                        'analysis_rationale' => [
                            'type' => 'string',
                            'description' => 'Brief 1-2 sentence explanation of the trust assessment',
                        ],
                    ],
                    'required' => ['bias_level', 'reliability', 'objectivity', 'source_quality', 'analysis_rationale'],
                ]))
                ->generate();

            return $response->structured;
        } catch (Exception $e) {
            Log::error('Prism AI trust analysis failed', [
                'draft_id' => $draft['id'] ?? 'Unknown',
                'error' => $e->getMessage(),
            ]);

            // Return neutral defaults on failure
            return [
                'bias_level' => 70,
                'reliability' => 70,
                'objectivity' => 70,
                'source_quality' => 70,
                'analysis_rationale' => 'Trust analysis unavailable due to processing error.',
            ];
        }
    }

    /**
     * Evaluate draft quality (Phase 5)
     */
    public function evaluateDraftQuality(array $draft): array
    {
        try {
            $model = config('news-workflow.ai_models.scoring');
            $response = prism()
                ->structured()
                ->using(...$model)
                ->withClientOptions(['timeout' => self::CLIENT_TIMEOUT])
                ->withPrompt($this->buildQualityEvaluationPrompt($draft))
                ->withSchema(new RawSchema('quality_evaluation', [
                    'type' => 'object',
                    'properties' => [
                        'quality_score' => [
                            'type' => 'number',
                            'description' => 'Overall quality score from 0-100 - MUST be below 50 if placeholder text is detected',
                            'minimum' => 0,
                            'maximum' => 100,
                        ],
                        'fact_check_confidence' => [
                            'type' => 'number',
                            'description' => 'Average confidence in fact-checked claims from 0-100',
                            'minimum' => 0,
                            'maximum' => 100,
                        ],
                        'strengths' => [
                            'type' => 'array',
                            'description' => 'Strong points of the draft',
                            'items' => ['type' => 'string'],
                        ],
                        'weaknesses' => [
                            'type' => 'array',
                            'description' => 'Areas needing improvement',
                            'items' => ['type' => 'string'],
                        ],
                        'placeholder_detected' => [
                            'type' => 'boolean',
                            'description' => 'Whether any bracketed placeholder text like [Name], [Location], [Address] was found in the content',
                        ],
                    ],
                    'required' => ['quality_score', 'fact_check_confidence', 'strengths', 'weaknesses', 'placeholder_detected'],
                ]))
                ->generate();

            return $response->structured;
        } catch (Exception $e) {
            Log::error('Prism AI quality evaluation failed', [
                'draft_id' => $draft['id'] ?? 'Unknown',
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Generate final article content (Phase 6)
     *
     * @param  array  $draft  Draft data including outline and source info
     * @param  array  $factChecks  Verified fact-checks to incorporate
     * @param  string|null  $writerStyleInstructions  Optional writer agent style instructions
     */
    public function generateFinalArticle(array $draft, array $factChecks, ?string $writerStyleInstructions = null): array
    {
        try {
            $model = config('news-workflow.ai_models.generation');
            $temperature = config('news-workflow.article_generation.temperature', 0.3);

            $response = prism()
                ->structured()
                ->using(...$model)
                ->usingTemperature($temperature)
                ->withClientOptions(['timeout' => self::CLIENT_TIMEOUT])
                ->withPrompt($this->buildArticleGenerationPrompt($draft, $factChecks, $writerStyleInstructions))
                ->withSchema(new RawSchema('article_generation', [
                    'type' => 'object',
                    'properties' => [
                        'title' => [
                            'type' => 'string',
                            'description' => 'Final article title - must be complete with no placeholders',
                        ],
                        'content' => [
                            'type' => 'string',
                            'description' => 'Full article content in HTML format - must be publication-ready with NO placeholder text in brackets like [Name] or [Location]',
                        ],
                        'excerpt' => [
                            'type' => 'string',
                            'description' => 'Brief excerpt (150-200 characters) - must be complete with no placeholders',
                        ],
                        'seo_keywords' => [
                            'type' => 'array',
                            'description' => 'SEO keywords',
                            'items' => ['type' => 'string'],
                        ],
                    ],
                    'required' => ['title', 'content', 'excerpt', 'seo_keywords'],
                ]))
                ->generate();

            return $response->structured;
        } catch (Exception $e) {
            Log::error('Prism AI article generation failed', [
                'draft_id' => $draft['id'] ?? 'Unknown',
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Build relevance scoring prompt
     */
    private function buildRelevanceScoringPrompt(array $article, Region $region): string
    {
        $prompt = config('news-workflow.prompts.relevance_scoring');

        return strtr($prompt, [
            '{region_name}' => $region->name,
            '{region_type}' => $region->type,
            '{title}' => $article['title'],
            '{content_snippet}' => $article['content_snippet'],
        ]);
    }

    /**
     * Build outline generation prompt
     */
    private function buildOutlinePrompt(array $article): string
    {
        $prompt = config('news-workflow.prompts.outline');

        return strtr($prompt, [
            '{title}' => $article['title'],
            '{content_snippet}' => $article['content_snippet'],
        ]);
    }

    /**
     * Build fact-check prompt
     */
    private function buildFactCheckPrompt(string $claim, array $articleContext): string
    {
        $prompt = config('news-workflow.prompts.fact_check');

        return strtr($prompt, [
            '{title}' => $articleContext['title'] ?? 'Unknown',
            '{content}' => $articleContext['content'] ?? 'No content available',
            '{date}' => $articleContext['published_at'] ?? 'Unknown date',
            '{claim}' => $claim,
        ]);
    }

    /**
     * Build claim extraction prompt
     */
    private function buildClaimExtractionPrompt(string $outline): string
    {
        $prompt = config('news-workflow.prompts.claim_extraction');

        return strtr($prompt, [
            '{outline}' => $outline,
        ]);
    }

    /**
     * Build quality evaluation prompt
     */
    private function buildQualityEvaluationPrompt(array $draft): string
    {
        $prompt = config('news-workflow.prompts.quality_evaluation');

        return strtr($prompt, [
            '{outline}' => $draft['outline'] ?? 'No outline available',
            '{fact_check_count}' => (string) count($draft['fact_checks'] ?? []),
        ]);
    }

    /**
     * Build trust analysis prompt
     */
    private function buildTrustAnalysisPrompt(array $draft): string
    {
        $prompt = config('news-workflow.prompts.trust_analysis');

        // Include source publisher info if available
        $sourceInfo = '';
        if (!empty($draft['source_publisher'])) {
            $sourceInfo = "\nOriginal Source: {$draft['source_publisher']} (established news outlet)";
        }

        return strtr($prompt, [
            '{title}' => $draft['title'] ?? 'Unknown',
            '{outline}' => ($draft['outline'] ?? 'No outline available') . $sourceInfo,
            '{fact_check_summary}' => $this->summarizeFactChecks($draft['fact_checks'] ?? []),
            '{relevance_score}' => (string) ($draft['relevance_score'] ?? 'N/A'),
        ]);
    }

    /**
     * Build article generation prompt
     */
    private function buildArticleGenerationPrompt(array $draft, array $factChecks, ?string $writerStyleInstructions = null): string
    {
        $prompt = config('news-workflow.prompts.article_generation');

        $basePrompt = strtr($prompt, [
            '{today_date}' => now()->format('F j, Y'),
            '{region_name}' => $draft['region_name'] ?? 'Local Area',
            '{title}' => $draft['generated_title'] ?? '',
            '{outline}' => $draft['outline'] ?? '',
            '{fact_check_summary}' => $this->summarizeFactChecks($factChecks),
        ]);

        // Append writer agent style instructions if provided
        if ($writerStyleInstructions) {
            $basePrompt .= "\n\n## WRITING STYLE INSTRUCTIONS\n" . $writerStyleInstructions;
        }

        return $basePrompt;
    }

    /**
     * Summarize fact-check results for AI prompt
     */
    private function summarizeFactChecks(array $factChecks): string
    {
        if (empty($factChecks)) {
            return 'No fact-checks available.';
        }

        $summary = [];
        foreach ($factChecks as $check) {
            $result = $check['verification_result'] ?? 'unverified';
            $confidence = $check['confidence_score'] ?? 0;
            $claim = $check['claim'] ?? '';

            $summary[] = "- {$claim} ({$result}, confidence: {$confidence}%)";
        }

        return implode("\n", $summary);
    }

    /**
     * Detect if article contains event information
     *
     * @return array{contains_event: bool, confidence_score: int, event_date_mentioned: bool, rationale: string}
     */
    public function detectEventInArticle(array $article, Region $region): array
    {
        try {
            $model = config('news-workflow.ai_models.event_detection');
            $response = prism()
                ->structured()
                ->using(...$model)
                ->withClientOptions(['timeout' => self::CLIENT_TIMEOUT])
                ->withPrompt($this->buildEventDetectionPrompt($article, $region))
                ->withSchema(new RawSchema('event_detection', [
                    'type' => 'object',
                    'properties' => [
                        'contains_event' => [
                            'type' => 'boolean',
                            'description' => 'Whether the article contains event information',
                        ],
                        'confidence_score' => [
                            'type' => 'number',
                            'description' => 'Confidence score from 0-100',
                            'minimum' => 0,
                            'maximum' => 100,
                        ],
                        'event_date_mentioned' => [
                            'type' => 'boolean',
                            'description' => 'Whether a specific date is mentioned',
                        ],
                        'rationale' => [
                            'type' => 'string',
                            'description' => 'Brief explanation',
                        ],
                    ],
                    'required' => ['contains_event', 'confidence_score', 'rationale'],
                ]))
                ->generate();

            return $response->structured;
        } catch (Exception $e) {
            Log::error('Prism AI event detection failed', [
                'article_title' => $article['title'] ?? 'Unknown',
                'region' => $region->name,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Extract detailed event information from article
     *
     * @return array{title: string, event_date: string, time: string, venue_name: string, venue_address: ?string, description: string, category: string, subcategories: array, is_free: bool, price_min: float, price_max: float, performer_name: ?string, badges: array, extraction_confidence: int}
     */
    public function extractEventDetails(array $article, Region $region): array
    {
        try {
            $model = config('news-workflow.ai_models.event_extraction');
            $response = prism()
                ->structured()
                ->using(...$model)
                ->withClientOptions(['timeout' => self::CLIENT_TIMEOUT])
                ->withPrompt($this->buildEventExtractionPrompt($article, $region))
                ->withSchema(new RawSchema('event_extraction', [
                    'type' => 'object',
                    'properties' => [
                        'title' => ['type' => 'string', 'description' => 'Event title'],
                        'event_date' => ['type' => 'string', 'description' => 'Event date in ISO 8601 format'],
                        'time' => ['type' => 'string', 'description' => 'Display time'],
                        'venue_name' => ['type' => 'string', 'description' => 'Venue name'],
                        'venue_address' => ['type' => 'string', 'description' => 'Venue address'],
                        'description' => ['type' => 'string', 'description' => 'Event description'],
                        'category' => ['type' => 'string', 'description' => 'Event category'],
                        'subcategories' => [
                            'type' => 'array',
                            'items' => ['type' => 'string'],
                            'description' => 'Event subcategories/tags',
                        ],
                        'is_free' => ['type' => 'boolean', 'description' => 'Whether event is free'],
                        'price_min' => ['type' => 'number', 'description' => 'Minimum price'],
                        'price_max' => ['type' => 'number', 'description' => 'Maximum price'],
                        'performer_name' => ['type' => 'string', 'description' => 'Performer name if applicable'],
                        'badges' => [
                            'type' => 'array',
                            'items' => ['type' => 'string'],
                            'description' => 'Event badges',
                        ],
                        'extraction_confidence' => [
                            'type' => 'number',
                            'description' => 'Confidence in extraction accuracy (0-100)',
                            'minimum' => 0,
                            'maximum' => 100,
                        ],
                    ],
                    'required' => ['title', 'event_date', 'venue_name', 'description', 'category', 'is_free'],
                ]))
                ->generate();

            return $response->structured;
        } catch (Exception $e) {
            Log::error('Prism AI event extraction failed', [
                'article_title' => $article['title'] ?? 'Unknown',
                'region' => $region->name,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Build event detection prompt
     */
    private function buildEventDetectionPrompt(array $article, Region $region): string
    {
        $prompt = config('news-workflow.prompts.event_detection');

        return strtr($prompt, [
            '{title}' => $article['title'] ?? '',
            '{content_snippet}' => $article['content_snippet'] ?? '',
            '{published_at}' => $article['published_at'] ?? '',
            '{region_name}' => $region->name,
        ]);
    }

    /**
     * Build event extraction prompt
     */
    private function buildEventExtractionPrompt(array $article, Region $region): string
    {
        $prompt = config('news-workflow.prompts.event_extraction');

        return strtr($prompt, [
            '{title}' => $article['title'] ?? '',
            '{content_snippet}' => $article['content_snippet'] ?? '',
            '{published_at}' => $article['published_at'] ?? '',
            '{region_name}' => $region->name,
        ]);
    }
    /**
     * Simple chat completion for freeform text/JSON responses.
     * Used by AiCreatorAssistantService and ContentModeratorService.
     *
     * @param  string  $prompt  User prompt
     * @param  string  $model  Model identifier (e.g. 'google/gemini-2.0-flash-001', 'anthropic/claude-sonnet-4-20250514')
     * @param  string|null  $systemPrompt  Optional system instruction
     */
    public function chat(string $prompt, string $model, ?string $systemPrompt = null): string
    {
        $modelConfig = ['openrouter', $model];

        $request = prism()
            ->text()
            ->using(...$modelConfig)
            ->withClientOptions(['timeout' => self::CLIENT_TIMEOUT])
            ->withPrompt($prompt);

        if ($systemPrompt !== null) {
            $request = $request->withSystemPrompt($systemPrompt);
        }

        $response = $request->generate();

        return $response->text;
    }

    /**
     * Generic JSON generation method to support Story Analysis
     */
    public function generateJson(string $prompt, array $schema): array
    {
        try {
            $model = config('news-workflow.ai_models.scoring');

            // Map simple schema array to RawSchema object if needed
            // The StoryAnalysisService passes a raw array for schema, we need to adapt it
            // Assuming schema is ['type' => 'object', ...] 

            $response = prism()
                ->structured()
                ->using(...$model)
                ->withClientOptions(['timeout' => self::CLIENT_TIMEOUT])
                ->withPrompt($prompt)
                ->withSchema(new RawSchema('generic_generation', $schema))
                ->generate();

            return $response->structured;
        } catch (Exception $e) {
            Log::error('Prism AI generic generation failed', [
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
