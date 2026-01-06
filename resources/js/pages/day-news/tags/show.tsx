import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import NewsArticleCard from "@/components/day-news/news-article-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { router } from "@inertiajs/react";
import { Hash, TrendingUp, Users, Calendar, FileText } from "lucide-react";
import { Head, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Tag {
    id: string;
    name: string;
    slug: string;
    description: string;
    article_count: number;
    followers: number;
    is_trending: boolean;
    trending_score: number;
    created_at: string;
    related_tags: Array<{
        id: string;
        name: string;
        slug: string;
        weight: number;
    }>;
    top_contributors: Array<{
        id: string;
        name: string;
        avatar: string | null;
        articles: number;
        followers: number;
    }>;
    analytics: {
        views: number[];
        engagement: number[];
        periods: string[];
        peak_times: Array<{
            day: string;
            time: string;
            score: number;
        }>;
        related_events: Array<{
            id: string;
            name: string;
            date: string;
            location: string;
        }>;
    };
}

interface ContentItem {
    id: string;
    type: "article" | "event" | "business";
    title: string;
    excerpt?: string;
    description?: string;
    author?: {
        name: string;
        avatar: string | null;
    };
    organizer?: string;
    published_at?: string;
    date?: string;
    location?: string;
    image: string;
    engagement?: {
        likes: number;
        comments: number;
    };
    tags: string[];
    rating?: number;
    review_count?: number;
    slug: string;
}

interface TagPageProps {
    auth?: Auth;
    tag: Tag;
    content: ContentItem[];
    isFollowing: boolean;
}

export default function TagPage() {
    const { tag, content, isFollowing: initialFollowing } = usePage<TagPageProps>().props;
    const [isFollowing, setIsFollowing] = useState(initialFollowing);

    const handleFollow = async () => {
        try {
            const response = await fetch(`/api/follow/toggle`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                },
                body: JSON.stringify({
                    followable_type: "tag",
                    followable_id: tag.id,
                }),
            });
            const data = await response.json();
            setIsFollowing(data.following);
        } catch (error) {
            console.error("Error toggling follow:", error);
        }
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title={`${tag.name} - Day News`} />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: `${tag.name} - Day News`,
                        description: tag.description,
                        url: `/tag/${tag.slug}`,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Tag Header */}
                    <div className="mb-8">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="mb-4 flex items-center gap-3">
                                    <Hash className="size-8 text-primary" />
                                    <h1 className="text-4xl font-bold">{tag.name}</h1>
                                    {tag.is_trending && (
                                        <Badge variant="destructive" className="flex items-center gap-1">
                                            <TrendingUp className="size-3" />
                                            Trending
                                        </Badge>
                                    )}
                                </div>
                                <p className="mb-4 text-lg text-muted-foreground">{tag.description}</p>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Users className="size-4" />
                                        {tag.followers} followers
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FileText className="size-4" />
                                        {tag.article_count} articles
                                    </div>
                                    {tag.is_trending && (
                                        <div className="flex items-center gap-1">
                                            <TrendingUp className="size-4" />
                                            Score: {tag.trending_score}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Button onClick={handleFollow} variant={isFollowing ? "outline" : "default"}>
                                {isFollowing ? "Following" : "Follow"}
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <h2 className="mb-4 border-b-2 border-border pb-2 font-serif text-2xl font-bold">Content</h2>
                            <div className="space-y-6">
                                {content.length === 0 ? (
                                    <div className="py-12 text-center text-muted-foreground">
                                        <p>No content found for this tag.</p>
                                    </div>
                                ) : (
                                    content.map((item) => (
                                        <NewsArticleCard
                                            key={item.id}
                                            article={{
                                                id: String(item.id),
                                                title: item.title,
                                                slug: item.slug,
                                                excerpt: item.excerpt || item.description,
                                                featured_image: item.image,
                                                published_at: item.published_at || item.date,
                                                view_count: item.engagement?.likes || 0,
                                                author: item.author
                                                    ? {
                                                          id: String(item.author.name),
                                                          name: item.author.name,
                                                      }
                                                    : null,
                                                regions: [],
                                            }}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <aside className="space-y-6">
                            {/* Related Tags */}
                            {tag.related_tags.length > 0 && (
                                <div>
                                    <h3 className="mb-4 border-b border-border pb-2 font-serif text-xl font-bold">Related Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {tag.related_tags.map((relatedTag) => (
                                            <Badge
                                                key={relatedTag.id}
                                                variant="outline"
                                                className="cursor-pointer hover:bg-primary/10"
                                                onClick={() => router.visit(`/tag/${relatedTag.slug}`)}
                                            >
                                                {relatedTag.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Top Contributors */}
                            {tag.top_contributors.length > 0 && (
                                <div>
                                    <h3 className="mb-4 border-b border-border pb-2 font-serif text-xl font-bold">Top Contributors</h3>
                                    <div className="space-y-3">
                                        {tag.top_contributors.map((contributor) => (
                                            <div key={contributor.id} className="flex items-center gap-3">
                                                <Avatar className="size-10">
                                                    <AvatarImage src={contributor.avatar || undefined} alt={contributor.name} />
                                                    <AvatarFallback>{contributor.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="font-semibold">{contributor.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {contributor.articles} articles • {contributor.followers} followers
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Analytics */}
                            {tag.analytics.peak_times.length > 0 && (
                                <div>
                                    <h3 className="mb-4 border-b border-border pb-2 font-serif text-xl font-bold">Peak Times</h3>
                                    <div className="space-y-2">
                                        {tag.analytics.peak_times.map((peak, index) => (
                                            <div key={index} className="flex items-center justify-between text-sm">
                                                <div>
                                                    <div className="font-medium">{peak.day}</div>
                                                    <div className="text-muted-foreground">{peak.time}</div>
                                                </div>
                                                <Badge variant="secondary">{peak.score}</Badge>
                                            </div>
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

