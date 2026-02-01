import { Link } from "@inertiajs/react";
import { Calendar, MapPin, TrendingUp } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

interface FeaturedItem {
    id: string;
    title: string;
    slug: string;
    view_count?: number;
    published_at?: string;
}

interface localEvent {
    id: string;
    title: string;
    event_date: string;
    location: string;
}

interface ArticleSidebarProps {
    trendingPosts: FeaturedItem[];
    upcomingEvents: localEvent[];
    className?: string;
}

export const ArticleSidebar = ({ trendingPosts, upcomingEvents, className }: ArticleSidebarProps) => {
    return (
        <div className={cn("space-y-8", className)}>
            {/* Trending Now */}
            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                <div className="flex items-center gap-2 bg-primary px-4 py-3 text-primary-foreground">
                    <TrendingUp className="size-4" />
                    <h3 className="font-semibold uppercase tracking-wider text-sm">Trending Now</h3>
                </div>
                <div className="divide-y">
                    {trendingPosts.map((post, index) => (
                        <Link key={post.id} href={`/posts/${post.slug}`} className="block p-4 transition-colors hover:bg-muted/50">
                            <div className="flex items-start gap-4">
                                <div className="text-2xl font-black text-muted-foreground/30">{String(index + 1).padStart(2, "0")}</div>
                                <div className="space-y-1">
                                    <h4 className="line-clamp-2 text-sm font-bold leading-tight hover:text-primary transition-colors">
                                        {post.title}
                                    </h4>
                                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                        {post.view_count?.toLocaleString()} readers
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Local Events */}
            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                <div className="flex items-center gap-2 bg-news-community/20 border-b px-4 py-3 text-news-community-foreground">
                    <Calendar className="size-4 text-news-community" />
                    <h3 className="font-semibold uppercase tracking-wider text-sm text-news-community">Upcoming Events</h3>
                </div>
                <div className="divide-y">
                    {upcomingEvents.map((event) => (
                        <Link key={event.id} href={`/events/${event.id}`} className="block p-4 transition-colors hover:bg-muted/50">
                            <h4 className="mb-2 text-sm font-bold leading-tight">{event.title}</h4>
                            <div className="space-y-1 text-[11px] text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="size-3" />
                                    <span>{new Date(event.event_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="size-3" />
                                    <span>{event.location}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                    <div className="p-4 bg-muted/20">
                        <Link href="/events" className="text-xs font-bold text-primary hover:underline uppercase tracking-widest flex items-center justify-between">
                            View Calendar
                            <TrendingUp className="size-3" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Premium Ad Slot */}
            <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-center">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Advertisement</div>
                <div className="bg-muted aspect-[300/600] rounded flex items-center justify-center text-xs text-muted-foreground/50 italic border">
                    Sponsor Message
                </div>
            </div>
        </div>
    );
};
