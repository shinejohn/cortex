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
        return <<<PROMPT
You are an experienced local news editor evaluating articles for {$region->name} ({$region->type}).

Article Details:
Title: {$article['title']}
Source: {$article['source_publisher']}
Content: {$article['content_snippet']}

Task: Evaluate this article's relevance for local news in {$region->name}.

Scoring Criteria:
- Local Impact (40%): Direct relevance to the local community
- Timeliness (20%): How recent and timely the news is
- Community Interest (20%): Likely interest from local residents
- Informativeness (20%): Value and depth of information

Provide:
1. A relevance score from 0-100
2. Topic tags for categorization (e.g., business, community, events, government)
3. Brief rationale for your score
PROMPT;
    }

    /**
     * Build outline generation prompt
     */
    private function buildOutlinePrompt(array $article): string
    {
        return <<<PROMPT
You are a professional journalist creating an article outline based on this news source:

Title: {$article['title']}
Source: {$article['source_publisher']}
Content: {$article['content_snippet']}

Task: Create a structured outline for a well-organized local news article.

Requirements:
- Suggest an engaging, informative title
- Create 3-5 logical section headings
- Identify 5-8 key points to cover
- Ensure the outline flows naturally from introduction to conclusion

Focus on local news style: clear, factual, and community-focused.
PROMPT;
    }

    /**
     * Build fact-check prompt
     */
    private function buildFactCheckPrompt(string $claim, array $articleContext): string
    {
        $title = $articleContext['title'] ?? 'Unknown';
        $content = $articleContext['content'] ?? 'No content available';
        $source = $articleContext['source'] ?? 'Unknown source';
        $date = $articleContext['published_at'] ?? 'Unknown date';

        return <<<PROMPT
You are a fact-checker evaluating a specific claim from a news article.

Article Context:
Title: {$title}
Source: {$source}
Published: {$date}
Content: {$content}

Claim to Verify:
"{$claim}"

Task: Evaluate this claim based on the article context and general knowledge.

Provide:
1. Result: Choose one of:
   - "verified": Claim is directly supported by the article and appears factually accurate
   - "plausible": Claim seems reasonable based on context but lacks definitive proof
   - "unverified": Insufficient information to verify the claim
   - "disputed": Claim contradicts known facts or the article context

2. Confidence Score (0-100): How confident are you in this assessment?

3. Rationale: Brief explanation (1-2 sentences) of your verification decision

Be objective and base your assessment primarily on the article content provided.
PROMPT;
    }

    /**
     * Build claim extraction prompt
     */
    private function buildClaimExtractionPrompt(string $outline): string
    {
        return <<<PROMPT
You are a fact-checker reviewing this article outline:

{$outline}

Task: Extract specific factual claims that should be verified before publication.

Focus on:
- Statistics, numbers, and data points
- Statements about events, dates, or timelines
- Claims about people, organizations, or policies
- Any statements that could be objectively verified

For each claim:
- Importance: high (critical facts), medium (supporting facts), low (minor details)
- Sources needed: Number of independent sources required (1-3)

Only extract claims that are verifiable through external sources.
PROMPT;
    }

    /**
     * Build quality evaluation prompt
     */
    private function buildQualityEvaluationPrompt(array $draft): string
    {
        $outline = $draft['outline'] ?? 'No outline available';
        $factCheckCount = count($draft['fact_checks'] ?? []);

        return <<<PROMPT
You are a senior editor evaluating this article draft for publication quality:

Outline:
{$outline}

Fact-Check Summary: {$factCheckCount} claims verified

Task: Provide a comprehensive quality assessment.

Evaluation Criteria:
- Content Quality (30%): Writing quality, clarity, completeness
- Factual Accuracy (30%): Based on fact-check results
- Local Relevance (20%): Community value and impact
- Professionalism (20%): Tone, structure, readability

Provide:
1. Overall quality score (0-100)
2. Fact-check confidence estimate based on verification results
3. Key strengths (3-5 points)
4. Areas for improvement (if any)
PROMPT;
    }

    /**
     * Build article generation prompt
     */
    private function buildArticleGenerationPrompt(array $draft, array $factChecks): string
    {
        $outline = $draft['outline'] ?? '';
        $title = $draft['generated_title'] ?? '';
        $factCheckSummary = $this->summarizeFactChecks($factChecks);

        return <<<PROMPT
You are a professional journalist writing a local news article.

Title: {$title}

Outline:
{$outline}

Verified Facts:
{$factCheckSummary}

Task: Write a complete, publication-ready article.

Requirements:
- Write in clear, professional journalism style
- Use HTML formatting (<p>, <h2>, <strong>, <em>, etc.)
- Incorporate all verified facts accurately
- Maintain objective, balanced tone
- Write 400-600 words
- Include proper paragraph breaks
- Create an engaging 150-200 character excerpt

Focus on local news standards: factual, informative, and community-focused.
PROMPT;
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
