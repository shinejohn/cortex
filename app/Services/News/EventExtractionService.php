<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\EventExtractionDraft;
use App\Models\NewsArticle;
use App\Models\Region;
use Exception;
use Illuminate\Support\Facades\Log;

final class EventExtractionService
{
    public function __construct(
        private readonly PrismAiService $prismAi,
        private readonly VenueMatchingService $venueMatching,
        private readonly PerformerMatchingService $performerMatching,
        private readonly EventPublishingService $eventPublishing
    ) {}

    /**
     * Run full event extraction pipeline for a region
     */
    public function extractEventsForRegion(Region $region): array
    {
        if (! config('news-workflow.event_extraction.enabled', true)) {
            Log::info('EventExtractionService: Event extraction is disabled', [
                'region' => $region->name,
            ]);

            return [
                'detected' => 0,
                'extracted' => 0,
                'validated' => 0,
                'published' => 0,
                'rejected' => 0,
            ];
        }

        Log::info('EventExtractionService: Starting event extraction', [
            'region_id' => $region->id,
            'region_name' => $region->name,
        ]);

        $stats = [
            'detected' => 0,
            'extracted' => 0,
            'validated' => 0,
            'published' => 0,
            'rejected' => 0,
        ];

        // Step 1: Get unprocessed articles for event detection
        $articles = NewsArticle::where('region_id', $region->id)
            ->whereDoesntHave('eventExtractionDrafts')
            ->limit(config('news-workflow.event_extraction.max_events_per_region', 20))
            ->get();

        Log::info('EventExtractionService: Found articles to process', [
            'count' => $articles->count(),
            'region' => $region->name,
        ]);

        // Step 2: Detect events in articles
        foreach ($articles as $article) {
            try {
                $draft = $this->detectEventInArticle($article, $region);
                if ($draft) {
                    $stats['detected']++;
                }
            } catch (Exception $e) {
                Log::warning('EventExtractionService: Event detection failed', [
                    'article_id' => $article->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Step 3: Extract details for detected events
        $extractedCount = $this->extractDetailsForRegion($region);
        $stats['extracted'] = $extractedCount;

        // Step 4: Validate and match venues/performers
        $validatedCount = $this->validateExtractionsForRegion($region);
        $stats['validated'] = $validatedCount;

        // Step 5: Publish validated events
        $publishedCount = $this->eventPublishing->publishForRegion($region);
        $stats['published'] = $publishedCount;

        // Count rejections
        $stats['rejected'] = EventExtractionDraft::where('region_id', $region->id)
            ->where('status', 'rejected')
            ->count();

        Log::info('EventExtractionService: Event extraction completed', [
            'region' => $region->name,
            'stats' => $stats,
        ]);

        return $stats;
    }

    /**
     * Detect if article contains event information
     */
    public function detectEventInArticle(NewsArticle $article, Region $region): ?EventExtractionDraft
    {
        $articleData = [
            'title' => $article->title,
            'content_snippet' => $article->content_snippet ?? $article->full_content,
            'published_at' => $article->published_at?->toIso8601String(),
        ];

        $detection = $this->prismAi->detectEventInArticle($articleData, $region);

        if (! ($detection['contains_event'] ?? false)) {
            Log::debug('EventExtractionService: No event detected in article', [
                'article_id' => $article->id,
                'rationale' => $detection['rationale'] ?? 'No rationale',
            ]);

            return null;
        }

        $minConfidence = config('news-workflow.event_extraction.min_detection_confidence', 60);
        if (($detection['confidence_score'] ?? 0) < $minConfidence) {
            Log::debug('EventExtractionService: Detection confidence below threshold', [
                'article_id' => $article->id,
                'confidence' => $detection['confidence_score'] ?? 0,
                'threshold' => $minConfidence,
            ]);

            return null;
        }

        return EventExtractionDraft::create([
            'news_article_id' => $article->id,
            'region_id' => $region->id,
            'status' => 'detected',
            'detection_confidence' => $detection['confidence_score'] ?? 0,
            'ai_metadata' => ['detection' => $detection],
        ]);
    }

    /**
     * Get extraction statistics for a region
     */
    public function getStatsForRegion(Region $region): array
    {
        return [
            'pending' => EventExtractionDraft::forRegion($region->id)->pending()->count(),
            'detected' => EventExtractionDraft::forRegion($region->id)->detected()->count(),
            'extracted' => EventExtractionDraft::forRegion($region->id)->extracted()->count(),
            'validated' => EventExtractionDraft::forRegion($region->id)->validated()->count(),
            'published' => EventExtractionDraft::forRegion($region->id)->published()->count(),
            'rejected' => EventExtractionDraft::forRegion($region->id)->rejected()->count(),
        ];
    }

    /**
     * Extract detailed event data for detected drafts
     */
    private function extractDetailsForRegion(Region $region): int
    {
        $drafts = EventExtractionDraft::where('region_id', $region->id)
            ->where('status', 'detected')
            ->with('newsArticle')
            ->get();

        $extractedCount = 0;

        foreach ($drafts as $draft) {
            try {
                $articleData = [
                    'title' => $draft->newsArticle->title,
                    'content_snippet' => $draft->newsArticle->content_snippet ?? $draft->newsArticle->full_content,
                    'published_at' => $draft->newsArticle->published_at?->toIso8601String(),
                ];

                $extraction = $this->prismAi->extractEventDetails($articleData, $region);

                $minConfidence = config('news-workflow.event_extraction.min_extraction_confidence', 70);
                $extractionConfidence = $extraction['extraction_confidence'] ?? 80;

                if ($extractionConfidence < $minConfidence) {
                    $draft->update([
                        'status' => 'rejected',
                        'rejection_reason' => "Extraction confidence ({$extractionConfidence}) below threshold ({$minConfidence})",
                    ]);

                    continue;
                }

                $draft->update([
                    'status' => 'extracted',
                    'extraction_confidence' => $extractionConfidence,
                    'extracted_data' => $extraction,
                    'ai_metadata' => array_merge($draft->ai_metadata ?? [], ['extraction' => $extraction]),
                ]);

                $extractedCount++;
            } catch (Exception $e) {
                Log::error('EventExtractionService: Extraction failed', [
                    'draft_id' => $draft->id,
                    'error' => $e->getMessage(),
                ]);

                $draft->update([
                    'status' => 'rejected',
                    'rejection_reason' => 'Extraction failed: '.$e->getMessage(),
                ]);
            }
        }

        return $extractedCount;
    }

    /**
     * Validate extractions and match venues/performers
     */
    private function validateExtractionsForRegion(Region $region): int
    {
        $drafts = EventExtractionDraft::where('region_id', $region->id)
            ->where('status', 'extracted')
            ->get();

        $validatedCount = 0;

        foreach ($drafts as $draft) {
            try {
                $data = $draft->extracted_data;

                // Match or create venue
                $venue = $this->venueMatching->matchOrCreate(
                    $data['venue_name'] ?? null,
                    $data['venue_address'] ?? null,
                    $region->name
                );

                // Match or create performer (if applicable)
                $performer = null;
                if (! empty($data['performer_name'])) {
                    $performer = $this->performerMatching->matchOrCreate($data['performer_name']);
                }

                // Calculate quality score
                $qualityScore = $this->calculateQualityScore($draft);

                $draft->update([
                    'status' => 'validated',
                    'matched_venue_id' => $venue?->id,
                    'matched_performer_id' => $performer?->id,
                    'quality_score' => $qualityScore,
                ]);

                $validatedCount++;
            } catch (Exception $e) {
                Log::error('EventExtractionService: Validation failed', [
                    'draft_id' => $draft->id,
                    'error' => $e->getMessage(),
                ]);

                $draft->update([
                    'status' => 'rejected',
                    'rejection_reason' => 'Validation failed: '.$e->getMessage(),
                ]);
            }
        }

        return $validatedCount;
    }

    /**
     * Calculate overall quality score based on confidence and data completeness
     */
    private function calculateQualityScore(EventExtractionDraft $draft): float
    {
        $data = $draft->extracted_data ?? [];
        $score = 0;

        // Base score from AI confidence (70% weight)
        $detectionConfidence = $draft->detection_confidence ?? 0;
        $extractionConfidence = $draft->extraction_confidence ?? 0;
        $avgConfidence = ($detectionConfidence + $extractionConfidence) / 2;
        $score += $avgConfidence * 0.7;

        // Completeness bonus (30% weight)
        $requiredFields = ['title', 'event_date', 'venue_name', 'description', 'category'];
        $optionalFields = ['time', 'venue_address', 'subcategories', 'badges', 'performer_name'];

        $requiredPresent = 0;
        foreach ($requiredFields as $field) {
            if (! empty($data[$field])) {
                $requiredPresent++;
            }
        }

        $optionalPresent = 0;
        foreach ($optionalFields as $field) {
            if (! empty($data[$field])) {
                $optionalPresent++;
            }
        }

        $requiredScore = ($requiredPresent / count($requiredFields)) * 20;
        $optionalScore = ($optionalPresent / count($optionalFields)) * 10;
        $score += $requiredScore + $optionalScore;

        return min(100, max(0, $score));
    }
}
