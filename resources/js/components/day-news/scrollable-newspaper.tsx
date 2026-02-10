import React, { useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import NewsArticleCard from "./news-article-card";
import AnnouncementsSection from "./announcements-section";
import MarketplaceSection from "./marketplace-section";

interface ScrollableNewspaperProps {
    news: any[];
    announcements: any[];
    classifieds: any[];
    regionName?: string;
}

export const ScrollableNewspaper = ({ news, announcements, classifieds, regionName }: ScrollableNewspaperProps) => {
    const newspaperRef = useRef<HTMLDivElement>(null);

    const scrollToTop = () => {
        newspaperRef.current?.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const scrollDown = () => {
        if (newspaperRef.current) {
            newspaperRef.current.scrollBy({
                top: 500,
                behavior: "smooth",
            });
        }
    };

    if (!news || news.length === 0) return null;

    const featuredArticle = news[0];
    const columnArticles = news.slice(1, 10);

    return (
        <div className="relative flex h-full w-full flex-col">
            {/* Newspaper container */}
            <div
                ref={newspaperRef}
                className="newspaper-container scrollbar-hide max-h-[calc(100vh-220px)] flex-1 overflow-y-auto rounded-md border bg-muted/30 md:max-h-[calc(100vh-200px)]"
            >
                <div className="newspaper-content mx-auto max-w-[1000px] bg-card p-6 shadow-2xl md:p-10">
                    {/* Newspaper Header */}
                    <div className="mb-12 border-b-4 border-double border-primary pb-6 text-center">
                        <p className="mb-2 font-serif text-xs uppercase tracking-[0.3em] text-muted-foreground">
                            Volume 98 &bull; Issue 245
                        </p>
                        <h1 className="mb-4 font-display text-5xl font-black uppercase tracking-tighter md:text-7xl">
                            {regionName ? `${regionName} Daily` : "Today's Newspaper"}
                        </h1>
                        <div className="mt-4 flex items-center justify-center gap-6 border-t pt-4 font-serif text-sm text-muted-foreground">
                            <span>
                                {new Date().toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>
                            <span className="flex items-center font-bold italic text-primary">
                                <span className="mr-2 inline-block size-3 animate-pulse rounded-full bg-primary" />
                                Live Edition
                            </span>
                            <span>Est. 1928</span>
                        </div>
                    </div>

                    {/* Front Page - Top Story */}
                    <div className="mb-12">
                        <div className="mb-6 flex items-center gap-4">
                            <h2 className="font-display text-3xl font-black uppercase text-primary">Front Page</h2>
                            <div className="h-0.5 flex-1 bg-primary" />
                        </div>
                        <NewsArticleCard article={featuredArticle} featured />
                    </div>

                    {/* Multi-column grid */}
                    <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
                        {/* Left Column: Trending & Announcements */}
                        <div className="space-y-10 border-r-0 pr-0 md:col-span-4 md:border-r md:pr-5">
                            <div>
                                <h3 className="mb-4 border-b border-foreground pb-1 font-display text-xl font-black">
                                    Regional News
                                </h3>
                                <div className="space-y-6">
                                    {columnArticles.slice(0, 3).map((article) => (
                                        <NewsArticleCard key={article.id} article={article} compact />
                                    ))}
                                </div>
                            </div>

                            <AnnouncementsSection announcements={announcements} />
                        </div>

                        {/* Middle Column: More news */}
                        <div className="space-y-10 border-r-0 pr-0 md:col-span-4 md:border-r md:pr-5">
                            <div>
                                <h3 className="mb-4 border-b border-foreground pb-1 font-display text-xl font-black">
                                    Essential Reads
                                </h3>
                                <div className="space-y-6">
                                    {columnArticles.slice(3, 6).map((article) => (
                                        <NewsArticleCard key={article.id} article={article} compact />
                                    ))}
                                </div>
                            </div>

                            <div className="rounded border-2 border-dashed bg-muted/30 p-4">
                                <h4 className="mb-2 text-center font-serif text-lg font-bold italic">Notice to Readers</h4>
                                <p className="text-center text-[10px] leading-relaxed text-muted-foreground">
                                    The Day News editorial team is dedicated to bringing you the most accurate local coverage. Become a
                                    subscriber to support independent journalism in your community.
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Marketplace & Other */}
                        <div className="space-y-10 md:col-span-4">
                            <MarketplaceSection classifieds={classifieds} />

                            <div>
                                <h3 className="mb-4 border-b border-foreground pb-1 font-display text-xl font-black">
                                    Community Voices
                                </h3>
                                <div className="space-y-6">
                                    {columnArticles.slice(6, 9).map((article) => (
                                        <NewsArticleCard key={article.id} article={article} compact />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-20 border-t pt-8 text-center">
                        <p className="font-serif text-xs lowercase italic tracking-widest text-muted-foreground">
                            Published by Day News Multisite Platform
                        </p>
                    </div>
                </div>
            </div>

            {/* Scroll controls */}
            <div className="mt-6 flex justify-center gap-6">
                <button
                    onClick={scrollToTop}
                    className="transform rounded-full bg-primary p-3 text-primary-foreground shadow-lg transition-all hover:scale-110 hover:bg-primary/90"
                    aria-label="Scroll to top"
                >
                    <ChevronUp className="size-6" />
                </button>
                <button
                    onClick={scrollDown}
                    className="transform rounded-full bg-primary p-3 text-primary-foreground shadow-lg transition-all hover:scale-110 hover:bg-primary/90"
                    aria-label="Scroll down"
                >
                    <ChevronDown className="size-6" />
                </button>
            </div>
        </div>
    );
};

export default ScrollableNewspaper;
