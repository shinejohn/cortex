import type { SiteConfigMap, SiteKey } from "@/types/seo";

/**
 * Site configuration for SEO
 * Contains site names, default images, and social handles
 */
export const siteConfig: SiteConfigMap = {
    "day-news": {
        name: "Day News",
        defaultImage: "/images/day-news-logo.png",
        // twitterHandle: '@daynews', // Uncomment when available
    },
    "event-city": {
        name: "Go Event City",
        defaultImage: "/images/event-city-logo.png",
        // twitterHandle: '@goeventcity', // Uncomment when available
    },
    "downtown-guide": {
        name: "Downtown Guide",
        defaultImage: "/images/downtown-guide-logo.png",
        // twitterHandle: '@downtownguide', // Uncomment when available
    },
};

/**
 * Get site configuration by key
 */
export function getSiteConfig(site: SiteKey) {
    return siteConfig[site];
}

/**
 * Get the image URL, falling back to site default if no image provided
 */
export function getImageUrl(image: string | null | undefined, site: SiteKey): string {
    if (image) {
        // If image is already absolute URL, return as-is
        if (image.startsWith("http://") || image.startsWith("https://")) {
            return image;
        }
        // Otherwise, it's a relative path
        return image;
    }
    // Fall back to site default image
    const config = siteConfig[site] || siteConfig["day-news"] || Object.values(siteConfig)[0];
    if (!config) {
        console.error(`[SEO] Critical Error: No site config found for site "${site}"!`);
        return "/images/default-meta-image.jpg"; // Absolute fallback
    }
    return config.defaultImage;
}

/**
 * Build canonical URL from path
 * Uses window.location.origin for proper domain handling
 */
export function buildCanonicalUrl(path: string): string {
    // Handle SSR case where window is not available
    if (typeof window === "undefined") {
        return path;
    }
    const origin = window.location.origin;
    // Ensure path starts with /
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${origin}${normalizedPath}`;
}

/**
 * Truncate text to a maximum length, adding ellipsis if needed
 * Useful for meta descriptions (150-160 chars recommended)
 */
export function truncateText(text: string, maxLength: number = 160): string {
    if (!text) {
        return "";
    }
    // Strip HTML tags
    const stripped = text.replace(/<[^>]*>/g, "");
    if (stripped.length <= maxLength) {
        return stripped;
    }
    // Find last space before maxLength to avoid cutting words
    const truncated = stripped.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > maxLength - 20) {
        return `${truncated.substring(0, lastSpace)}...`;
    }
    return `${truncated}...`;
}
