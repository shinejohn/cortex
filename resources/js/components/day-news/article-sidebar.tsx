import { Link } from "@inertiajs/react";
import { Calendar, MapPin, MessageSquare, TrendingUp, Users } from "lucide-react";
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
    commentCount?: number;
    shareCount?: number;
    className?: string;
}

export const ArticleSidebar = ({ trendingPosts, upcomingEvents, commentCount, shareCount, className }: ArticleSidebarProps) => {
    return (
        <div className={cn("space-y-8", className)}>
            {/* Premium Ad Slot */}
            <div className="sticky top-32">
                <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-center">
                    <div className="mb-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Advertisement</div>
                    <div className="flex aspect-[300/600] items-center justify-center rounded border bg-muted text-xs italic text-muted-foreground/50">
                        Sponsor Message
                    </div>
                </div>
            </div>

            {/* Trending Now */}
            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                <div className="flex items-center gap-2 bg-primary px-4 py-3 text-primary-foreground">
                    <TrendingUp className="size-4" />
                    <h3 className="font-display text-sm font-black uppercase tracking-widest">Trending Now</h3>
                </div>
                <div className="divide-y">
                    {trendingPosts.map((post, index) => (
                        <Link key={post.id} href={`/posts/${post.slug}`} className="block p-4 transition-colors hover:bg-muted/50">
                            <div className="flex items-start gap-4">
                                <div className="text-2xl font-black text-muted-foreground/30">{String(index + 1).padStart(2, "0")}</div>
                                <div className="space-y-1">
                                    <h4 className="line-clamp-2 text-sm font-bold leading-tight transition-colors hover:text-primary">
                                        {post.title}
                                    </h4>
                                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                        {post.view_count?.toLocaleString() ?? 0} readers
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Local Events */}
            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                <div className="flex items-center gap-2 border-b bg-yellow-50 px-4 py-3 dark:bg-yellow-950/20">
                    <Calendar className="size-4 text-yellow-700 dark:text-yellow-400" />
                    <h3 className="font-display text-sm font-black uppercase tracking-widest text-yellow-700 dark:text-yellow-400">
                        Local Events
                    </h3>
                </div>
                <div className="divide-y">
                    {upcomingEvents.map((event) => (
                        <Link key={event.id} href={`/events/${event.id}`} className="block p-4 transition-colors hover:bg-muted/50">
                            <h4 className="mb-2 text-sm font-bold leading-tight">{event.title}</h4>
                            <div className="space-y-1 text-[11px] text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="size-3" />
                                    <span>
                                        {new Date(event.event_date).toLocaleDateString(undefined, {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="size-3" />
                                    <span>{event.location}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                    <div className="bg-muted/20 p-4">
                        <Link
                            href="/events"
                            className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-primary hover:underline"
                        >
                            View Calendar
                            <TrendingUp className="size-3" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Engagement Widget */}
            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                <div className="flex items-center gap-2 bg-primary/90 px-4 py-3 text-primary-foreground">
                    <MessageSquare className="size-4" />
                    <h3 className="font-display text-sm font-black uppercase tracking-widest">Join the Discussion</h3>
                </div>
                <div className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm">
                            <MessageSquare className="size-3.5 text-primary" />
                            <span className="font-medium text-foreground">
                                {commentCount != null ? `${commentCount} Comments` : "Comments"}
                            </span>
                        </div>
                        <button className="text-sm text-primary hover:underline">View All</button>
                    </div>
                    <div className="mb-3 flex items-center gap-1 text-sm">
                        <Users className="size-3.5 text-primary" />
                        <span className="font-medium text-foreground">
                            {shareCount != null ? `${shareCount} Shares` : "Shares"}
                        </span>
                    </div>
                    <div className="mt-4 border-t pt-4">
                        <button
                            onClick={() => document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" })}
                            className="w-full rounded-md bg-primary py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            Join the Conversation
                        </button>
                    </div>
                </div>
            </div>

            {/* Second Ad Unit */}
            <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-center">
                <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Advertisement</div>
                <div className="flex h-[250px] items-center justify-center rounded border bg-muted text-xs italic text-muted-foreground/50">
                    300x250 Ad Unit
                </div>
            </div>
        </div>
    );
};
