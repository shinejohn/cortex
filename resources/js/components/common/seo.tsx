import { Head } from "@inertiajs/react";
import { buildCanonicalUrl, getImageUrl, getSiteConfig, truncateText } from "@/lib/seo/config";
import { buildJsonLd } from "@/lib/seo/json-ld";
import type { SEOProps } from "@/types/seo";

/**
 * SEO Component
 *
 * A comprehensive SEO component that handles:
 * - JSON-LD structured data for AI and search engine visibility
 * - Open Graph meta tags for social sharing
 * - Twitter Card meta tags
 * - Standard meta tags (description, canonical, robots)
 *
 * Supports multiple content types:
 * - article: News articles (Day News)
 * - event: Events (Go Event City)
 * - venue: Venues (Go Event City)
 * - performer: Performers (Go Event City)
 * - business: Local businesses (Downtown Guide)
 * - website: Homepages (All sites)
 *
 * @example
 * // For a news article
 * <SEO
 *   type="article"
 *   site="day-news"
 *   data={{
 *     title: post.title,
 *     description: post.excerpt,
 *     image: post.featured_image,
 *     url: `/posts/${post.slug}`,
 *     publishedAt: post.published_at,
 *     author: post.author?.name,
 *   }}
 * />
 *
 * @example
 * // For an event
 * <SEO
 *   type="event"
 *   site="event-city"
 *   data={{
 *     title: event.title,
 *     description: event.description,
 *     image: event.image,
 *     url: `/events/${event.id}`,
 *     startDate: event.event_date,
 *     location: { name: event.venue?.name, address: event.venue?.address },
 *   }}
 * />
 */
export function SEO(props: SEOProps) {
    const { type, site, data, noIndex = false } = props;

    const config = getSiteConfig(site);
    const canonicalUrl = buildCanonicalUrl(data.url);
    const imageUrl = getImageUrl(data.image, site);
    const description = truncateText(data.description || "", 160);

    // Build JSON-LD structured data
    const jsonLd = buildJsonLd(type, data, site);
    const jsonLdString = JSON.stringify(jsonLd);

    // Determine Open Graph type
    const getOgType = () => {
        switch (type) {
            case "article":
                return "article";
            case "event":
                return "event";
            case "business":
            case "venue":
                return "place";
            case "performer":
                return "profile";
            case "website":
            default:
                return "website";
        }
    };

    // Get article data for meta tags
    const articleData = type === "article" ? (data as { publishedAt?: string | null; author?: string | null; section?: string | null }) : null;

    // Get event data for meta tags
    const eventData = type === "event" ? (data as { startDate: string; endDate?: string }) : null;

    return (
        <>
            <Head>
                <title>{`${data.title} - ${config.name}`}</title>
                <meta name="description" content={description} />
                <link rel="canonical" href={canonicalUrl} />
                {noIndex && <meta name="robots" content="noindex, nofollow" />}
                <meta property="og:title" content={data.title} />
                <meta property="og:description" content={description} />
                <meta property="og:image" content={imageUrl} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:type" content={getOgType()} />
                <meta property="og:site_name" content={config.name} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={data.title} />
                <meta name="twitter:description" content={description} />
                <meta name="twitter:image" content={imageUrl} />
                {articleData?.publishedAt && <meta property="article:published_time" content={articleData.publishedAt} />}
                {articleData?.author && <meta property="article:author" content={articleData.author} />}
                {articleData?.section && <meta property="article:section" content={articleData.section} />}
                {eventData && <meta property="event:start_date" content={eventData.startDate} />}
                {eventData?.endDate && <meta property="event:end_date" content={eventData.endDate} />}
            </Head>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString }} />
        </>
    );
}

export default SEO;
