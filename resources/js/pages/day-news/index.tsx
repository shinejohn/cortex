import { Newspaper, DollarSign } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import Advertisement from "@/components/day-news/advertisement";
import NewspaperMasthead from "@/components/day-news/newspaper-masthead";
import AnnouncementsSection from "@/components/day-news/announcements-section";
import MarketplaceSection from "@/components/day-news/marketplace-section";
import CouponsPreview from "@/components/day-news/coupons-preview";
import EventsPreview from "@/components/day-news/events-preview";
import ScrollableNewspaper from "@/components/day-news/scrollable-newspaper";
import CommunityVoicesWidget from "@/components/day-news/community-voices-widget";
import { useLocation } from "@/contexts/location-context";
import type { Auth } from "@/types";
import type { SocialPost } from "@/types/social";
import DayNewsLayout from "@/layouts/day-news-layout";
import DayNewsInfoBar from "@/components/day-news/day-news-info-bar";
import NewsArticleCard from "@/components/day-news/news-article-card";

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

interface LegalNotice {
    id: string;
    title: string;
    publish_date: string;
    case_number?: string;
}

interface DayNewsIndexProps {
    auth?: Auth;
    news: NewsArticle[];
    announcements: any[];
    legalNotices: LegalNotice[];
    classifieds: any[];
    coupons: any[];
    events: any[];
    socialPosts: SocialPost[];
    hasRegion: boolean;
    advertisements: Advertisements;
}

