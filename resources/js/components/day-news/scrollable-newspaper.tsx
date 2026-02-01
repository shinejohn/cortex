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
        <div className="relative flex w-full flex-col h-full">
            {/* Newspaper container */}
            <div
                ref={newspaperRef}
                className="newspaper-container flex-1 overflow-y-auto bg-gray-100 border border-gray-300 rounded-md max-h-[80vh] scrollbar-hide"
            >
                <div className="newspaper-content bg-white p-6 md:p-10 shadow-2xl mx-auto max-w-[1000px]">
                    {/* Newspaper Header */}
                    <div className="text-center mb-12 pb-6 border-b-4 border-double border-news-primary">
                        <p className="text-xs text-gray-500 mb-2 font-serif uppercase tracking-[0.3em]">Volume 98 • Issue 245</p>
                        <h1 className="font-serif text-5xl md:text-7xl font-black uppercase mb-4 tracking-tighter">
                            {regionName ? `${regionName} Daily` : "Today's Newspaper"}
                        </h1>
                        <div className="flex items-center justify-center gap-6 text-sm font-serif border-t border-gray-200 mt-4 pt-4">
                            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            <span className="italic font-bold text-news-primary flex items-center">
                                <span className="mr-2 inline-block h-3 w-3 bg-news-primary rounded-full animate-pulse"></span>
                                Live Edition
                            </span>
                            <span>Est. 1928</span>
                        </div>
                    </div>

                    {/* Front Page - Top Story */}
                    <div className="mb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <h2 className="font-serif text-3xl font-black uppercase text-news-primary">Front Page</h2>
                            <div className="h-0.5 flex-1 bg-news-primary"></div>
                        </div>
                        <NewsArticleCard article={featuredArticle} featured />
                    </div>

                    {/* Multi-column grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                        {/* Left Column: Trending & Announcements */}
                        <div className="md:col-span-4 space-y-10 border-r-0 md:border-r border-gray-100 pr-0 md:pr-5">
                            <div>
                                <h3 className="font-serif text-xl font-bold border-b border-gray-800 mb-4 pb-1">Regional News</h3>
                                <div className="space-y-6">
                                    {columnArticles.slice(0, 3).map(article => (
                                        <NewsArticleCard key={article.id} article={article} compact />
                                    ))}
                                </div>
                            </div>

                            <AnnouncementsSection announcements={announcements} />
                        </div>

                        {/* Middle Column: More news */}
                        <div className="md:col-span-4 space-y-10 border-r-0 md:border-r border-gray-100 pr-0 md:pr-5">
                            <div>
                                <h3 className="font-serif text-xl font-bold border-b border-gray-800 mb-4 pb-1">Essential Reads</h3>
                                <div className="space-y-6">
                                    {columnArticles.slice(3, 6).map(article => (
                                        <NewsArticleCard key={article.id} article={article} compact />
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded border-2 border-dashed border-gray-200">
                                <h4 className="text-center font-serif text-lg font-bold italic mb-2">Notice to Readers</h4>
                                <p className="text-[10px] text-gray-600 text-center leading-relaxed">
                                    The Day News editorial team is dedicated to bringing you the most accurate local coverage. Become a subscriber to support independent journalism in your community.
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Marketplace & Other */}
                        <div className="md:col-span-4 space-y-10">
                            <MarketplaceSection classifieds={classifieds} />

                            <div>
                                <h3 className="font-serif text-xl font-bold border-b border-gray-800 mb-4 pb-1">Community Voices</h3>
                                <div className="space-y-6">
                                    {columnArticles.slice(6, 9).map(article => (
                                        <NewsArticleCard key={article.id} article={article} compact />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-20 pt-8 border-t border-gray-300">
                        <p className="text-xs text-gray-500 font-serif lowercase tracking-widest italic">
                            Published by Day News Multisite Platform
                        </p>
                    </div>
                </div>
            </div>

            {/* Scroll controls */}
            <div className="flex justify-center mt-6 space-x-6">
                <button
                    onClick={scrollToTop}
                    className="bg-news-primary text-white rounded-full p-3 shadow-lg hover:bg-news-primary-dark transition-all transform hover:scale-110"
                    aria-label="Scroll to top"
                >
                    <ChevronUp className="h-6 w-6" />
                </button>
                <button
                    onClick={scrollDown}
                    className="bg-news-primary text-white rounded-full p-3 shadow-lg hover:bg-news-primary-dark transition-all transform hover:scale-110"
                    aria-label="Scroll down"
                >
                    <ChevronDown className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
};

export default ScrollableNewspaper;
