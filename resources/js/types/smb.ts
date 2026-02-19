/**
 * SMB Intelligence Hub types - full evolving profile and related structures.
 */

export interface GoogleData {
    place_id?: string;
    rating?: number;
    review_count?: number;
    hours?: Record<string, unknown>;
    photos?: string[];
    address?: string;
    phone?: string;
    website?: string;
}

export interface EnrichedData {
    owner_name?: string;
    owner_email?: string;
    facebook_url?: string;
    instagram_url?: string;
    website_description?: string;
    website_services?: string[];
    sources_used?: string[];
}

export interface SurveyResponses {
    origin_story?: string;
    unique_selling_points?: string[];
    community_involvement?: string[];
    target_customer?: string;
    seasonal_offerings?: Record<string, string>;
    completion_pct?: number;
}

export interface ApprovedQuote {
    text: string;
    attribution: string;
    context?: string;
}

export interface AiContext {
    tone_and_voice?: string[];
    always_include?: string[];
    never_fabricate?: string[];
    story_angles?: string[];
    approved_quotes?: ApprovedQuote[];
}

export interface CampaignHistory {
    total_campaigns?: number;
    active_campaigns?: number;
    total_emails_sent?: number;
    avg_open_rate?: number;
    avg_click_rate?: number;
    last_campaign_at?: string;
}

export interface CustomerIntelligence {
    perception_gaps?: Record<string, string>;
    common_complaints?: string[];
    top_praised_features?: string[];
    net_promoter_score?: number;
}

export interface Competitor {
    name: string;
    strengths?: string[];
    weaknesses?: string[];
}

export interface CompetitorAnalysis {
    direct_competitors?: Competitor[];
    market_position?: string;
    differentiation_opportunities?: string[];
}

export interface Subscription {
    tier?: string;
    monthly_value?: number;
    estimated_ad_value_delivered?: number;
    trial_days_remaining?: number | null;
}

export interface SmbFullProfile {
    id: string;
    community_id?: string | null;
    name: string;
    category?: string;
    mapped_category?: string;
    google_data: GoogleData;
    enriched_data: EnrichedData;
    survey_responses: SurveyResponses;
    ai_context: AiContext;
    campaign_history: CampaignHistory;
    customer_intelligence: CustomerIntelligence;
    competitor_analysis: CompetitorAnalysis;
    subscription: Subscription;
    profile_completeness: number;
    data_sources: string[];
    last_enriched_at?: string | null;
}

export interface SmbAiContext {
    business_name: string;
    tone_and_voice: string[];
    always_include: string[];
    never_fabricate: string[];
    story_angles: string[];
    approved_quotes: ApprovedQuote[];
    survey_highlights: SurveyResponses;
    customer_intelligence: CustomerIntelligence;
}

export interface SmbIntelligenceSummary {
    summary: string;
}
