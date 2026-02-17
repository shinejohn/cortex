export interface SeoAnalysis {
  score: number;
  keyword_density?: Record<string, number>;
  meta_description_quality?: string;
  heading_structure?: string;
  readability_grade?: number;
  readability_level?: string;
  suggestions?: string[];
}

export interface QualityAnalysis {
  score: number;
  relevance?: number;
  completeness?: number;
  bias_score?: number;
  bias_flags?: string[];
  suggestions?: string[];
}

export interface Classification {
  content_type: string;
  category: string | null;
  subcategories?: string[];
  topic_tags?: string[];
}

export interface FactCheckResult {
  claim: string;
  status: "verified" | "unverified" | "opinion" | "disputed";
  confidence: number;
  suggestion?: string | null;
}

export interface ModerationResult {
  status: "approved" | "rejected" | "needs_review" | "flagged";
  confidence?: number;
  flags?: Array<{ type: string; severity: string; detail: string }>;
  suggestions?: Array<{ type: string; target: string; suggestion: string }>;
}

export interface HeadlineOption {
  headline: string;
  seo_score: number;
  engagement: string;
  style: string;
}

export interface ImageSuggestion {
  url: string;
  thumb_url?: string;
  suggested_alt_text?: string;
  suggested_caption?: string;
  photographer_name?: string;
}

export interface VenueMatch {
  id: string;
  name: string;
  address: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface PerformerMatch {
  id: string;
  name: string;
  home_city?: string | null;
}

export interface AiCreatorSession {
  id: string;
  user_id: string;
  region_id: string | null;
  content_type: string;
  status: string;
  seo_analysis: SeoAnalysis | null;
  quality_analysis: QualityAnalysis | null;
  fact_check_results: FactCheckResult[] | null;
  classification: Classification | null;
  moderation_result: ModerationResult | null;
}
