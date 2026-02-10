import { Link } from "@inertiajs/react";
import { Calendar, ChevronRight, Clock, ExternalLink, MapPin } from "lucide-react";
import React from "react";

interface EventItem {
    id: string;
    title: string;
    image: string | null;
    event_date: string;
    time: string;
    description: string;
    category: string;
    venue?: { name: string; neighborhood?: string };
}

interface EventsPreviewProps {
    events: EventItem[];
}

export const EventsPreview = ({ events }: EventsPreviewProps) => {
    if (!events || events.length === 0) {
        return null;
    }

    const featuredEvent = events[0];
    const upcomingEvents = events.slice(1);

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Featured Event - Takes up 1/3 of the width */}
            {featuredEvent && (
                <div className="lg:col-span-1">
                    <div className="group flex h-full flex-col overflow-hidden rounded-lg border-none bg-card shadow-sm transition-all hover:shadow-md">
                        <div className="border-b bg-muted/30 p-4">
                            <h3 className="flex items-center text-sm font-bold text-foreground">
                                <Calendar className="mr-2 size-4 text-primary" />
                                Featured Event
                            </h3>
                        </div>
                        <div className="relative h-48 overflow-hidden">
                            {featuredEvent.image ? (
                                <img
                                    src={featuredEvent.image}
                                    alt={featuredEvent.title}
                                    className="size-full object-cover transition-transform group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex size-full items-center justify-center bg-muted">
                                    <Calendar className="size-12 text-muted-foreground/30" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3">
                                <h3 className="font-display text-lg font-black leading-tight tracking-tight text-white">
                                    {featuredEvent.title}
                                </h3>
                                <div className="mt-1 flex items-center text-xs text-white/90">
                                    <Calendar className="mr-1 size-3" />
                                    <span>{new Date(featuredEvent.event_date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                            <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="size-3.5 text-primary" />
                                <span>{featuredEvent.time}</span>
                            </div>
                            <div className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="size-3.5 text-primary" />
                                <span>{featuredEvent.venue?.name || "TBD"}</span>
                            </div>
                            <p className="mb-4 flex-1 line-clamp-3 text-sm text-muted-foreground">
                                {featuredEvent.description}
                            </p>
                            <Link
                                href={`/events/${featuredEvent.id}`}
                                className="w-full rounded-md bg-primary py-2 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                View Details & Tickets
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Upcoming Events - Takes up 2/3 of the width */}
            <div className="lg:col-span-2">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {upcomingEvents.map((event) => (
                        <div
                            key={event.id}
                            className="group flex h-[160px] overflow-hidden rounded-lg border-none bg-card shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="w-1/3 overflow-hidden">
                                {event.image ? (
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="size-full object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex size-full items-center justify-center bg-muted">
                                        <Calendar className="size-6 text-muted-foreground/30" />
                                    </div>
                                )}
                            </div>
                            <div className="flex w-2/3 flex-col overflow-hidden p-3">
                                <div className="mb-1">
                                    <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-primary">
                                        {event.category}
                                    </span>
                                </div>
                                <h3 className="mb-1 truncate text-xs font-bold text-foreground">{event.title}</h3>
                                <div className="mb-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <Calendar className="size-3 text-primary" />
                                    <span>{new Date(event.event_date).toLocaleDateString()}</span>
                                </div>
                                <div className="mb-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <Clock className="size-3 text-primary" />
                                    <span>{event.time}</span>
                                </div>
                                <div className="flex items-center gap-1 truncate text-[10px] text-muted-foreground">
                                    <MapPin className="size-3 text-primary" />
                                    <span>{event.venue?.name || "TBD"}</span>
                                </div>
                                <div className="mt-auto flex items-center justify-between pt-2">
                                    <Link
                                        href={`/events/${event.id}`}
                                        className="flex items-center text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                                    >
                                        Details
                                        <ExternalLink className="ml-1 size-2.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}

                    {upcomingEvents.length === 0 && (
                        <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed p-8 text-muted-foreground sm:col-span-2">
                            No more upcoming events scheduled.
                        </div>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <Link
                        href="/events"
                        className="inline-flex items-center rounded-md border-2 border-primary px-6 py-2 text-sm font-black tracking-tight text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                    >
                        View All Upcoming Events
                        <ChevronRight className="ml-1 size-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default EventsPreview;
