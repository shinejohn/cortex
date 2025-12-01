import { SEO } from "@/components/common/seo";
import Advertisement from "@/components/day-news/advertisement";
import DayNewsHeader from "@/components/day-news/day-news-header";
import LocationPrompt from "@/components/day-news/location-prompt";
import NewsArticleCard from "@/components/day-news/news-article-card";
import NewspaperMasthead from "@/components/day-news/newspaper-masthead";
import { LocationProvider, useLocation } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { Newspaper } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Region {
    id: string;
    name: string;
    slug: string;
    type: string;
    full_name?: string;
}

interface Author {
    id: string;
    name: string;
}

interface Workspace {
    id: number;
    name: string;
}

interface NewsArticle {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    featured_image: string | null;
    published_at: string;
    view_count: number;
    author: Author | null;
    workspace?: Workspace | null;
    regions: Region[];
    type?: string;
    category?: string | null;
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

interface Advertisements {
    banner: Ad[];
    featured: Ad[];
    inline: Ad[];
    sidebar: Ad[];
}

interface DayNewsIndexProps {
    auth?: Auth;
    news: NewsArticle[];
    hasRegion: boolean;
    advertisements: Advertisements;
}

function DayNewsContent({
    news,
    hasRegion,
    advertisements,
}: {
    news: NewsArticle[];
    hasRegion: boolean;
    advertisements: Advertisements;
}) {
    const { currentRegion } = useLocation();

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

    if (!hasRegion || news.length === 0) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4 py-24">
                <div className="text-center">
                    <Newspaper className="mx-auto mb-4 size-16 text-muted-foreground" />
                    <h2 className="mb-2 text-2xl font-bold">No Local News Available</h2>
                    <p className="mx-auto max-w-md text-muted-foreground">
                        {hasRegion
                            ? "There are no news articles available for your region yet. Check back soon!"
                            : "Select your location to see news relevant to your area."}
                    </p>
                </div>
            </div>
        );
    }

    const featuredArticle = news[0];
    const topStories = news.slice(1, 4);
    const otherStories = news.slice(4);

    return (
        <>
            {/* Newspaper masthead */}
            <NewspaperMasthead region={currentRegion} />

            {/* Banner Ad */}
            {advertisements.banner.length > 0 && (
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    {advertisements.banner.map((ad) => (
                        <Advertisement key={ad.id} ad={ad} onImpression={handleAdImpression} onClick={handleAdClick} />
                    ))}
                </div>
            )}

            {/* Main content */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Featured article */}
                <div className="mb-8">
                    <h2 className="mb-4 border-b-2 border-border pb-2 font-serif text-3xl font-bold">Headlines</h2>
                    <NewsArticleCard article={featuredArticle} featured />
                </div>

                {/* Top stories grid with featured ad */}
                {topStories.length > 0 && (
                    <div className="mb-8">
                        <h2 className="mb-4 border-b-2 border-border pb-2 font-serif text-2xl font-bold">Top Stories</h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {topStories.map((article) => (
                                <NewsArticleCard key={article.id} article={article} />
                            ))}
                            {/* Featured ad in grid */}
                            {advertisements.featured.length > 0 && (
                                <NewsArticleCard
                                    key={`ad-${advertisements.featured[0].id}`}
                                    article={{
                                        id: String(advertisements.featured[0].advertable.id),
                                        title: advertisements.featured[0].advertable.title,
                                        slug: advertisements.featured[0].advertable.slug,
                                        excerpt: advertisements.featured[0].advertable.excerpt,
                                        featured_image: advertisements.featured[0].advertable.featured_image,
                                        published_at: advertisements.featured[0].expires_at,
                                        view_count: 0,
                                        author: null,
                                        regions: [],
                                    }}
                                    isSponsored={true}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* More news with inline ads and sidebar */}
                {otherStories.length > 0 && (
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main column */}
                        <div className="lg:col-span-2">
                            <h2 className="mb-4 border-b-2 border-border pb-2 font-serif text-2xl font-bold">Latest News</h2>
                            <div className="grid gap-6 sm:grid-cols-2">
                                {otherStories.slice(0, 6).map((article, index) => (
                                    <React.Fragment key={article.id}>
                                        <NewsArticleCard article={article} />
                                        {/* Insert inline ad after every 3rd article */}
                                        {(index + 1) % 3 === 0 && advertisements.inline.length > Math.floor((index + 1) / 3) - 1 && (
                                            <div className="sm:col-span-2">
                                                <Advertisement
                                                    key={`inline-${advertisements.inline[Math.floor((index + 1) / 3) - 1].id}`}
                                                    ad={advertisements.inline[Math.floor((index + 1) / 3) - 1]}
                                                    onImpression={handleAdImpression}
                                                    onClick={handleAdClick}
                                                />
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar with ads */}
                        <div>
                            <h2 className="mb-4 border-b-2 border-border pb-2 font-serif text-xl font-bold">More Stories</h2>
                            <div className="space-y-0">
                                {otherStories.slice(6).map((article) => (
                                    <NewsArticleCard key={article.id} article={article} compact />
                                ))}
                            </div>

                            {/* Sidebar ads */}
                            {advertisements.sidebar.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="mb-4 border-b border-border pb-2 text-sm font-semibold text-muted-foreground">Sponsored</h3>
                                    <div className="space-y-4">
                                        {advertisements.sidebar.map((ad) => (
                                            <Advertisement key={ad.id} ad={ad} onImpression={handleAdImpression} onClick={handleAdClick} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default function DayNewsIndex({ auth, news, hasRegion, advertisements }: DayNewsIndexProps) {
    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Your Daily Source for Local Stories",
                        description:
                            "Stay informed with the latest local news, stories, and updates from your community. Day News brings you relevant, timely coverage.",
                        url: "/",
                    }}
                />
                <DayNewsHeader auth={auth} />
                <LocationPrompt />
                <DayNewsContent news={news} hasRegion={hasRegion} advertisements={advertisements} />
            </div>
        </LocationProvider>
    );
}
