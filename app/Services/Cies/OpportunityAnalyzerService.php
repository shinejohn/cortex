<?php

declare(strict_types=1);

namespace App\Services\Cies;

use App\Models\DayNewsPost;
use App\Models\Region;
use App\Models\SalesOpportunity;
use App\Services\News\ArticleGenerationService; // Using this for LLM access or similar helper
use Illuminate\Support\Facades\Log;

final class OpportunityAnalyzerService
{
    // Keyword triggers for "Fast Path" (avoiding LLM cost if obviously not relevant)
    private const TRIGGER_KEYWORDS = [
        'opening',
        'launch',
        'new business',
        'expansion',
        'hiring',
        'renovation',
        'construct',
        'permit',
        'award',
        'anniversary',
        'festival',
        'gala',
        'sponsorship',
        'market',
        'pop-up'
    ];

    public function __construct(
        // In a real implementation, we'd inject an LLM service here
        // private readonly LlmService $llm
    ) {
    }

    /**
     * Analyze an article for potential sales opportunities
     */
    public function analyze(DayNewsPost $post): void
    {
        // 1. Initial Hygiene Check
        if ($this->shouldSkipAnalysis($post)) {
            return;
        }

        // 2. Keyword heuristic (Fast fail)
        if (!$this->hasTriggerKeywords($post)) {
            return;
        }

        Log::info('OpportunityAnalyzer: Potential lead detected, analyzing...', ['post_id' => $post->id, 'title' => $post->title]);

        // 3. AI Analysis (Mocked for Phase 4 MVP)
        // detailedAnalysis = $this->llm->analyze($post->content);
        $opportunityData = $this->mockAiAnalysis($post);

        if ($opportunityData) {
            $this->createOpportunity($post, $opportunityData);
        }
    }

    private function shouldSkipAnalysis(DayNewsPost $post): bool
    {
        // Don't analyze our own polls or ads
        if ($post->type === 'poll' || $post->type === 'ad') {
            return true;
        }

        // Don't re-analyze if already processed (could check a flag)

        return false;
    }

    private function hasTriggerKeywords(DayNewsPost $post): bool
    {
        $text = strtolower($post->title . ' ' . $post->excerpt);
        foreach (self::TRIGGER_KEYWORDS as $keyword) {
            if (str_contains($text, $keyword)) {
                return true;
            }
        }
        return false;
    }

    /**
     * This simulates the LLM extracting structured data from the text
     */
    private function mockAiAnalysis(DayNewsPost $post): ?array
    {
        // Heuristic: If it has "New Pizza Place" in title
        if (str_contains(strtolower($post->title), 'new') && str_contains(strtolower($post->title), 'opening')) {
            return [
                'business_name' => 'Unknown Business (Extract from text)', // In real LLM, this would be precise
                'opportunity_type' => 'new_business',
                'priority_score' => 8,
                'trigger_description' => "Article mentions a new opening: '{$post->title}'",
                'recommended_action' => 'Contact owner for "Grand Opening" package',
                'suggested_products' => ['grand_opening_bundle', 'digital_display_ads'],
            ];
        }

        // Award/Recognition
        if (str_contains(strtolower($post->title), 'award') || str_contains(strtolower($post->title), 'best of')) {
            return [
                'business_name' => 'Award Winner',
                'opportunity_type' => 'award_recognition',
                'priority_score' => 6,
                'trigger_description' => "Business won an award or recognition.",
                'recommended_action' => 'Pitch "Award Winner" spotlight feature',
                'suggested_products' => ['sponsored_content', 'social_media_boost'],
            ];
        }

        return null;
    }

    private function createOpportunity(DayNewsPost $post, array $data): void
    {
        // Find region from post (many-to-many, take first)
        $region = $post->regions->first();
        if (!$region)
            return;

        SalesOpportunity::create([
            'region_id' => $region->id,
            'source_type' => 'day_news_post',
            'source_id' => $post->id,
            'opportunity_type' => $data['opportunity_type'],
            'priority_score' => $data['priority_score'],
            'status' => 'new',
            'business_name' => $data['business_name'],
            'trigger_description' => $data['trigger_description'],
            'recommended_action' => $data['recommended_action'],
            'suggested_products' => $data['suggested_products'],
        ]);

        Log::info('Created Sales Opportunity', ['post_id' => $post->id, 'type' => $data['opportunity_type']]);
    }
}
