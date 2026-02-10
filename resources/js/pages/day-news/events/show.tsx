import { Head, Link, usePage } from "@inertiajs/react";
import { ArrowLeft, Calendar, MapPin, Share2, Clock } from "lucide-react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnnouncementSidebar } from "@/components/day-news/announcement-sidebar";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface Event {
    id: string;
    title: string;
    description: string;
    image: string | null;
    location: string | null;
    event_date: string;
    event_date_formatted: string;
    start_time: string | null;
    end_time: string | null;
    venue: {
        name: string;
        address: string;
    } | null;
    regions: Array<{
        id: string;
        name: string;
    }>;
}

interface ShowEventProps {
    [key: string]: unknown;
    auth?: Auth;
    event: Event;
    similarEvents: Event[];
}

export default function ShowEvent() {
    const { auth, event, similarEvents } = usePage<ShowEventProps>().props;

    return (
        <LocationProvider>
            <div className="min-h-screen bg-[#F8F9FB]">
                <Head title={`${event.title} - Day News`} />
                <SEO
                    type="article"
                    site="day-news"
                    data={{
                        title: event.title,
                        description: event.description.substring(0, 160),
                        image: event.image ?? undefined,
                        url: route("daynews.events.show", event.id),
                    }}
                />

                <DayNewsHeader auth={auth} />

                <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Navigation */}
                    <div className="mb-8 flex items-center justify-between">
                        <Link
                            href={route("daynews.events.index") as any}
                            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
                        >
                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                            BACK TO EVENTS
                        </Link>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="gap-2 font-bold rounded-full">
                                <Share2 className="size-3.5" />
                                SHARE
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                        {/* Main Content */}
                        <div className="lg:col-span-8">
                            <article>
                                <div className="mb-8">
                                    <div className="mb-4 flex items-center gap-3">
                                        <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors uppercase tracking-[0.2em] text-[10px] font-black px-3 py-1">
                                            Upcoming Event
                                        </Badge>
                                        <span className="text-xs font-bold text-muted-foreground">
                                            {event.event_date_formatted}
                                        </span>
                                    </div>
                                    <h1 className="mb-6 font-display text-4xl font-black leading-[1.1] tracking-tight md:text-5xl lg:text-6xl text-zinc-900">
                                        {event.title}
                                    </h1>
                                </div>

                                {event.image && (
                                    <div className="mb-10 overflow-hidden rounded-2xl shadow-xl shadow-zinc-200/50">
                                        <img
                                            src={event.image}
                                            alt={event.title}
                                            className="h-auto w-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="grid gap-8 md:grid-cols-3 mb-12">
                                    <div className="md:col-span-2 prose prose-zinc prose-lg max-w-none dark:prose-invert">
                                        <h3 className="font-display font-bold text-xl mb-4">About this Event</h3>
                                        <div className="whitespace-pre-wrap text-zinc-700/80 leading-[1.8]">
                                            {event.description}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="rounded-2xl bg-zinc-50 p-6 space-y-6">
                                            <div className="flex items-start gap-3">
                                                <Calendar className="size-5 text-primary mt-1" />
                                                <div>
                                                    <h4 className="font-bold text-zinc-900 mb-1">Date</h4>
                                                    <p className="text-sm text-muted-foreground">{event.event_date_formatted}</p>
                                                </div>
                                            </div>

                                            {(event.start_time || event.end_time) && (
                                                <div className="flex items-start gap-3">
                                                    <Clock className="size-5 text-primary mt-1" />
                                                    <div>
                                                        <h4 className="font-bold text-zinc-900 mb-1">Time</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {event.start_time}
                                                            {event.end_time && ` - ${event.end_time}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-start gap-3">
                                                <MapPin className="size-5 text-primary mt-1" />
                                                <div>
                                                    <h4 className="font-bold text-zinc-900 mb-1">Location</h4>
                                                    <p className="text-sm text-muted-foreground mb-1">{event.venue?.name || event.location || "TBD"}</p>
                                                    {event.venue?.address && (
                                                        <p className="text-xs text-muted-foreground/70">{event.venue.address}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4">
                            <AnnouncementSidebar />
                        </div>
                    </div>
                </main>
            </div>
        </LocationProvider>
    );
}
