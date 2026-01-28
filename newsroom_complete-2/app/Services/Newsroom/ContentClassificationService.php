<?php

namespace App\Services\Newsroom;

use App\Models\RawContent;
use App\Models\Community;
use App\Models\NewsSource;
use App\Models\BusinessMention;
use App\Models\SalesOpportunity;
use App\Services\News\PrismAiService;
use Illuminate\Support\Facades\Log;

class ContentClassificationService
{
    public function __construct(
        private readonly PrismAiService $aiService,
        private readonly BusinessMatchingService $businessMatcher,
    ) {}

    public function classify(RawContent $rawContent): array
    {
        Log::info('Classifying', ['id' => $rawContent->id, 'title' => substr($rawContent->source_title, 0, 50)]);

        try {
            $community = $rawContent->community;
            if (!$community) throw new \Exception('No community');

            $prompt = $this->buildPrompt($rawContent, $community, $rawContent->source);

            $response = $this->aiService->chat(
                model: 'gpt-4o-mini',
                messages: [['role' => 'user', 'content' => $prompt]],
                options: ['response_format' => ['type' => 'json_object']],
            );

            $classification = json_decode($response, true);
            if (json_last_error() !== JSON_ERROR_NONE) throw new \Exception('Invalid JSON');

            // Match businesses
            if (!empty($classification['businesses_mentioned'])) {
                foreach ($classification['businesses_mentioned'] as &$b) {
                    if ($match = $this->businessMatcher->findMatch($b['name'], $community->id)) {
                        $b['business_id'] = $match->id;
                        $b['is_customer'] = $match->is_advertiser || $match->is_command_center_customer;
                    }
                }
            }

            $rawContent->markClassified($classification);
            $this->createBusinessMentions($rawContent, $classification);

            if (!empty($classification['sales_flag']['has_business_opportunity'])) {
                $this->createSalesOpportunity($rawContent, $classification['sales_flag']);
            }

            return $classification;

        } catch (\Exception $e) {
            Log::error('Classification failed', ['id' => $rawContent->id, 'error' => $e->getMessage()]);
            $rawContent->markClassificationFailed($e->getMessage());
            throw $e;
        }
    }

    private function buildPrompt(RawContent $raw, Community $community, ?NewsSource $source): string
    {
        $content = substr($raw->source_content, 0, 6000);
        
        return <<<PROMPT
You are a LOCAL NEWS classifier for {$community->name}, {$community->state}.

CRITICAL RULES:
1. EVERYTHING has value - we are a COMMUNITY platform
2. A bake sale IS news (EVENT + FUNDRAISER)
3. Classification = ROUTING, not REJECTION
4. One item can have MULTIPLE content types

SOURCE: {$source?->name} ({$source?->source_type})
TITLE: {$raw->source_title}
CONTENT:
{$content}

RESPOND WITH JSON:
{
    "content_types": ["news", "event", etc - ALL that apply],
    "primary_type": "main_type",
    "categories": ["community", "business", "government", "education", "sports", "public_safety"],
    "tags": ["specific", "tags"],
    "local_relevance_score": 0-100,
    "local_relevance_reason": "why relevant",
    "news_value_score": 0-100,
    "news_value_reason": "why newsworthy",
    "businesses_mentioned": [{"name": "...", "role": "host|subject|mentioned", "is_local": true, "context": "..."}],
    "people_mentioned": [{"name": "...", "role": "...", "organization": "..."}],
    "locations_mentioned": [{"name": "...", "type": "venue|address", "address": "..."}],
    "organizations_mentioned": [{"name": "...", "type": "government|nonprofit", "role": "..."}],
    "dates_mentioned": [{"date": "2025-01-25", "type": "event|deadline", "description": "..."}],
    "event_data": {
        "is_event": true/false,
        "event_title": "...",
        "event_date": "2025-01-25",
        "event_time": "6:00 PM",
        "event_venue": "...",
        "event_address": "...",
        "event_description": "...",
        "event_cost": "Free|$10"
    },
    "processing_recommendation": {
        "tier": "brief|standard|full",
        "priority": "breaking|high|normal|low",
        "suggested_headline": "Compelling headline",
        "angle": "Most interesting angle"
    },
    "sales_flag": {
        "has_business_opportunity": true/false,
        "business_name": "...",
        "opportunity_type": "positive_coverage|new_business|event_host",
        "opportunity_quality": "hot|warm|cold",
        "recommended_action": "Follow-up action"
    }
}

CONTENT TYPES: breaking_news, news, feature, announcement, event, meeting_notice, meeting_recap, crime_report, business_news, new_business, school_news, sports_result, community_event, fundraiser, human_interest

TIERS:
- brief: Simple announcements, calendar items (news_value < 50)
- standard: Most news, business, sports
- full: Breaking, crime, investigations

SCORING:
- 90-100: Specifically about {$community->name}
- 70-89: Immediate area
- 50-69: Regional
- 0-49: Not local

JSON ONLY, NO MARKDOWN.
PROMPT;
    }

    private function createBusinessMentions(RawContent $raw, array $classification): void
    {
        foreach ($classification['businesses_mentioned'] ?? [] as $i => $b) {
            BusinessMention::create([
                'business_id' => $b['business_id'] ?? null,
                'business_name' => $b['name'],
                'business_name_normalized' => $this->businessMatcher->normalize($b['name']),
                'community_id' => $raw->community_id,
                'raw_content_id' => $raw->id,
                'mention_type' => $b['role'] ?? 'mentioned',
                'mention_context' => $b['context'] ?? null,
                'is_primary' => $i === 0,
                'confidence' => $b['confidence'] ?? 1.0,
            ]);
        }
    }

    private function createSalesOpportunity(RawContent $raw, array $flag): void
    {
        $name = $flag['business_name'] ?? null;
        if (!$name) return;

        $business = $this->businessMatcher->findMatch($name, $raw->community_id);
        if ($business && ($business->is_advertiser || $business->is_command_center_customer)) return;

        $existing = SalesOpportunity::where('business_name', $name)
            ->where('community_id', $raw->community_id)
            ->whereIn('status', ['new', 'assigned', 'contacted'])
            ->first();

        if ($existing) {
            $existing->logActivity('additional_coverage', ['content_id' => $raw->id]);
            return;
        }

        $quality = match ($flag['opportunity_type'] ?? '') {
            'new_business', 'grand_opening' => SalesOpportunity::QUALITY_HOT,
            'positive_coverage', 'event_host' => SalesOpportunity::QUALITY_WARM,
            default => SalesOpportunity::QUALITY_COLD,
        };

        SalesOpportunity::create([
            'business_id' => $business?->id,
            'business_name' => $name,
            'community_id' => $raw->community_id,
            'opportunity_type' => $flag['opportunity_type'] ?? 'positive_coverage',
            'quality' => $quality,
            'priority_score' => $quality === 'hot' ? 85 : ($quality === 'warm' ? 60 : 35),
            'trigger_content_id' => $raw->id,
            'trigger_description' => "Featured in: {$raw->source_title}",
            'recommended_action' => $flag['recommended_action'] ?? 'Follow up after article publishes',
            'status' => SalesOpportunity::STATUS_NEW,
        ]);
    }
}
