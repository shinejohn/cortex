<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Campaign;
use App\Models\CampaignRecipient;
use App\Models\SmbBusiness;
use Illuminate\Support\Carbon;
use InvalidArgumentException;

final class SmbFullProfileService
{
    /**
     * Build the full evolving profile by aggregating from all sources.
     *
     * @return array<string, mixed>
     */
    public function getFullProfile(SmbBusiness $smb): array
    {
        $smb->load(['tenant', 'customers', 'businessHours', 'photos', 'reviews', 'attributes']);

        $googleData = $this->buildGoogleData($smb);
        $enrichedData = $this->buildEnrichedData($smb);
        $surveyResponses = $smb->survey_responses ?? [];
        $aiContext = $smb->ai_context ?? [];
        $campaignHistory = $this->buildCampaignHistory($smb);
        $customerIntelligence = $smb->customer_intelligence ?? [];
        $competitorAnalysis = $smb->competitor_analysis ?? [];
        $subscription = $this->buildSubscription($smb);

        $dataSources = $smb->data_sources ?? [];
        if (! is_array($dataSources)) {
            $dataSources = [];
        }

        return [
            'id' => $smb->id,
            'community_id' => $smb->community_id,
            'name' => $smb->display_name ?? $smb->name,
            'category' => $this->deriveCategory($smb),
            'mapped_category' => $this->deriveCategory($smb),
            'google_data' => $googleData,
            'enriched_data' => $enrichedData,
            'survey_responses' => $surveyResponses,
            'ai_context' => $aiContext,
            'campaign_history' => $campaignHistory,
            'customer_intelligence' => $customerIntelligence,
            'competitor_analysis' => $competitorAnalysis,
            'subscription' => $subscription,
            'profile_completeness' => $smb->profile_completeness ?? $this->computeProfileCompleteness($smb),
            'data_sources' => $dataSources,
            'last_enriched_at' => $smb->last_enriched_at?->toIso8601String(),
        ];
    }

    /**
     * Get AI-relevant fields only (for prompt injection).
     *
     * @return array<string, mixed>
     */
    public function getAiContext(SmbBusiness $smb): array
    {
        $profile = $this->getFullProfile($smb);

        return [
            'business_name' => $profile['name'],
            'tone_and_voice' => $profile['ai_context']['tone_and_voice'] ?? [],
            'always_include' => $profile['ai_context']['always_include'] ?? [],
            'never_fabricate' => $profile['ai_context']['never_fabricate'] ?? [],
            'story_angles' => $profile['ai_context']['story_angles'] ?? [],
            'approved_quotes' => $profile['ai_context']['approved_quotes'] ?? [],
            'survey_highlights' => $profile['survey_responses'] ?? [],
            'customer_intelligence' => $profile['customer_intelligence'] ?? [],
        ];
    }

    /**
     * Generate a condensed text summary for AI system prompt injection.
     */
    public function getIntelligenceSummary(SmbBusiness $smb): string
    {
        $profile = $this->getFullProfile($smb);
        $parts = [];

        $parts[] = "Business: {$profile['name']}";
        $parts[] = "Category: {$profile['category']}";

        if (! empty($profile['google_data']['address'])) {
            $parts[] = "Location: {$profile['google_data']['address']}";
        }
        if (! empty($profile['google_data']['phone'])) {
            $parts[] = "Phone: {$profile['google_data']['phone']}";
        }
        if (! empty($profile['google_data']['website'])) {
            $parts[] = "Website: {$profile['google_data']['website']}";
        }

        if (! empty($profile['enriched_data']['website_description'])) {
            $parts[] = "\nAbout: {$profile['enriched_data']['website_description']}";
        }

        if (! empty($profile['survey_responses']['origin_story'])) {
            $parts[] = "\nOrigin story: {$profile['survey_responses']['origin_story']}";
        }
        if (! empty($profile['survey_responses']['unique_selling_points'])) {
            $usp = is_array($profile['survey_responses']['unique_selling_points'])
                ? implode(', ', $profile['survey_responses']['unique_selling_points'])
                : (string) $profile['survey_responses']['unique_selling_points'];
            $parts[] = "Unique selling points: {$usp}";
        }

        $aiContext = $profile['ai_context'] ?? [];
        if (! empty($aiContext['tone_and_voice'])) {
            $parts[] = "\nTone: ".implode(', ', (array) $aiContext['tone_and_voice']);
        }
        if (! empty($aiContext['approved_quotes'])) {
            foreach ((array) $aiContext['approved_quotes'] as $q) {
                $text = is_array($q) ? ($q['text'] ?? '') : (string) $q;
                $attr = is_array($q) ? ($q['attribution'] ?? '') : '';
                if ($text) {
                    $parts[] = "Approved quote: \"{$text}\" — {$attr}";
                }
            }
        }

        $ci = $profile['customer_intelligence'] ?? [];
        if (! empty($ci['top_praised_features'])) {
            $parts[] = "\nCustomers praise: ".implode(', ', (array) $ci['top_praised_features']);
        }

        return implode("\n", $parts);
    }

