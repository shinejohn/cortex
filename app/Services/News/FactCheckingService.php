<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\NewsArticleDraft;
use App\Models\NewsFactCheck;
use App\Models\Region;
use Exception;
use Illuminate\Support\Facades\Log;

final class FactCheckingService
{
    public function __construct(
        private readonly PrismAiService $prismAi,
        private readonly ScrapingBeeService $scrapingBee
    ) {}

    /**
     * Process a single draft for fact-checking (used by async jobs)
     */
    public function processSingleDraft(NewsArticleDraft $draft): void
    {
        $factCheckingEnabled = config('news-workflow.fact_checking.enabled', true);

        Log::info('Processing single draft for fact-checking', [
            'draft_id' => $draft->id,
            'fact_checking_enabled' => $factCheckingEnabled,
        ]);

        // Step 1: Generate outline (always done)
        $outline = $this->generateOutline($draft);
        $draft->update([
            'outline' => $outline,
            'status' => 'outline_generated',
        ]);

        Log::info('Generated outline', [
            'draft_id' => $draft->id,
        ]);

        if ($factCheckingEnabled) {
            // Step 2: Extract claims
            $claimExtractionSucceeded = false;
            try {
                $claims = $this->extractClaims($draft, $outline);
                $claimExtractionSucceeded = true;

                Log::info('Extracted claims', [
                    'draft_id' => $draft->id,
                    'claim_count' => count($claims),
                ]);

                // Step 3: Verify each claim
                foreach ($claims as $claimData) {
                    try {
                        $this->verifyClaim($draft, $claimData['text'], $claimData);
                    } catch (Exception $e) {
                        Log::warning('Failed to verify claim', [
                            'draft_id' => $draft->id,
                            'claim' => $claimData['text'] ?? $claimData,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            } catch (Exception $e) {
                Log::warning('Failed to extract claims for fact-checking, proceeding without fact-checks', [
                    'draft_id' => $draft->id,
                    'error' => $e->getMessage(),
                ]);
            }

            // Step 4: Calculate average fact-check confidence (if any claims were verified)
            $draft->calculateAverageFactCheckConfidence();

            // Step 5: Update status based on fact-check confidence
            // If claim extraction failed, still allow the draft to proceed (we have the outline)
            $minConfidence = config('news-workflow.fact_checking.min_confidence_score', 70);

            if (! $claimExtractionSucceeded) {
                // Claim extraction failed - proceed without fact-checking
                $draft->update(['status' => 'ready_for_generation']);

                Log::info('Draft proceeding without fact-checks due to extraction failure', [
                    'draft_id' => $draft->id,
                ]);
            } elseif ($draft->fact_check_confidence >= $minConfidence) {
                $draft->update(['status' => 'ready_for_generation']);

                Log::info('Draft passed fact-checking', [
                    'draft_id' => $draft->id,
                    'confidence' => $draft->fact_check_confidence,
                ]);
            } else {
                $draft->update([
                    'status' => 'rejected',
                    'rejection_reason' => "Fact-check confidence ({$draft->fact_check_confidence}) below minimum ({$minConfidence})",
                ]);

                Log::warning('Draft failed fact-checking', [
                    'draft_id' => $draft->id,
                    'confidence' => $draft->fact_check_confidence,
                    'required' => $minConfidence,
                ]);
            }
        } else {
            // Skip fact-checking, directly mark as ready for generation
            $draft->update(['status' => 'ready_for_generation']);

            Log::info('Skipped fact-checking (disabled), marked ready for generation', [
                'draft_id' => $draft->id,
            ]);
        }
    }

    /**
     * Generate outline and fact-check articles (Phase 4)
     *
     * @deprecated Use processSingleDraft() instead for async processing
     */
    public function processForRegion(Region $region): int
    {
        $factCheckingEnabled = config('news-workflow.fact_checking.enabled', true);
        $processedCount = 0;

        Log::info('Starting outline generation and fact-checking process', [
            'region' => $region->name,
            'fact_checking_enabled' => $factCheckingEnabled,
        ]);

        // Get shortlisted drafts
        $drafts = NewsArticleDraft::where('region_id', $region->id)
            ->where('status', 'shortlisted')
            ->with('newsArticle')
            ->get();

        Log::info('Found shortlisted drafts', [
            'region' => $region->name,
            'count' => $drafts->count(),
        ]);

        foreach ($drafts as $draft) {
            try {
                // Step 1: Generate outline (always done)
                $outline = $this->generateOutline($draft);
                $draft->update([
                    'outline' => $outline,
                    'status' => 'outline_generated',
                ]);

                Log::info('Generated outline', [
                    'draft_id' => $draft->id,
                ]);

                if ($factCheckingEnabled) {
                    // Step 2: Extract claims
                    $claims = $this->extractClaims($draft, $outline);

                    Log::info('Extracted claims', [
                        'draft_id' => $draft->id,
                        'claim_count' => count($claims),
                    ]);

                    // Step 3: Verify each claim
                    foreach ($claims as $claimData) {
                        try {
                            $this->verifyClaim($draft, $claimData['text'], $claimData);
                        } catch (Exception $e) {
                            Log::warning('Failed to verify claim', [
                                'draft_id' => $draft->id,
                                'claim' => $claimData['text'] ?? $claimData,
                                'error' => $e->getMessage(),
                            ]);
                        }
                    }

                    // Step 4: Calculate average fact-check confidence
                    $draft->calculateAverageFactCheckConfidence();

                    // Step 5: Update status based on fact-check confidence
                    $minConfidence = config('news-workflow.fact_checking.min_confidence_score', 70);
                    if ($draft->fact_check_confidence >= $minConfidence) {
                        $draft->update(['status' => 'ready_for_generation']);
                        $processedCount++;

                        Log::info('Draft passed fact-checking', [
                            'draft_id' => $draft->id,
                            'confidence' => $draft->fact_check_confidence,
                        ]);
                    } else {
                        $draft->update([
                            'status' => 'rejected',
                            'rejection_reason' => "Fact-check confidence ({$draft->fact_check_confidence}) below minimum ({$minConfidence})",
                        ]);

                        Log::warning('Draft failed fact-checking', [
                            'draft_id' => $draft->id,
                            'confidence' => $draft->fact_check_confidence,
                            'required' => $minConfidence,
                        ]);
                    }
                } else {
                    // Skip fact-checking, directly mark as ready for generation
                    $draft->update(['status' => 'ready_for_generation']);
                    $processedCount++;

                    Log::info('Skipped fact-checking (disabled), marked ready for generation', [
                        'draft_id' => $draft->id,
                    ]);
                }
            } catch (Exception $e) {
                Log::error('Failed to process draft for fact-checking', [
                    'draft_id' => $draft->id,
                    'error' => $e->getMessage(),
                ]);

                $draft->update([
                    'status' => 'rejected',
                    'rejection_reason' => 'Fact-checking process failed: '.$e->getMessage(),
                ]);
            }
        }

        Log::info('Fact-checking process completed', [
            'region' => $region->name,
            'processed' => $processedCount,
        ]);

        return $processedCount;
    }

    /**
     * Generate article outline using AI
     */
    private function generateOutline(NewsArticleDraft $draft): string
    {
        $articleData = [
            'title' => $draft->newsArticle->title,
            'content_snippet' => $draft->newsArticle->content_snippet,
            'source_publisher' => $draft->newsArticle->source_publisher,
            'published_at' => $draft->newsArticle->published_at?->toIso8601String(),
            'topic_tags' => $draft->topic_tags,
        ];

        $result = $this->prismAi->generateOutline($articleData);

        // Convert outline structure to text
        $outlineText = "# {$result['title']}\n\n";

        foreach ($result['sections'] as $section) {
            $outlineText .= "## {$section}\n";
        }

        $outlineText .= "\n## Key Points\n";
        foreach ($result['key_points'] as $point) {
            $outlineText .= "- {$point}\n";
        }

        return $outlineText;
    }

    /**
     * Extract factual claims from the outline
     */
    private function extractClaims(NewsArticleDraft $draft, string $outline): array
    {
        $result = $this->prismAi->extractClaimsForFactChecking($outline);

        return $result['claims'];
    }

    /**
     * Verify a single claim using AI fact-checking
     */
    private function verifyClaim(NewsArticleDraft $draft, string $claim, array $claimMetadata = []): void
    {
        // Use AI to assess the claim's plausibility based on the original article context
        $verificationResult = $this->aiFactCheck($draft, $claim);

        // Store fact-check result
        NewsFactCheck::create([
            'draft_id' => $draft->id,
            'claim' => $claim,
            'verification_result' => $verificationResult['result'],
            'confidence_score' => $verificationResult['confidence_score'],
            'sources' => [$draft->newsArticle->source_url],
            'scraped_evidence' => [],
            'metadata' => [
                'method' => 'ai_fact_check',
                'rationale' => $verificationResult['rationale'],
                'importance' => $claimMetadata['importance'] ?? 'medium',
                'sources_needed' => $claimMetadata['sources_needed'] ?? 1,
            ],
        ]);

        Log::debug('AI fact-checked claim', [
            'draft_id' => $draft->id,
            'claim' => mb_substr($claim, 0, 50).'...',
            'result' => $verificationResult['result'],
            'confidence' => $verificationResult['confidence_score'],
        ]);

        // COMMENTED OUT: ScrapingBee-based fact-checking
        // Uncomment below to use web scraping for fact verification
        /*
        // Build search query
        $searchQuery = $claim.' '.$draft->newsArticle->source_publisher;

        // Get source URLs from article metadata or use default search
        $sourceUrls = $this->getSourceUrls($draft, $searchQuery);

        // Scrape sources for evidence
        $scrapingResults = $this->scrapingBee->searchForClaim($claim, $sourceUrls);

        // Analyze results
        $evidenceFound = array_filter($scrapingResults, fn ($result) => $result['claim_found']);
        $confidenceScore = $this->calculateConfidenceScore($scrapingResults);
        $verificationResult = $this->determineVerificationResult($scrapingResults);

        // Store fact-check result
        NewsFactCheck::create([
            'draft_id' => $draft->id,
            'claim' => $claim,
            'verification_result' => $verificationResult,
            'confidence_score' => $confidenceScore,
            'sources' => array_column($scrapingResults, 'url'),
            'scraped_evidence' => $evidenceFound,
            'metadata' => [
                'search_query' => $searchQuery,
                'total_sources_checked' => count($scrapingResults),
                'sources_with_evidence' => count($evidenceFound),
                'importance' => $claimMetadata['importance'] ?? 'medium',
                'sources_needed' => $claimMetadata['sources_needed'] ?? 1,
            ],
        ]);

        Log::debug('Verified claim', [
            'draft_id' => $draft->id,
            'claim' => mb_substr($claim, 0, 50).'...',
            'result' => $verificationResult,
            'confidence' => $confidenceScore,
        ]);
        */
    }

    /**
     * Use AI to fact-check a claim based on the article context
     */
    private function aiFactCheck(NewsArticleDraft $draft, string $claim): array
    {
        try {
            $result = $this->prismAi->factCheckClaim($claim, [
                'title' => $draft->newsArticle->title,
                'content' => $draft->newsArticle->content_snippet,
                'source' => $draft->newsArticle->source_publisher,
                'published_at' => $draft->newsArticle->published_at?->toDateString(),
            ]);

            return $result;
        } catch (Exception $e) {
            Log::warning('AI fact-check failed, using default verification', [
                'claim' => $claim,
                'error' => $e->getMessage(),
            ]);

            // Fallback to plausible with medium confidence
            return [
                'result' => 'plausible',
                'confidence_score' => 50,
                'rationale' => 'AI fact-check failed, assuming plausible with low confidence',
            ];
        }
    }

    /**
     * Get source URLs for fact-checking
     */
    private function getSourceUrls(NewsArticleDraft $draft, string $searchQuery): array
    {
        $urls = [];

        // Add original article URL
        if ($draft->newsArticle->url) {
            $urls[] = $draft->newsArticle->url;
        }

        // Add related URLs from metadata if available
        if (isset($draft->newsArticle->metadata['related_urls'])) {
            $urls = array_merge($urls, $draft->newsArticle->metadata['related_urls']);
        }

        // Limit to max sources
        $maxSources = config('news-workflow.fact_checking.max_sources_per_claim', 3);
        $urls = array_slice(array_unique($urls), 0, $maxSources);

        // If we don't have enough URLs, use the original article URL
        if (empty($urls) && $draft->newsArticle->url) {
            $urls = [$draft->newsArticle->url];
        }

        return $urls;
    }

    /**
     * Calculate confidence score from scraping results
     */
    private function calculateConfidenceScore(array $scrapingResults): float
    {
        if (empty($scrapingResults)) {
            return 0.0;
        }

        $totalSources = count($scrapingResults);
        $sourcesWithEvidence = count(array_filter($scrapingResults, fn ($r) => $r['claim_found']));

        // Base score on percentage of sources with evidence
        $baseScore = ($sourcesWithEvidence / $totalSources) * 100;

        // Adjust based on number of sources checked
        if ($totalSources >= 3) {
            // Full confidence if 3+ sources checked
            return round($baseScore, 2);
        }
        if ($totalSources === 2) {
            // Reduce confidence if only 2 sources
            return round($baseScore * 0.8, 2);
        }

        // Lower confidence if only 1 source
        return round($baseScore * 0.6, 2);

    }

    /**
     * Determine verification result from scraping results
     */
    private function determineVerificationResult(array $scrapingResults): string
    {
        if (empty($scrapingResults)) {
            return 'unverified';
        }

        $totalSources = count($scrapingResults);
        $sourcesWithEvidence = count(array_filter($scrapingResults, fn ($r) => $r['claim_found']));

        // If majority of sources confirm, it's verified
        if ($sourcesWithEvidence / $totalSources >= 0.6) {
            return 'verified';
        }

        // If no sources confirm, it's potentially contradicted
        if ($sourcesWithEvidence === 0) {
            return 'contradicted';
        }

        // Otherwise, it's unverified
        return 'unverified';
    }
}
