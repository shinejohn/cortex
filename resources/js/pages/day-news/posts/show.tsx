import { SEO } from "@/components/common/seo";
import Advertisement from "@/components/day-news/advertisement";
import DayNewsHeader from "@/components/day-news/day-news-header";
import NewsArticleCard from "@/components/day-news/news-article-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import DOMPurify from "dompurify";
import { Calendar, Eye, MapPin, User } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

interface Region {
    id: number;
    name: string;
}

interface Author {
    id: number;
    name: string;
}

interface Workspace {
    id: number;
    name: string;
}

interface Post {
    id: number;
    type: string;
    category: string | null;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    featured_image: string | null;
    view_count: number;
    published_at: string | null;
    author: Author | null;
    workspace: Workspace | null;
    regions: Region[];
    metadata?: {
        image_attribution?: string;
        image_photographer?: string;
        image_alt?: string;
        [key: string]: unknown;
    };
}

interface Ad {
    id: number;
    placement: string;
    advertable: {
        id: number;
        title: string;
        excerpt: string | null;
        featured_image: string | null;
        slug: string;
    };
    expires_at: string;
}

interface RelatedPost {
    id: number;
    type: string;
    category: string | null;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image: string | null;
    view_count: number;
    published_at: string;
    author: Author | null;
    workspace: Workspace | null;
    regions: Region[];
}

interface ShowPostProps {
    auth?: Auth;
    post: Post;
    relatedPosts: RelatedPost[];
}

/**
 * Sanitizes HTML content and removes the first h1 tag (since title is shown separately).
 * Returns sanitized HTML string.
 */
function sanitizeContent(html: string): string {
    // Sanitize the HTML first
    const sanitized = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ["p", "h2", "h3", "h4", "h5", "h6", "strong", "em", "a", "ul", "ol", "li", "blockquote", "br", "span"],
        ALLOWED_ATTR: ["href", "target", "rel", "class"],
    });

    // Remove the first h1 tag if present (title is already displayed separately)
    return sanitized.replace(/^\s*<h1[^>]*>.*?<\/h1>\s*/i, "");
}

/**
 * Splits HTML content at a paragraph boundary near the middle.
 * Returns [firstHalf, secondHalf] of sanitized HTML.
 */
function splitHtmlContent(html: string): [string, string] {
    const sanitized = sanitizeContent(html);

    // Find all paragraph-like break points (closing tags that indicate a good split point)
    const breakPoints = [...sanitized.matchAll(/<\/(p|h[2-6]|li|blockquote)>/gi)];

    if (breakPoints.length < 2) {
        // Not enough break points, return all content in first half
        return [sanitized, ""];
    }

    // Find the break point closest to the middle
    const midPoint = sanitized.length / 2;
    let bestBreak = breakPoints[0];
    let bestDistance = Math.abs((bestBreak.index ?? 0) + bestBreak[0].length - midPoint);

    for (const bp of breakPoints) {
        const breakPosition = (bp.index ?? 0) + bp[0].length;
        const distance = Math.abs(breakPosition - midPoint);
        if (distance < bestDistance) {
            bestDistance = distance;
            bestBreak = bp;
        }
    }

    const splitIndex = (bestBreak.index ?? 0) + bestBreak[0].length;
    return [sanitized.slice(0, splitIndex), sanitized.slice(splitIndex)];
}

