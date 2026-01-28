<?php

declare(strict_types=1);

namespace App\Services\Story;

use App\Models\NewsArticle;
use App\Models\StoryThread;
use App\Models\StoryBeat;
use App\Models\Region;
use App\Services\PrismAiService;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Story Analysis Service
 * 
 * Uses AI to analyze articles and determine:
 * - If a story is resolved or ongoing
 * - What entities to monitor
 * - Predicted next developments
 * - Follow-up priority
 */
class StoryAnalysisService
{
    public function __construct(
        private readonly PrismAiService $aiService
    ) {}

    /**
     * Analyze an article for story thread potential
     * 
     * Returns analysis including:
     * - Is this part of an ongoing story?
     * - Is the story resolved?
     * - Key entities to track
     * - Predicted next beats
     */
    public function analyzeArticle(NewsArticle $article): array
    {
        Log::info('StoryAnalysis: Analyzing article', [
            'article_id' => $article->id,
            'title' => $article->title,
        ]);

        $prompt = $this->buildAnalysisPrompt($article);
        
        try {
            $response = $this->aiService->generateJson($prompt, [
                'model' => 'claude-sonnet-4-20250514',
                'max_tokens' => 2000,
            ]);

            $analysis = json_decode($response, true);
            
            if (!$analysis) {
                throw new Exception('Failed to parse AI response');
            }

            Log::info('StoryAnalysis: Analysis completed', [
                'article_id' => $article->id,
                'is_ongoing' => $analysis['is_ongoing_story'] ?? false,
                'is_resolved' => $analysis['is_resolved'] ?? true,
            ]);

            return $analysis;

        } catch (Exception $e) {
            Log::error('StoryAnalysis: Analysis failed', [
                'article_id' => $article->id,
                'error' => $e->getMessage(),
            ]);
            
            return $this->getDefaultAnalysis();
        }
    }

