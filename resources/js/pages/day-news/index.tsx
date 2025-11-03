import DayNewsHeader from "@/components/day-news/day-news-header";
import LocationPrompt from "@/components/day-news/location-prompt";
import NewsArticleCard from "@/components/day-news/news-article-card";
import NewspaperMasthead from "@/components/day-news/newspaper-masthead";
import { LocationProvider, useLocation } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { Head } from "@inertiajs/react";
import { Newspaper } from "lucide-react";
import React from "react";

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
    regions: Region[];
}

interface DayNewsIndexProps {
    auth?: Auth;
    news: NewsArticle[];
    hasRegion: boolean;
}

function DayNewsContent({ news, hasRegion }: { news: NewsArticle[]; hasRegion: boolean }) {
    const { currentRegion } = useLocation();

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

            {/* Main content */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Featured article */}
                <div className="mb-8">
                    <h2 className="mb-4 border-b-2 border-border pb-2 font-serif text-3xl font-bold">Headlines</h2>
                    <NewsArticleCard article={featuredArticle} featured />
                </div>

                {/* Top stories grid */}
                {topStories.length > 0 && (
                    <div className="mb-8">
                        <h2 className="mb-4 border-b-2 border-border pb-2 font-serif text-2xl font-bold">Top Stories</h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {topStories.map((article) => (
                                <NewsArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                    </div>
                )}

                {/* More news */}
                {otherStories.length > 0 && (
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main column */}
                        <div className="lg:col-span-2">
                            <h2 className="mb-4 border-b-2 border-border pb-2 font-serif text-2xl font-bold">Latest News</h2>
                            <div className="grid gap-6 sm:grid-cols-2">
                                {otherStories.slice(0, 6).map((article) => (
                                    <NewsArticleCard key={article.id} article={article} />
                                ))}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div>
                            <h2 className="mb-4 border-b-2 border-border pb-2 font-serif text-xl font-bold">More Stories</h2>
                            <div className="space-y-0">
                                {otherStories.slice(6).map((article) => (
                                    <NewsArticleCard key={article.id} article={article} compact />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default function DayNewsIndex({ auth, news, hasRegion }: DayNewsIndexProps) {
    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head>
                    <title>Day News - Your Daily Source for Local Stories</title>
                </Head>
                <DayNewsHeader auth={auth} />
                <LocationPrompt />
                <DayNewsContent news={news} hasRegion={hasRegion} />
            </div>
        </LocationProvider>
    );
}