export default function ShowPost({ auth, post, relatedPosts }: ShowPostProps) {
    const [sidebarAds, setSidebarAds] = useState<Ad[]>([]);
    const [bannerAds, setBannerAds] = useState<Ad[]>([]);
    const [inlineAds, setInlineAds] = useState<Ad[]>([]);

    // Split content for inline ad insertion
    const [firstHalfContent, secondHalfContent] = useMemo(() => splitHtmlContent(post.content), [post.content]);

    useEffect(() => {
        const regionId = post.regions[0]?.id;

        // Fetch sidebar ads
        fetch(`/api/advertisements?platform=day_news&placement=sidebar&region_id=${regionId}`)
            .then((res) => res.json())
            .then((data) => setSidebarAds(data.ads))
            .catch((err) => console.error("Failed to fetch sidebar ads:", err));

        // Fetch banner ads
        fetch(`/api/advertisements?platform=day_news&placement=banner&region_id=${regionId}`)
            .then((res) => res.json())
            .then((data) => setBannerAds(data.ads))
            .catch((err) => console.error("Failed to fetch banner ads:", err));

        // Fetch inline ads
        fetch(`/api/advertisements?platform=day_news&placement=inline&region_id=${regionId}`)
            .then((res) => res.json())
            .then((data) => setInlineAds(data.ads))
            .catch((err) => console.error("Failed to fetch inline ads:", err));
    }, [post.regions]);

    const handleAdImpression = (adId: number) => {
        fetch(`/api/advertisements/${adId}/impression`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
    };

    const handleAdClick = (adId: number) => {
        fetch(`/api/advertisements/${adId}/click`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
    };

    // Strip HTML tags for plain text content (for JSON-LD articleBody)
    const plainTextContent = useMemo(() => {
        return post.content.replace(/<[^>]*>/g, "").trim();
    }, [post.content]);

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <SEO
                    type="article"
                    site="day-news"
                    data={{
                        title: post.title,
                        description: post.excerpt || undefined,
                        image: post.featured_image,
                        url: `/posts/${post.slug}`,
                        publishedAt: post.published_at,
                        author: post.author?.name,
                        section: post.category,
                        articleBody: plainTextContent,
                    }}
                />
                <DayNewsHeader auth={auth} />

                {/* Banner Ad */}
                {bannerAds.length > 0 && (
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        {bannerAds.map((ad) => (
                            <Advertisement key={ad.id} ad={ad} onImpression={handleAdImpression} onClick={handleAdClick} />
                        ))}
                    </div>
                )}

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main content */}
                        <article className="lg:col-span-2">
                            {/* Post header */}
                            <div className="mb-6">
                                <div className="mb-4 flex flex-wrap gap-2">
                                    <Badge className="capitalize">{post.type}</Badge>
                                    {post.category && (
                                        <Badge variant="outline" className="capitalize">
                                            {post.category.replace("_", " ")}
                                        </Badge>
                                    )}
                                    {post.regions.map((region) => (
                                        <Badge key={region.id} variant="secondary">
                                            <MapPin className="mr-1 size-3" />
                                            {region.name}
                                        </Badge>
                                    ))}
                                </div>

                                <h1 className="mb-4 text-4xl font-bold leading-tight">{post.title}</h1>

                                {post.excerpt && <p className="mb-4 text-xl text-muted-foreground">{post.excerpt}</p>}

                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    {post.author && (
                                        <div className="flex items-center gap-2">
                                            <User className="size-4" />
                                            <span>By {post.author.name}</span>
                                        </div>
                                    )}

                                    {post.workspace && (
                                        <div className="flex items-center gap-2">
                                            <span>via {post.workspace.name}</span>
                                        </div>
                                    )}

                                    {post.published_at && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="size-4" />
                                            <span>{new Date(post.published_at).toLocaleDateString()}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <Eye className="size-4" />
                                        <span>{post.view_count} views</span>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            {/* Featured image */}
                            {post.featured_image && (
                                <div className="mb-6">
                                    <div className="overflow-hidden rounded-lg">
                                        <img
                                            src={post.featured_image}
                                            alt={post.metadata?.image_alt || post.title}
                                            className="w-full"
                                        />
                                    </div>
                                    {post.metadata?.image_attribution && (
                                        <div
                                            className="mt-2 text-xs text-muted-foreground"
                                            dangerouslySetInnerHTML={{
                                                __html: DOMPurify.sanitize(post.metadata.image_attribution, {
                                                    ALLOWED_TAGS: ["a"],
                                                    ALLOWED_ATTR: ["href", "target", "rel"],
                                                }),
                                            }}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Content with inline ad */}
                            <div
                                className="prose prose-lg max-w-none dark:prose-invert"
                                dangerouslySetInnerHTML={{ __html: firstHalfContent }}
                            />

                            {/* Inline Ad in the middle of content */}
                            {inlineAds.length > 0 && secondHalfContent && (
                                <div className="my-8">
                                    {inlineAds.slice(0, 1).map((ad) => (
                                        <Advertisement key={ad.id} ad={ad} onImpression={handleAdImpression} onClick={handleAdClick} />
                                    ))}
                                </div>
                            )}

                            {secondHalfContent && (
                                <div
                                    className="prose prose-lg max-w-none dark:prose-invert"
                                    dangerouslySetInnerHTML={{ __html: secondHalfContent }}
                                />
                            )}
                        </article>

                        {/* Sidebar */}
                        <aside className="space-y-6">
                            {/* Related Posts */}
                            {relatedPosts.length > 0 && (
                                <div>
                                    <h2 className="mb-4 border-b-2 border-border pb-2 font-serif text-xl font-bold">More from this Region</h2>
                                    <div className="space-y-0">
                                        {relatedPosts.map((relatedPost) => (
                                            <NewsArticleCard key={relatedPost.id} article={relatedPost} compact />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sponsored */}
                            {sidebarAds.length > 0 && (
                                <div>
                                    <h2 className="mb-4 border-b-2 border-border pb-2 font-serif text-xl font-bold">Sponsored</h2>
                                    <div className="space-y-4">
                                        {sidebarAds.map((ad) => (
                                            <Advertisement key={ad.id} ad={ad} onImpression={handleAdImpression} onClick={handleAdClick} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </div>
        </LocationProvider>
    );
}
