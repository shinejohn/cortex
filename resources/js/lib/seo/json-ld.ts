import type { ArticleSEOData, BusinessSEOData, EventSEOData, PerformerSEOData, SiteKey, VenueSEOData, WebsiteSEOData } from "@/types/seo";
import { buildCanonicalUrl, getImageUrl, getSiteConfig } from "./config";

/**
 * Build NewsArticle JSON-LD schema
 * Optimized for AI search visibility with full articleBody
 */
export function buildArticleSchema(data: ArticleSEOData, site: SiteKey): object {
    const config = getSiteConfig(site);
    const canonicalUrl = buildCanonicalUrl(data.url);
    const imageUrl = getImageUrl(data.image, site);

    return {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: data.title,
        description: data.description,
        image: imageUrl,
        url: canonicalUrl,
        datePublished: data.publishedAt,
        dateModified: data.modifiedAt || data.publishedAt,
        ...(data.articleBody && { articleBody: data.articleBody }),
        ...(data.section && { articleSection: data.section }),
        ...(data.author && {
            author: {
                "@type": "Person",
                name: data.author,
            },
        }),
        publisher: {
            "@type": "Organization",
            name: config.name,
            logo: {
                "@type": "ImageObject",
                url: buildCanonicalUrl(config.defaultImage),
            },
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": canonicalUrl,
        },
    };
}

/**
 * Build Event JSON-LD schema
 * Includes location, performer, and offer details
 */
export function buildEventSchema(data: EventSEOData, site: SiteKey): object {
    const config = getSiteConfig(site);
    const canonicalUrl = buildCanonicalUrl(data.url);
    const imageUrl = getImageUrl(data.image, site);

    // Build location object if provided
    const location = data.location
        ? {
              "@type": "Place",
              name: data.location.name,
              ...(data.location.address && {
                  address: {
                      "@type": "PostalAddress",
                      streetAddress: data.location.address,
                  },
              }),
              ...(data.location.latitude &&
                  data.location.longitude && {
                      geo: {
                          "@type": "GeoCoordinates",
                          latitude: data.location.latitude,
                          longitude: data.location.longitude,
                      },
                  }),
          }
        : undefined;

    // Build offers object
    const offers = {
        "@type": "Offer",
        url: canonicalUrl,
        price: data.isFree ? "0" : String(data.price || "0"),
        priceCurrency: data.priceCurrency || "USD",
        availability: `https://schema.org/${data.availability || "InStock"}`,
    };

    return {
        "@context": "https://schema.org",
        "@type": "Event",
        name: data.title,
        description: data.description,
        image: imageUrl,
        url: canonicalUrl,
        startDate: data.startDate,
        endDate: data.endDate || data.startDate,
        ...(location && { location }),
        ...(data.performer && {
            performer: {
                "@type": "Person",
                name: data.performer,
            },
        }),
        offers,
        organizer: {
            "@type": "Organization",
            name: config.name,
        },
        ...(data.category && { eventCategory: data.category }),
    };
}

/**
 * Build Place JSON-LD schema for venues
 */
export function buildVenueSchema(data: VenueSEOData, site: SiteKey): object {
    const canonicalUrl = buildCanonicalUrl(data.url);
    const imageUrl = getImageUrl(data.image, site);

    return {
        "@context": "https://schema.org",
        "@type": "Place",
        name: data.name,
        description: data.description,
        image: imageUrl,
        url: canonicalUrl,
        ...(data.address && {
            address: {
                "@type": "PostalAddress",
                streetAddress: data.address,
                ...(data.neighborhood && { addressLocality: data.neighborhood }),
            },
        }),
        ...(data.latitude &&
            data.longitude && {
                geo: {
                    "@type": "GeoCoordinates",
                    latitude: data.latitude,
                    longitude: data.longitude,
                },
            }),
        ...(data.capacity && { maximumAttendeeCapacity: data.capacity }),
        ...(data.rating &&
            data.reviewCount && {
                aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: data.rating,
                    reviewCount: data.reviewCount,
                },
            }),
    };
}

/**
 * Build Person JSON-LD schema for performers
 */
export function buildPerformerSchema(data: PerformerSEOData, site: SiteKey): object {
    const canonicalUrl = buildCanonicalUrl(data.url);
    const imageUrl = getImageUrl(data.image, site);

    return {
        "@context": "https://schema.org",
        "@type": "Person",
        name: data.name,
        description: data.bio || data.description,
        image: imageUrl,
        url: canonicalUrl,
        ...(data.homeCity && { homeLocation: { "@type": "Place", name: data.homeCity } }),
        ...(data.genres &&
            data.genres.length > 0 && {
                knowsAbout: data.genres,
            }),
    };
}

/**
 * Build LocalBusiness JSON-LD schema
 */
export function buildBusinessSchema(data: BusinessSEOData, site: SiteKey): object {
    const canonicalUrl = buildCanonicalUrl(data.url);
    const imageUrl = getImageUrl(data.image, site);

    return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: data.name,
        description: data.description,
        image: imageUrl,
        url: canonicalUrl,
        ...(data.address && {
            address: {
                "@type": "PostalAddress",
                streetAddress: data.address,
                ...(data.city && { addressLocality: data.city }),
                ...(data.state && { addressRegion: data.state }),
                ...(data.postalCode && { postalCode: data.postalCode }),
                ...(data.country && { addressCountry: data.country }),
            },
        }),
        ...(data.latitude &&
            data.longitude && {
                geo: {
                    "@type": "GeoCoordinates",
                    latitude: data.latitude,
                    longitude: data.longitude,
                },
            }),
        ...(data.phone && { telephone: data.phone }),
        ...(data.website && { sameAs: [data.website] }),
        ...(data.rating &&
            data.reviewCount && {
                aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: data.rating,
                    reviewCount: data.reviewCount,
                },
            }),
    };
}

/**
 * Build WebSite JSON-LD schema for homepages
 * Includes SearchAction for sitelinks search box
 */
export function buildWebsiteSchema(data: WebsiteSEOData, site: SiteKey): object {
    const config = getSiteConfig(site);
    const canonicalUrl = buildCanonicalUrl(data.url);

    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: data.siteName || config.name,
        description: data.description,
        url: canonicalUrl,
        publisher: {
            "@type": "Organization",
            name: config.name,
            logo: {
                "@type": "ImageObject",
                url: buildCanonicalUrl(config.defaultImage),
            },
        },
    };
}

/**
 * Build JSON-LD schema based on content type
 */
export function buildJsonLd(
    type: "article" | "event" | "venue" | "performer" | "business" | "website",
    data: ArticleSEOData | EventSEOData | VenueSEOData | PerformerSEOData | BusinessSEOData | WebsiteSEOData,
    site: SiteKey,
): object {
    switch (type) {
        case "article":
            return buildArticleSchema(data as ArticleSEOData, site);
        case "event":
            return buildEventSchema(data as EventSEOData, site);
        case "venue":
            return buildVenueSchema(data as VenueSEOData, site);
        case "performer":
            return buildPerformerSchema(data as PerformerSEOData, site);
        case "business":
            return buildBusinessSchema(data as BusinessSEOData, site);
        case "website":
            return buildWebsiteSchema(data as WebsiteSEOData, site);
        default:
            return {};
    }
}
