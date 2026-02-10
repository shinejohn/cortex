import { Deferred } from "@inertiajs/react";
import {
    Building2,
    CalendarDays,
    Camera,
    Megaphone,
    Newspaper,
    Scale,
    ShoppingBag,
    Tag,
} from "lucide-react";
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
import NewsArticleCard from "@/components/day-news/news-article-card";
import { useLocation } from "@/contexts/location-context";
import type { Auth } from "@/types";
import DayNewsLayout from "@/layouts/day-news-layout";

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
    hasRegion: boolean;
    advertisements: Advertisements;
}

function DayNewsContent({
    news,
    hasRegion,
    advertisements,
    announcements,
    legalNotices,
    classifieds,
    coupons,
    events,
}: {
    news: NewsArticle[];
    hasRegion: boolean;
    advertisements: Advertisements;
    announcements: any[];
    legalNotices: LegalNotice[];
    classifieds: any[];
    coupons: any[];
    events: any[];
}) {
    const { currentRegion } = useLocation();
    const [showNewspaperView, setShowNewspaperView] = useState(false);
    const [greeting, setGreeting] = useState("");
    const [activeReaders, setActiveReaders] = useState(247);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            setGreeting("Good Morning");
        } else if (hour >= 12 && hour < 18) {
            setGreeting("Good Afternoon");
        } else {
            setGreeting("Good Evening");
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
                {/* Decorative blobs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/5 blur-3xl" />
                </div>
                <div className="relative text-center">
                    <Newspaper className="mx-auto mb-6 size-16 text-muted-foreground/50" />
                    <h2 className="mb-3 font-display text-3xl font-black tracking-tight">No Local News Available</h2>
                    <p className="mx-auto max-w-md text-lg text-muted-foreground">
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
            {/* Header / Masthead */}
            <div className="relative overflow-hidden bg-white text-center">
                {/* Decorative blobs */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-20 left-1/4 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
                    <div className="absolute -bottom-20 right-1/4 h-60 w-60 rounded-full bg-indigo-500/5 blur-3xl" />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 pt-6 pb-4">
                    <div className="mb-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                        <div className="flex items-center">
                            <span className="relative mr-2 flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                            </span>
                            {activeReaders} neighbors reading now
                        </div>
                    </div>
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                        {greeting}, <span className="font-bold italic text-primary">{currentRegion?.name || "Neighbor"}</span>
                    </p>
                    <NewspaperMasthead region={currentRegion} />
                    <div className="mt-4 flex items-center justify-center border-y border-border/50 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        <span>
                            {new Date().toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </span>
                        <span className="mx-4 h-1 w-1 rounded-full bg-border" />
                        <span>Volume 98 &bull; Issue 245</span>
                        <span className="mx-4 h-1 w-1 rounded-full bg-border" />
                        <span className="text-primary">Official Local Edition</span>
                    </div>
                </div>
            </div>

            {/* Banner Ad */}
            {advertisements.banner.length > 0 && (
                <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    {advertisements.banner.map((ad) => (
                        <Advertisement key={ad.id} ad={ad} onImpression={handleAdImpression} onClick={handleAdClick} />
                    ))}
                </div>
            )}

            {/* Main content */}
            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* View Toggle */}
                <div className="mb-8 flex items-center justify-between border-b border-border/50 pb-4">
                    <h2 className="font-display text-3xl font-black tracking-tight">Headlines</h2>
                    <div className="flex gap-2">
                        <Button
                            variant={showNewspaperView ? "outline" : "default"}
                            size="sm"
                            className="font-bold uppercase tracking-wider text-[10px]"
                            onClick={() => setShowNewspaperView(false)}
                        >
                            Regular View
                        </Button>
                        <Button
                            variant={showNewspaperView ? "default" : "outline"}
                            size="sm"
                            className="font-bold uppercase tracking-wider text-[10px]"
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
                    <>
                        {/* Featured article */}
                        <div className="mb-10">
                            <NewsArticleCard article={featuredArticle} featured />
                        </div>

                        {/* Top stories grid with featured ad */}
                        {topStories.length > 0 && (
                            <div className="mb-10">
                                <div className="mb-6 flex items-center gap-3">
                                    <h2 className="font-display text-2xl font-black tracking-tight">Top Stories</h2>
                                    <div className="h-px flex-1 bg-border/50" />
                                </div>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {topStories.map((article) => (
                                        <NewsArticleCard key={article.id} article={article} />
                                    ))}
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

                        {/* Secondary content sections */}
                        <div className="mt-16 space-y-16">
                            {/* Events Section */}
                            <section>
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CalendarDays className="size-5 text-primary" />
                                        <h2 className="font-display text-2xl font-black tracking-tight">Local Events</h2>
                                    </div>
                                    <Link
                                        href={route("daynews.events.index") as any}
                                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                                    >
                                        See Calendar
                                    </Link>
                                </div>
                                <EventsPreview events={events} />
                            </section>

                            {/* Coupons Section */}
                            <section>
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Tag className="size-5 text-primary" />
                                        <h2 className="font-display text-2xl font-black tracking-tight">Community Deals</h2>
                                    </div>
                                    <Link
                                        href={route("daynews.coupons.index") as any}
                                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                                    >
                                        View All Coupons
                                    </Link>
                                </div>
                                <CouponsPreview coupons={coupons} />
                            </section>
                        </div>

                        {/* More news with sidebar */}
                        {otherStories.length > 0 && (
                            <div className="mt-16 grid gap-8 lg:grid-cols-3">
                                {/* Main column */}
                                <div className="lg:col-span-2">
                                    <div className="mb-6 flex items-center gap-3">
                                        <h2 className="font-display text-2xl font-black tracking-tight">Latest News</h2>
                                        <div className="h-px flex-1 bg-border/50" />
                                    </div>
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        {otherStories.slice(0, 6).map((article, index) => (
                                            <React.Fragment key={article.id}>
                                                <NewsArticleCard article={article} />
                                                {(index + 1) % 3 === 0 &&
                                                    advertisements.inline.length > Math.floor((index + 1) / 3) - 1 && (
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

                                {/* Sidebar */}
                                <div className="space-y-8">
                                    <AnnouncementsSection announcements={announcements} />
                                    <MarketplaceSection classifieds={classifieds} />

                                    {legalNotices.length > 0 && (
                                        <div className="group overflow-hidden rounded-2xl border border-border/50 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                                            <div className="mb-4 flex items-center gap-2">
                                                <Scale className="size-4 text-slate-500" />
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">
                                                    Legal Notices
                                                </h3>
                                            </div>
                                            <div className="space-y-3">
                                                {legalNotices.map((notice) => (
                                                    <Link
                                                        key={notice.id}
                                                        href={route("daynews.legal-notices.show", notice.id) as any}
                                                        className="block border-b border-border/30 pb-3 text-xs transition-colors hover:text-primary last:border-0 last:pb-0"
                                                    >
                                                        <span className="font-bold text-muted-foreground">{notice.publish_date}: </span>
                                                        <span className="font-medium">{notice.title}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                            <Link
                                                href={route("daynews.legal-notices.index") as any}
                                                className="mt-4 block text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                                            >
                                                View All
                                            </Link>
                                        </div>
                                    )}

                                    <div>
                                        <div className="mb-4 flex items-center gap-3">
                                            <h2 className="font-display text-xl font-black tracking-tight">More Stories</h2>
                                            <div className="h-px flex-1 bg-border/50" />
                                        </div>
                                        <div className="space-y-0">
                                            {otherStories.slice(6).map((article) => (
                                                <NewsArticleCard key={article.id} article={article} compact />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sidebar ads */}
                                    {advertisements.sidebar.length > 0 && (
                                        <div className="mt-8">
                                            <h3 className="mb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                Sponsored
                                            </h3>
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
                    </>
                )}
            </div>
        </>
    );
}

export default function DayNewsIndex({
    auth,
    news,
    hasRegion,
    advertisements,
    announcements,
    legalNotices,
    classifieds,
    coupons,
    events,
}: DayNewsIndexProps) {
    return (
        <DayNewsLayout
            auth={auth}
            showLocationPrompt
            seo={{
                title: "Your Daily Source for Local Stories",
                description:
                    "Stay informed with the latest local news, stories, and updates from your community. Day News brings you relevant, timely coverage.",
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
            />
        </DayNewsLayout>
    );
}
