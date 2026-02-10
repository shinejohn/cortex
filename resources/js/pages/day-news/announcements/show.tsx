import { Head, Link, usePage } from "@inertiajs/react";
import { Calendar, Heart, MapPin, MessageSquare, ArrowLeft, Share2, MoreHorizontal } from "lucide-react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LocationProvider } from "@/contexts/location-context";
import { AnnouncementSidebar } from "@/components/day-news/announcement-sidebar";
import { AnnouncementCard } from "@/components/day-news/announcement-card";
import { cn } from "@/lib/utils";
import type { Auth } from "@/types";

interface Announcement {
    id: string;
    type: string;
    title: string;
    content: string;
    image: string | null;
    location: string | null;
    event_date: string | null;
    event_date_formatted?: string;
    published_at: string;
    published_at_diff?: string;
    views_count: number;
    reactions_count: number;
    comments_count: number;
    user: {
        id: string;
        name: string;
        avatar: string | null;
    };
    regions: Array<{
        id: string;
        name: string;
    }>;
}

interface ShowAnnouncementProps {
    [key: string]: unknown;
    auth?: Auth;
    announcement: Announcement;
    related: Announcement[];
    memorials: any[];
    upcomingEvents: any[];
    currentRegion: any;
}

export default function ShowAnnouncement() {
    const { auth, announcement, related, memorials, upcomingEvents, currentRegion } = usePage<ShowAnnouncementProps>().props;

    return (
        <LocationProvider>
            <div className="min-h-screen bg-[#FDFCFB]">
                <Head title={`${announcement.title} - Day News`} />
                <SEO
                    type="article"
                    site="day-news"
                    data={{
                        title: announcement.title,
                        description: announcement.content.substring(0, 160),
                        image: announcement.image ?? undefined,
                        url: route("daynews.announcements.show", announcement.id) as any,
                    }}
                />

                <DayNewsHeader auth={auth} />

                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Navigation */}
                    <div className="mb-8 flex items-center justify-between">
                        <Link
                            href={route("daynews.announcements.index") as any}
                            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
                        >
                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                            BACK TO ANNOUNCEMENTS
                        </Link>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="gap-2 font-bold rounded-full">
                                <Share2 className="size-3.5" />
                                SHARE
                            </Button>
                            <Button variant="outline" size="icon" className="size-9 rounded-full">
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                        {/* Main Content */}
                        <div className="lg:col-span-8">
                            <article>
                                <div className="mb-8">
                                    <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors uppercase tracking-[0.2em] text-[10px] font-black px-3 py-1">
                                        {announcement.type.replace("_", " ")}
                                    </Badge>
                                    <h1 className="mb-6 font-display text-4xl font-black leading-[1.1] tracking-tight md:text-5xl lg:text-6xl text-zinc-900">
                                        {announcement.title}
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-6 border-y py-6 border-zinc-100">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-10 border-2 border-white shadow-sm">
                                                <AvatarImage src={announcement.user.avatar ?? undefined} />
                                                <AvatarFallback className="bg-zinc-100 font-bold text-zinc-400">
                                                    {announcement.user.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-zinc-900 leading-none mb-1">{announcement.user.name}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Community Member</span>
                                            </div>
                                        </div>

                                        <Separator orientation="vertical" className="hidden h-8 sm:block bg-zinc-100" />

                                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="size-3.5 text-primary" />
                                                <span>{announcement.published_at_diff}</span>
                                            </div>
                                            {announcement.location && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="size-3.5 text-primary" />
                                                    <span>{announcement.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {announcement.image && (
                                    <div className="mb-10 overflow-hidden rounded-2xl border shadow-xl shadow-zinc-200/50">
                                        <img
                                            src={announcement.image!}
                                            alt={announcement.title}
                                            className="h-auto w-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="prose prose-zinc prose-lg max-w-none dark:prose-invert prose-p:leading-relaxed prose-headings:font-display prose-headings:font-black">
                                    <p className="whitespace-pre-wrap text-zinc-800/90 leading-relaxed text-xl font-medium mb-8 border-l-4 border-primary/20 pl-6 italic">
                                        {announcement.content.substring(0, announcement.content.indexOf('\n') > 0 ? announcement.content.indexOf('\n') : 200)}
                                    </p>
                                    <p className="whitespace-pre-wrap text-zinc-700/80 leading-[1.8]">
                                        {announcement.content}
                                    </p>
                                </div>

                                <div className="mt-12 flex items-center justify-between rounded-xl bg-zinc-50 p-6 border border-zinc-100">
                                    <div className="flex items-center gap-6">
                                        <button className="flex items-center gap-2 group">
                                            <div className="flex size-10 items-center justify-center rounded-full bg-white border shadow-sm group-hover:bg-red-50 group-hover:border-red-100 transition-colors">
                                                <Heart className="size-5 text-zinc-400 group-hover:text-red-500 transition-colors" />
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className="text-sm font-black text-zinc-900">{announcement.reactions_count}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reactions</span>
                                            </div>
                                        </button>
                                        <button className="flex items-center gap-2 group">
                                            <div className="flex size-10 items-center justify-center rounded-full bg-white border shadow-sm group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors">
                                                <MessageSquare className="size-5 text-zinc-400 group-hover:text-primary transition-colors" />
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className="text-sm font-black text-zinc-900">{announcement.comments_count}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Comments</span>
                                            </div>
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-2">Spread the word</span>
                                        <Button size="icon" variant="outline" className="rounded-full shadow-sm hover:text-primary transition-colors">
                                            <Share2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            </article>

                            {/* Related Announcements */}
                            {related.length > 0 && (
                                <div className="mt-20">
                                    <div className="mb-8 flex items-end justify-between">
                                        <div>
                                            <Badge variant="outline" className="mb-2 border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-2">
                                                Keep Reading
                                            </Badge>
                                            <h2 className="font-display text-3xl font-black tracking-tight text-zinc-900">Related Announcements</h2>
                                        </div>
                                        <Link href={route("daynews.announcements.index") as any} className="text-xs font-black text-primary hover:underline uppercase tracking-widest mb-1 items-center gap-1 hidden sm:flex">
                                            View all
                                            <ArrowLeft className="size-3 rotate-180" />
                                        </Link>
                                    </div>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {related.map((item) => (
                                            <AnnouncementCard key={item.id} announcement={item} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24">
                                <AnnouncementSidebar
                                    memorials={memorials}
                                    upcomingEvents={upcomingEvents}
                                    className="pt-0 shadow-lg shadow-zinc-200/50"
                                />

                                <div className="mt-8 rounded-2xl bg-primary/5 p-8 border border-primary/10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform duration-700 group-hover:scale-150 rotate-12">
                                        <MessageSquare className="size-32" />
                                    </div>
                                    <h4 className="relative z-10 mb-2 font-display text-xl font-black text-zinc-900">Post Yours</h4>
                                    <p className="relative z-10 mb-6 text-sm text-zinc-700/80 leading-relaxed font-medium">
                                        Have a milestone to share with your community? Let everyone know.
                                    </p>
                                    <Button className="relative z-10 w-full font-black uppercase tracking-tighter" asChild>
                                        <Link href={route("daynews.announcements.create") as any}>Create Announcement</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </LocationProvider>
    );
}
