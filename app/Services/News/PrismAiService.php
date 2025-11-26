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
                            'description' => 'Overall quality score from 0-100',
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
                    ],
                    'required' => ['quality_score', 'fact_check_confidence', 'strengths', 'weaknesses'],
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
     */
    public function generateFinalArticle(array $draft, array $factChecks): array
    {
        try {
            $model = config('news-workflow.ai_models.generation');
            $response = prism()
                ->structured()
                ->using(...$model)
                ->withClientOptions(['timeout' => self::CLIENT_TIMEOUT])
                ->withPrompt($this->buildArticleGenerationPrompt($draft, $factChecks))
                ->withSchema(new RawSchema('article_generation', [
                    'type' => 'object',
                    'properties' => [
                        'title' => [
                            'type' => 'string',
                            'description' => 'Final article title',
                        ],
                        'content' => [
                            'type' => 'string',
                            'description' => 'Full article content in HTML format',
                        ],
                        'excerpt' => [
                            'type' => 'string',
                            'description' => 'Brief excerpt (150-200 characters)',
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
     * Build article generation prompt
     */
    private function buildArticleGenerationPrompt(array $draft, array $factChecks): string
    {
        $prompt = config('news-workflow.prompts.article_generation');

        return strtr($prompt, [
            '{today_date}' => now()->format('F j, Y'),
            '{region_name}' => $draft['region_name'] ?? 'Local Area',
            '{title}' => $draft['generated_title'] ?? '',
            '{outline}' => $draft['outline'] ?? '',
            '{fact_check_summary}' => $this->summarizeFactChecks($factChecks),
        ]);
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
}