    /**
     * Analyze if a story thread needs follow-up
     */
    public function analyzeThreadForFollowUp(StoryThread $thread): array
    {
        Log::info('StoryAnalysis: Analyzing thread for follow-up', [
            'thread_id' => $thread->id,
            'title' => $thread->title,
        ]);

        // Gather context from all articles in thread
        $articles = $thread->articles()
            ->orderBy('pivot_sequence_number')
            ->get();

        $articleSummaries = $articles->map(function ($article) {
            return [
                'date' => $article->published_at?->format('Y-m-d'),
                'title' => $article->title,
                'summary' => $article->summary ?? substr($article->content, 0, 500),
            ];
        })->toArray();

        $prompt = $this->buildFollowUpPrompt($thread, $articleSummaries);

        try {
            $response = $this->aiService->generateJson($prompt, [
                'model' => 'claude-sonnet-4-20250514',
                'max_tokens' => 2000,
            ]);

            $analysis = json_decode($response, true);

            if (!$analysis) {
                throw new Exception('Failed to parse AI response');
            }

            return $analysis;

        } catch (Exception $e) {
            Log::error('StoryAnalysis: Follow-up analysis failed', [
                'thread_id' => $thread->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'needs_followup' => false,
                'confidence' => 0,
                'reason' => 'Analysis failed',
            ];
        }
    }

    /**
     * Find existing thread that a new article might belong to
     */
    public function findMatchingThread(NewsArticle $article, Region $region): ?StoryThread
    {
        // First, get AI analysis of the article
        $analysis = $this->analyzeArticle($article);

        if (!($analysis['is_ongoing_story'] ?? false)) {
            return null;
        }

        // Extract key entities for matching
        $people = collect($analysis['key_people'] ?? [])->pluck('name')->toArray();
        $keywords = $analysis['monitoring_keywords'] ?? [];

        // Search for matching threads
        $candidateThreads = StoryThread::forRegion($region)
            ->active()
            ->where('category', $analysis['category'] ?? $article->category)
            ->get();

        if ($candidateThreads->isEmpty()) {
            return null;
        }

        // Score each candidate
        $bestMatch = null;
        $bestScore = 0;

        foreach ($candidateThreads as $thread) {
            $score = $this->scoreThreadMatch($thread, $article, $analysis);
            
            if ($score > $bestScore && $score >= 50) { // Minimum 50% match
                $bestScore = $score;
                $bestMatch = $thread;
            }
        }

        if ($bestMatch) {
            Log::info('StoryAnalysis: Found matching thread', [
                'article_id' => $article->id,
                'thread_id' => $bestMatch->id,
                'match_score' => $bestScore,
            ]);
        }

        return $bestMatch;
    }

    /**
     * Create a new story thread from an article
     */
    public function createThreadFromArticle(NewsArticle $article): StoryThread
    {
        $analysis = $this->analyzeArticle($article);

        $thread = StoryThread::create([
            'region_id' => $article->region_id,
            'title' => $analysis['thread_title'] ?? $article->title,
            'summary' => $analysis['thread_summary'] ?? $article->summary,
            'category' => $analysis['category'] ?? $article->category ?? 'general',
            'subcategory' => $analysis['subcategory'] ?? null,
            'tags' => $analysis['tags'] ?? [],
            'priority' => $this->determinePriority($analysis),
            'status' => StoryThread::STATUS_DEVELOPING,
            'key_people' => $analysis['key_people'] ?? [],
            'key_organizations' => $analysis['key_organizations'] ?? [],
            'key_locations' => $analysis['key_locations'] ?? [],
            'key_dates' => $analysis['key_dates'] ?? [],
            'predicted_beats' => $analysis['predicted_beats'] ?? [],
            'monitoring_keywords' => $analysis['monitoring_keywords'] ?? [],
            'first_article_at' => $article->published_at,
            'last_article_at' => $article->published_at,
            'next_check_at' => $this->calculateNextCheck($analysis),
        ]);

        // Add the article to the thread
        $thread->addArticle($article, 'origin');

        // Create predicted story beats
        foreach ($analysis['predicted_beats'] ?? [] as $index => $beat) {
            $thread->addPredictedBeat(
                $beat['title'],
                $beat['description'] ?? null,
                $beat['expected_date'] ?? null,
                $beat['likelihood'] ?? 50
            );
        }

        // Create follow-up triggers based on analysis
        $this->createTriggersFromAnalysis($thread, $analysis);

        Log::info('StoryAnalysis: Created thread from article', [
            'thread_id' => $thread->id,
            'article_id' => $article->id,
        ]);

        return $thread;
    }

    /**
     * Generate follow-up article suggestions for a thread
     */
    public function suggestFollowUpArticles(StoryThread $thread): array
    {
        $analysis = $this->analyzeThreadForFollowUp($thread);

        if (!($analysis['needs_followup'] ?? false)) {
            return [];
        }

        $suggestions = [];

        foreach ($analysis['suggested_articles'] ?? [] as $suggestion) {
            $suggestions[] = [
                'title' => $suggestion['title'],
                'angle' => $suggestion['angle'],
                'search_queries' => $suggestion['search_queries'] ?? [],
                'sources_to_check' => $suggestion['sources'] ?? [],
                'urgency' => $suggestion['urgency'] ?? 'medium',
                'reason' => $suggestion['reason'] ?? null,
            ];
        }

        return $suggestions;
    }

    // =========================================================================
    // PROMPT BUILDERS
    // =========================================================================

    private function buildAnalysisPrompt(NewsArticle $article): string
    {
        $content = $article->content ?? $article->summary ?? '';
        $content = substr($content, 0, 4000); // Limit content length

        return <<<PROMPT
Analyze this news article to determine if it's part of an ongoing story that may need follow-up coverage.

ARTICLE:
Title: {$article->title}
Published: {$article->published_at?->format('Y-m-d')}
Category: {$article->category}

Content:
{$content}

Analyze and return JSON with this EXACT structure:
{
  "is_ongoing_story": true/false,
  "is_resolved": true/false,
  "resolution_likelihood": 0-100,
  "thread_title": "Concise title for the ongoing story thread",
  "thread_summary": "One paragraph summary of the developing story",
  "category": "crime|accident|politics|government|business|community|public_safety|legal|environment|health",
  "subcategory": "specific subcategory if applicable",
  "tags": ["relevant", "tags"],
  
  "key_people": [
    {"name": "Full Name", "role": "victim|suspect|official|witness|rescuer", "status": "description"}
  ],
  "key_organizations": [
    {"name": "Org Name", "type": "police|fire|government|business|hospital"}
  ],
  "key_locations": [
    {"name": "Location Name", "type": "scene|hospital|court|office"}
  ],
  "key_dates": [
    {"date": "2025-02-15", "event": "Court hearing", "importance": "high|medium|low"}
  ],
  
  "unresolved_questions": [
    "What happened to X?",
    "Will charges be filed?"
  ],
  
  "predicted_beats": [
    {
      "title": "Next likely development",
      "description": "What might happen",
      "expected_date": "2025-02-01 or null if unknown",
      "likelihood": 0-100
    }
  ],
  
  "monitoring_keywords": ["keywords", "to", "search"],
  
  "follow_up_triggers": {
    "check_in_days": 3,
    "watch_for": ["arrest", "charges", "found", "identified"],
    "monitor_sources": ["court_records", "police_reports", "press_releases"]
  },
  
  "priority_indicators": {
    "public_interest": 0-100,
    "time_sensitivity": 0-100,
    "ongoing_risk": 0-100,
    "legal_proceedings": true/false,
    "missing_person": true/false,
    "active_search": true/false
  }
}

CRITERIA FOR ONGOING STORIES:
- Missing persons (until found/search ends)
- Active investigations (until resolved)
- Pending charges/trials (until verdict)
- Ongoing searches/rescues (until concluded)
- Elections (until results certified)
- Policy debates (until enacted/rejected)
- Construction/development (until complete)
- Natural disasters (until recovery complete)

RESOLUTION INDICATORS:
- Person found (alive or deceased)
- Verdict delivered
- Search abandoned/concluded
- Suspect arrested and charged
- Election certified
- Policy enacted or rejected
- Case closed

Return ONLY valid JSON, no other text.
PROMPT;
    }

    private function buildFollowUpPrompt(StoryThread $thread, array $articleSummaries): string
    {
        $summariesText = '';
        foreach ($articleSummaries as $i => $article) {
            $summariesText .= "\n[Article " . ($i + 1) . "] {$article['date']}: {$article['title']}\n{$article['summary']}\n";
        }

        $keyPeople = json_encode($thread->key_people ?? []);
        $keyDates = json_encode($thread->key_dates ?? []);
        $predictedBeats = json_encode($thread->predicted_beats ?? []);

        return <<<PROMPT
Analyze this ongoing story thread to determine if follow-up coverage is needed.

STORY THREAD:
Title: {$thread->title}
Category: {$thread->category}
Status: {$thread->status}
Started: {$thread->first_article_at?->format('Y-m-d')}
Last Update: {$thread->last_article_at?->format('Y-m-d')}
Days Since Update: {$thread->days_since_last_article}

Key People: {$keyPeople}
Key Dates: {$keyDates}
Predicted Beats: {$predictedBeats}

ARTICLES IN THREAD:
{$summariesText}

ENGAGEMENT METRICS:
- Total Views: {$thread->total_views}
- Total Comments: {$thread->total_comments}
- Average Engagement Score: {$thread->avg_engagement_score}

Analyze and return JSON:
{
  "needs_followup": true/false,
  "confidence": 0-100,
  "is_resolved": true/false,
  "resolution_type": "verdict|found|abandoned|settled|etc" or null,
  
  "reason": "Why follow-up is or isn't needed",
  
  "unanswered_questions": [
    "Key question still unanswered"
  ],
  
  "suggested_articles": [
    {
      "title": "Suggested article title",
      "angle": "Specific angle to cover",
      "search_queries": ["queries to find new info"],
      "sources": ["police_department", "court_records"],
      "urgency": "high|medium|low",
      "reason": "Why this article is needed now"
    }
  ],
  
  "next_check_days": 3,
  
  "predicted_developments": [
    {
      "event": "What might happen",
      "likelihood": 0-100,
      "timeframe": "Within X days"
    }
  ],
  
  "should_continue_monitoring": true/false,
  "recommended_status": "developing|monitoring|resolved|dormant"
}

Consider:
1. Reader interest (high engagement = more follow-up value)
2. Unresolved elements (missing person still missing, trial pending)
3. Time sensitivity (court dates, search windows)
4. Public safety implications
5. Story completeness (does reader have closure?)

Return ONLY valid JSON.
PROMPT;
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    private function scoreThreadMatch(StoryThread $thread, NewsArticle $article, array $analysis): float
    {
        $score = 0;
        $totalWeight = 0;

        // Compare people (weight: 40)
        $threadPeople = collect($thread->key_people ?? [])->pluck('name')->map('strtolower')->toArray();
        $articlePeople = collect($analysis['key_people'] ?? [])->pluck('name')->map('strtolower')->toArray();
        $peopleOverlap = count(array_intersect($threadPeople, $articlePeople));
        if (count($threadPeople) > 0) {
            $score += ($peopleOverlap / count($threadPeople)) * 40;
        }
        $totalWeight += 40;

        // Compare keywords (weight: 30)
        $threadKeywords = array_map('strtolower', $thread->monitoring_keywords ?? []);
        $articleKeywords = array_map('strtolower', $analysis['monitoring_keywords'] ?? []);
        $keywordOverlap = count(array_intersect($threadKeywords, $articleKeywords));
        if (count($threadKeywords) > 0) {
            $score += ($keywordOverlap / count($threadKeywords)) * 30;
        }
        $totalWeight += 30;

        // Title similarity (weight: 20)
        similar_text(strtolower($thread->title), strtolower($article->title), $titleSimilarity);
        $score += ($titleSimilarity / 100) * 20;
        $totalWeight += 20;

        // Category match (weight: 10)
        if ($thread->category === ($analysis['category'] ?? $article->category)) {
            $score += 10;
        }
        $totalWeight += 10;

        return ($totalWeight > 0) ? ($score / $totalWeight) * 100 : 0;
    }

    private function determinePriority(array $analysis): string
    {
        $indicators = $analysis['priority_indicators'] ?? [];

        // Critical if missing person or active risk
        if (($indicators['missing_person'] ?? false) || ($indicators['active_search'] ?? false)) {
            return StoryThread::PRIORITY_CRITICAL;
        }

        // High if legal proceedings or high public interest
        if (($indicators['legal_proceedings'] ?? false) || ($indicators['public_interest'] ?? 0) >= 80) {
            return StoryThread::PRIORITY_HIGH;
        }

        // Calculate average priority score
        $avgScore = (
            ($indicators['public_interest'] ?? 50) +
            ($indicators['time_sensitivity'] ?? 50) +
            ($indicators['ongoing_risk'] ?? 0)
        ) / 3;

        if ($avgScore >= 70) return StoryThread::PRIORITY_HIGH;
        if ($avgScore >= 40) return StoryThread::PRIORITY_MEDIUM;
        return StoryThread::PRIORITY_LOW;
    }

    private function calculateNextCheck(array $analysis): \DateTime
    {
        $days = $analysis['follow_up_triggers']['check_in_days'] ?? 3;

        // Shorter checks for high-priority stories
        $indicators = $analysis['priority_indicators'] ?? [];
        if (($indicators['missing_person'] ?? false) || ($indicators['active_search'] ?? false)) {
            $days = min($days, 1);
        }
        if ($indicators['legal_proceedings'] ?? false) {
            $days = min($days, 2);
        }

        return now()->addDays($days);
    }

    private function createTriggersFromAnalysis(StoryThread $thread, array $analysis): void
    {
        $triggers = $analysis['follow_up_triggers'] ?? [];

        // Time-based check trigger
        if ($checkDays = $triggers['check_in_days'] ?? null) {
            $thread->createTrigger(
                'time_based',
                ['days_after_last' => $checkDays, 'max_checks' => 10],
                now()->addDays($checkDays),
                now()->addMonths(3)
            );
        }

        // Resolution check trigger
        if ($watchFor = $triggers['watch_for'] ?? []) {
            $thread->createTrigger(
                'resolution_check',
                ['check_keywords' => $watchFor],
                now()->addDay(),
                now()->addMonths(1)
            );
        }

        // Date-based triggers for known upcoming events
        foreach ($analysis['key_dates'] ?? [] as $keyDate) {
            if (!empty($keyDate['date']) && $keyDate['importance'] !== 'low') {
                $date = \Carbon\Carbon::parse($keyDate['date']);
                if ($date->isFuture()) {
                    $thread->createTrigger(
                        'date_event',
                        [
                            'date' => $keyDate['date'],
                            'event' => $keyDate['event'],
                            'days_before' => $keyDate['importance'] === 'high' ? 2 : 1,
                        ],
                        $date->subDays(2),
                        $date->addDays(7)
                    );
                }
            }
        }
    }

    private function getDefaultAnalysis(): array
    {
        return [
            'is_ongoing_story' => false,
            'is_resolved' => true,
            'resolution_likelihood' => 100,
            'key_people' => [],
            'key_organizations' => [],
            'key_locations' => [],
            'key_dates' => [],
            'predicted_beats' => [],
            'monitoring_keywords' => [],
            'priority_indicators' => [],
        ];
    }
}
