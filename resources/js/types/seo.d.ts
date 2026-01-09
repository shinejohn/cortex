/**
 * SEO Types for structured data and meta tags
 * Supports multiple content types across all three sub-sites
 */

export type SiteKey = "day-news" | "event-city" | "downtown-guide";

// Base SEO data shared across all types
interface BaseSEOData {
    title: string;
    description?: string;
    image?: string | null;
    url: string;
}

// Article/News SEO data (Day News)
export interface ArticleSEOData extends BaseSEOData {
    publishedAt?: string | null;
    modifiedAt?: string | null;
    author?: string | null;
    section?: string | null;
    articleBody?: string; // Full content for AI extraction
}

// Event SEO data (Go Event City)
export interface EventSEOData extends BaseSEOData {
    startDate: string;
    endDate?: string;
    time?: string;
    location?: {
        name?: string;
        address?: string;
        latitude?: number;
        longitude?: number;
    };
    performer?: string | null;
    price?: string | number;
    priceCurrency?: string;
    isFree?: boolean;
    availability?: "InStock" | "SoldOut" | "PreOrder" | "LimitedAvailability";
    category?: string;
}

// Venue SEO data (Go Event City)
export interface VenueSEOData extends BaseSEOData {
    name: string;
    address?: string;
    neighborhood?: string;
    latitude?: number;
    longitude?: number;
    capacity?: number;
    venueType?: string;
    rating?: number;
    reviewCount?: number;
}

// Performer SEO data (Go Event City)
export interface PerformerSEOData extends BaseSEOData {
    name: string;
    bio?: string;
    genres?: string[];
    homeCity?: string;
    isVerified?: boolean;
}

// Business SEO data (Downtown Guide)
export interface BusinessSEOData extends BaseSEOData {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    categories?: string[];
    rating?: number;
    reviewCount?: number;
    website?: string;
    phone?: string;
}

// Website/Homepage SEO data (All sites)
export interface WebsiteSEOData extends BaseSEOData {
    siteName?: string;
}

// Discriminated union for SEO props
export type SEOArticleProps = {
    type: "article";
    site: SiteKey;
    data: ArticleSEOData;
    noIndex?: boolean;
};

export type SEOEventProps = {
    type: "event";
    site: SiteKey;
    data: EventSEOData;
    noIndex?: boolean;
};

export type SEOVenueProps = {
    type: "venue";
    site: SiteKey;
    data: VenueSEOData;
    noIndex?: boolean;
};

export type SEOPerformerProps = {
    type: "performer";
    site: SiteKey;
    data: PerformerSEOData;
    noIndex?: boolean;
};

export type SEOBusinessProps = {
    type: "business";
    site: SiteKey;
    data: BusinessSEOData;
    noIndex?: boolean;
};

export type SEOWebsiteProps = {
    type: "website";
    site: SiteKey;
    data: WebsiteSEOData;
    noIndex?: boolean;
};

export type SEOProps = SEOArticleProps | SEOEventProps | SEOVenueProps | SEOPerformerProps | SEOBusinessProps | SEOWebsiteProps;

// Site configuration type
export interface SiteConfig {
    name: string;
    defaultImage: string;
    twitterHandle?: string;
}

export type SiteConfigMap = Record<SiteKey, SiteConfig>;