function DayNewsContent({ news, hasRegion, advertisements, announcements, legalNotices, classifieds, coupons, events, socialPosts }: { news: NewsArticle[]; hasRegion: boolean; advertisements: Advertisements; announcements: any[]; legalNotices: LegalNotice[]; classifieds: any[]; coupons: any[]; events: any[]; socialPosts: SocialPost[] }) {
    const { currentRegion } = useLocation();
    const [showNewspaperView, setShowNewspaperView] = useState(false);
    const [greeting, setGreeting] = useState('');
    const [activeReaders, setActiveReaders] = useState(247);

    // Set time-based greeting & active readers logic from spec
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            setGreeting('Good Morning');
        } else if (hour >= 12 && hour < 18) {
            setGreeting('Good Afternoon');
        } else {
            setGreeting('Good Evening');
        }

        const interval = setInterval(() => {
            setActiveReaders((prev) => Math.floor(Math.random() * 20) - 10 + prev);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

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
            {/* Info Bar & Masthead */}
            <DayNewsInfoBar region={currentRegion} activeReaders={activeReaders} />
            <NewspaperMasthead region={currentRegion} />

            {/* Banner Ad */}
            {advertisements.banner.length > 0 && (
                <div className="py-4">
                    {advertisements.banner.map((ad) => (
                        <Advertisement key={ad.id} ad={ad} onImpression={handleAdImpression} onClick={handleAdClick} />
                    ))}
                </div>
            )}

            {/* Main content */}
            <div className="py-8">
                {/* Spec View Toggle */}
                <div className="mb-6 flex items-center justify-between border-b pb-4">
                    <h2 className="font-serif text-3xl font-bold">Today's News</h2>
                    <div className="flex gap-2">
                        <Button
                            variant={showNewspaperView ? "outline" : "default"}
                            size="sm"
                            onClick={() => setShowNewspaperView(false)}
                        >
                            Regular View
                        </Button>
                        <Button
                            variant={showNewspaperView ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowNewspaperView(true)}
                        >
                            Newspaper View
                        </Button>
                    </div>
                </div>

                {showNewspaperView ? (
                    <ScrollableNewspaper
                        news={news}
                        announcements={announcements}
                        classifieds={classifieds}
                        regionName={currentRegion?.name}
                    />
                ) : (
                    <div className="grid gap-8 lg:grid-cols-12">
                        {/* LEFT COLUMN (Main Content) - Spans 5 columns */}
                        <div className="space-y-8 lg:col-span-5">
                            {/* Featured Article */}
                            <NewsArticleCard article={featuredArticle} featured />

                            {/* Top Stories List */}
                            {topStories.length > 0 && (
                                <div>
                                    <h3 className="mb-4 border-b pb-2 font-serif text-xl font-bold">Essential Reads</h3>
                                    <div className="space-y-6">
                                        {topStories.map((article) => (
                                            <NewsArticleCard key={article.id} article={article} compact />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* More News */}
                            {otherStories.length > 0 && (
                                <div>
                                    <h3 className="mb-4 border-b pb-2 font-serif text-xl font-bold">More Headlines</h3>
                                    <div className="space-y-6">
                                        {otherStories.slice(0, 4).map((article) => (
                                            <NewsArticleCard key={article.id} article={article} compact />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* MIDDLE COLUMN (Community & Trending) - Spans 4 columns */}
                        <div className="space-y-8 lg:col-span-4">
                            {/* Community Voices Feed */}
                            <CommunityVoicesWidget posts={socialPosts} />

                            {/* Trending / Popular */}
                            <div>
                                <h3 className="mb-4 border-b pb-2 font-serif text-xl font-bold">Trending in {currentRegion?.name}</h3>
                                <div className="space-y-4">
                                    {otherStories.slice(4, 7).map((article, idx) => (
                                        <div key={article.id} className="flex gap-3 items-start group cursor-pointer">
                                            <span className="text-2xl font-black text-muted-foreground/30 group-hover:text-news-primary transition-colors">
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <Link href={route('daynews.posts.show', article.slug) as any} className="font-bold leading-tight hover:underline">
                                                    {article.title}
                                                </Link>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {article.author?.name} • 4 min read
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Announcements Widget */}
                            <AnnouncementsSection announcements={announcements} />
                        </div>

                        {/* RIGHT COLUMN (Marketplace, Events, Ads) - Spans 3 columns */}
                        <div className="space-y-8 lg:col-span-3">
                            {/* Marketplace Preview */}
                            <div>
                                <div className="mb-4 flex items-center justify-between border-b pb-2">
                                    <h3 className="font-serif text-xl font-bold">Marketplace</h3>
                                    <Link href={route("daynews.classifieds.index") as any} className="text-xs font-bold text-news-primary uppercase hover:underline">See All</Link>
                                </div>
                                <div className="space-y-3">
                                    {classifieds.slice(0, 3).map((item) => (
                                        <Link key={item.id} href={route("daynews.classifieds.show", item.id) as any} className="block group">
                                            <div className="aspect-video w-full rounded-md bg-muted overflow-hidden mb-2">
                                                {item.images && item.images.length > 0 ? (
                                                    <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground bg-muted">
                                                        <DollarSign className="size-6 opacity-20" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="font-bold text-sm group-hover:underline">${item.price}</div>
                                            <div className="text-sm leading-tight text-muted-foreground line-clamp-2">{item.title}</div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Events List */}
                            <div>
                                <div className="mb-4 flex items-center justify-between border-b pb-2">
                                    <h3 className="font-serif text-xl font-bold">Upcoming Events</h3>
                                    <Link href={route("daynews.events.index") as any} className="text-xs font-bold text-news-primary uppercase hover:underline">Calendar</Link>
                                </div>
                                <div className="space-y-4">
                                    {events.map((event) => (
                                        <div key={event.id} className="flex gap-3">
                                            <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded border bg-muted/30">
                                                <span className="text-[10px] font-bold uppercase text-red-600">
                                                    {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                                                </span>
                                                <span className="text-lg font-bold leading-none">
                                                    {new Date(event.event_date).getDate()}
                                                </span>
                                            </div>
                                            <div>
                                                <Link href={route('daynews.events.show', event.id) as any} className="font-bold text-sm hover:underline line-clamp-2">
                                                    {event.title}
                                                </Link>
                                                <p className="text-xs text-muted-foreground mt-0.5">{event.venue?.name || "TBA"}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sidebar Ads */}
                            {advertisements.sidebar.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sponsored</h3>
                                    {advertisements.sidebar.map((ad) => (
                                        <Advertisement key={ad.id} ad={ad} onImpression={handleAdImpression} onClick={handleAdClick} />
                                    ))}
                                </div>
                            )}

                            {/* Legal Notices */}
                            {legalNotices.length > 0 && (
                                <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
                                    <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-news-primary">Legal Notices</h3>
                                    <div className="space-y-2">
                                        {legalNotices.map((notice) => (
                                            <Link
                                                key={notice.id}
                                                href={route("daynews.legal-notices.show", notice.id) as any}
                                                className="block border-b border-gray-100 pb-2 text-xs hover:text-news-primary"
                                            >
                                                <span className="font-semibold text-gray-500">{notice.publish_date}: </span>
                                                {notice.title}
                                            </Link>
                                        ))}
                                    </div>
                                    <Link href={route("daynews.legal-notices.index") as any} className="mt-2 block text-[10px] font-bold text-news-primary uppercase">View All</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}



export default function DayNewsIndex({ auth, news, hasRegion, advertisements, announcements, legalNotices, classifieds, coupons, events, socialPosts }: DayNewsIndexProps) {
    return (
        <DayNewsLayout
            auth={auth}
            showLocationPrompt
            seo={{
                title: "Your Daily Source for Local Stories",
                description: "Stay informed with the latest local news, stories, and updates from your community. Day News brings you relevant, timely coverage.",
                url: "/",
            }}
        >
            <DayNewsContent
                news={news}
                hasRegion={hasRegion}
                advertisements={advertisements}
                announcements={announcements}
                legalNotices={legalNotices}
                classifieds={classifieds}
                coupons={coupons}
                events={events}
                socialPosts={socialPosts}
            />
        </DayNewsLayout>
    );
}
