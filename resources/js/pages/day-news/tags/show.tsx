import { Head, router, usePage } from "@inertiajs/react";
import { Calendar, FileText, Hash, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import NewsArticleCard from "@/components/day-news/news-article-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

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
    const { auth, tag, content, isFollowing: initialFollowing } = usePage<TagPageProps>().props;
    const [isFollowing, setIsFollowing] = useState(initialFollowing);

    const handleFollow = () => {
        router.post(
            `/api/follow/toggle`,
            {
                followable_type: "tag",
                followable_id: tag.id,
            },
            {
                preserveScroll: true,
                onSuccess: (page: any) => {
                    setIsFollowing(!isFollowing);
                },
            },
        );
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-gray-50">
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

                <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Tag Header */}
                    <div className="mb-8 overflow-hidden rounded-lg border-none bg-white p-6 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="mb-4 flex items-center gap-3">
                                    <Hash className="size-8 text-indigo-600" />
                                    <h1 className="font-display text-3xl font-black tracking-tight text-gray-900">
                                        {tag.name}
                                    </h1>
                                    {tag.is_trending && (
                                        <Badge className="flex items-center gap-1 bg-red-100 text-red-700">
                                            <TrendingUp className="size-3" />
                                            Trending
                                        </Badge>
                                    )}
                                </div>
                                <p className="mb-4 text-lg text-gray-600">{tag.description}</p>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <Users className="size-4 text-indigo-600" />
                                        <span className="font-medium text-gray-900">
                                            {tag.followers?.toLocaleString() ?? 0}
                                        </span>{" "}
                                        followers
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <FileText className="size-4 text-indigo-600" />
                                        <span className="font-medium text-gray-900">
                                            {tag.article_count?.toLocaleString() ?? 0}
                                        </span>{" "}
                                        articles
                                    </div>
                                    {tag.is_trending && (
                                        <div className="flex items-center gap-1.5">
                                            <TrendingUp className="size-4 text-indigo-600" />
                                            Score:{" "}
                                            <span className="font-medium text-gray-900">
                                                {tag.trending_score}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Button
                                onClick={handleFollow}
                                className={
                                    isFollowing
                                        ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                                }
                            >
                                {isFollowing ? "Following" : "Follow"}
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Content Stream - 2 columns */}
                        <div className="lg:col-span-2">
                            <h2 className="mb-4 border-b-2 border-gray-200 pb-2 font-display text-xl font-black tracking-tight text-gray-900">
                                Content
                            </h2>
                            <div className="space-y-6">
                                {content.length === 0 ? (
                                    <div className="overflow-hidden rounded-lg border-none bg-white py-12 text-center shadow-sm">
                                        <FileText className="mx-auto mb-3 size-10 text-gray-400" />
                                        <p className="text-gray-500">No content found for this tag.</p>
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
                                <div className="overflow-hidden rounded-lg border-none bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 border-b border-gray-200 pb-2 font-display text-lg font-black tracking-tight text-gray-900">
                                        Related Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {tag.related_tags.map((relatedTag) => (
                                            <Badge
                                                key={relatedTag.id}
                                                variant="outline"
                                                className="cursor-pointer border-gray-200 text-gray-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
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
                                <div className="overflow-hidden rounded-lg border-none bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 border-b border-gray-200 pb-2 font-display text-lg font-black tracking-tight text-gray-900">
                                        Top Contributors
                                    </h3>
                                    <div className="space-y-3">
                                        {tag.top_contributors.map((contributor) => (
                                            <div
                                                key={contributor.id}
                                                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-indigo-50/50"
                                            >
                                                <Avatar className="size-10">
                                                    <AvatarImage
                                                        src={contributor.avatar || undefined}
                                                        alt={contributor.name}
                                                    />
                                                    <AvatarFallback className="bg-indigo-100 text-indigo-700">
                                                        {contributor.name.slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-900">
                                                        {contributor.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {contributor.articles} articles *{" "}
                                                        {contributor.followers} followers
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Peak Times / Analytics */}
                            {tag.analytics?.peak_times?.length > 0 && (
                                <div className="overflow-hidden rounded-lg border-none bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 border-b border-gray-200 pb-2 font-display text-lg font-black tracking-tight text-gray-900">
                                        Peak Times
                                    </h3>
                                    <div className="space-y-2">
                                        {tag.analytics.peak_times.map((peak, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg p-2 text-sm hover:bg-gray-50"
                                            >
                                                <div>
                                                    <div className="font-medium text-gray-900">{peak.day}</div>
                                                    <div className="text-gray-500">{peak.time}</div>
                                                </div>
                                                <Badge className="bg-indigo-100 text-indigo-700">
                                                    {peak.score}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Related Events */}
                            {tag.analytics?.related_events?.length > 0 && (
                                <div className="overflow-hidden rounded-lg border-none bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 border-b border-gray-200 pb-2 font-display text-lg font-black tracking-tight text-gray-900">
                                        Related Events
                                    </h3>
                                    <div className="space-y-3">
                                        {tag.analytics.related_events.map((event) => (
                                            <div
                                                key={event.id}
                                                className="rounded-lg border border-gray-100 p-3 transition-colors hover:border-indigo-200 hover:bg-indigo-50/30"
                                            >
                                                <div className="font-medium text-gray-900">{event.name}</div>
                                                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                                    <Calendar className="size-3" />
                                                    {new Date(event.date).toLocaleDateString()}
                                                    {event.location && <span>* {event.location}</span>}
                                                </div>
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