    /**
     * Update a single profile section.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateSection(SmbBusiness $smb, string $section, array $data): void
    {
        $allowed = ['ai_context', 'survey_responses', 'customer_intelligence', 'competitor_analysis'];
        if (! in_array($section, $allowed, true)) {
            throw new InvalidArgumentException("Invalid section: {$section}");
        }

        $current = $smb->{$section} ?? [];
        if (! is_array($current)) {
            $current = [];
        }
        $merged = array_merge($current, $data);
        $smb->update([$section => $merged]);
    }

    /**
     * Trigger re-enrichment (updates last_enriched_at; actual enrichment can be queued).
     */
    public function requestEnrichment(SmbBusiness $smb): void
    {
        $smb->update(['last_enriched_at' => Carbon::now()]);
    }

    /**
     * @return array<string, mixed>
     */
    private function buildGoogleData(SmbBusiness $smb): array
    {
        $photos = $smb->photos;
        $photoUrls = $photos->isNotEmpty()
            ? $photos->pluck('url')->filter()->values()->toArray()
            : ($smb->photos ?? []);

        if (is_array($photoUrls) && ! empty($photoUrls)) {
            $photoUrls = array_slice($photoUrls, 0, 5);
        }

        return [
            'place_id' => $smb->google_place_id ?? $smb->place_id,
            'rating' => $smb->google_rating ? (float) $smb->google_rating : null,
            'review_count' => $smb->google_rating_count ?? 0,
            'hours' => $smb->opening_hours ?? $smb->current_opening_hours ?? [],
            'photos' => $photoUrls,
            'address' => $smb->formatted_address ?? $smb->vicinity,
            'phone' => $smb->formatted_phone_number ?? $smb->phone_national,
            'website' => $smb->website_url ?? $smb->url,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function buildEnrichedData(SmbBusiness $smb): array
    {
        $attrs = $smb->attributes->pluck('attribute_value', 'attribute_key')->toArray();

        return [
            'owner_name' => $attrs['owner_name'] ?? null,
            'owner_email' => $attrs['owner_email'] ?? null,
            'facebook_url' => $attrs['facebook_url'] ?? null,
            'instagram_url' => $attrs['instagram_url'] ?? null,
            'website_description' => $attrs['website_description'] ?? (is_array($smb->editorial_summary) ? ($smb->editorial_summary['overview'] ?? null) : null),
            'website_services' => $attrs['website_services'] ?? [],
            'sources_used' => $smb->data_sources ?? [],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function buildCampaignHistory(SmbBusiness $smb): array
    {
        $tenantId = $smb->tenant_id;
        $customerIds = $smb->customers()->pluck('id');

        $campaigns = Campaign::where('tenant_id', $tenantId)->get();
        $totalCampaigns = $campaigns->count();
        $activeCampaigns = $campaigns->where('status', 'active')->count();

        $recipients = CampaignRecipient::whereIn('customer_id', $customerIds)->get();
        $totalEmailsSent = $recipients->count();
        $opened = $recipients->filter(fn ($r) => $r->opened_at !== null)->count();
        $clicked = $recipients->filter(fn ($r) => $r->clicked_at !== null)->count();

        $avgOpenRate = $totalEmailsSent > 0 ? round(($opened / $totalEmailsSent) * 100, 1) : 0;
        $avgClickRate = $totalEmailsSent > 0 ? round(($clicked / $totalEmailsSent) * 100, 1) : 0;

        $lastCampaign = Campaign::where('tenant_id', $tenantId)->latest('updated_at')->first();

        return [
            'total_campaigns' => $totalCampaigns,
            'active_campaigns' => $activeCampaigns,
            'total_emails_sent' => $totalEmailsSent,
            'avg_open_rate' => $avgOpenRate,
            'avg_click_rate' => $avgClickRate,
            'last_campaign_at' => $lastCampaign?->updated_at?->toDateString(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function buildSubscription(SmbBusiness $smb): array
    {
        return [
            'tier' => 'community_influencer',
            'monthly_value' => 300,
            'estimated_ad_value_delivered' => 1200,
            'trial_days_remaining' => null,
        ];
    }

    private function deriveCategory(SmbBusiness $smb): string
    {
        $types = $smb->place_types ?? $smb->types ?? [];
        if (is_array($types) && ! empty($types)) {
            return (string) ($types[0] ?? 'restaurants');
        }

        return 'restaurants';
    }

    private function computeProfileCompleteness(SmbBusiness $smb): int
    {
        $score = 0;
        $max = 100;

        if ($smb->display_name) {
            $score += 10;
        }
        if ($smb->formatted_address) {
            $score += 10;
        }
        if ($smb->phone_national || $smb->formatted_phone_number) {
            $score += 10;
        }
        if ($smb->website_url) {
            $score += 10;
        }
        if ($smb->google_place_id) {
            $score += 15;
        }
        if (! empty($smb->ai_context)) {
            $score += 20;
        }
        if (! empty($smb->survey_responses)) {
            $score += 15;
        }
        if (! empty($smb->customer_intelligence)) {
            $score += 10;
        }

        return min($score, $max);
    }
}
