import { router, useForm, usePage } from "@inertiajs/react";
import { Calendar, MapPin, Search } from "lucide-react";
import { useState } from "react";
import DayNewsLayout from "@/layouts/day-news-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AnnouncementSidebar } from "@/components/day-news/announcement-sidebar";
import { cn } from "@/lib/utils";
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

interface EventsPageProps {
    [key: string]: any;
    auth?: Auth;
    events: {
        data: Event[];
        links: any[];
        meta: any;
    };
    filters: {
        category: string;
        date: string;
        search: string;
    };
    sort: {
        sort: string;
        direction: string;
    };
    currentRegion?: {
        id: string;
        name: string;
    };
}

export default function EventsIndex() {
    const {
        auth,
        events,
        filters,
        currentRegion
    } = usePage<EventsPageProps>().props;

    const searchForm = useForm({
        search: filters.search || "",
        category: filters.category || "",
        date: filters.date || "",
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchForm.get(route("daynews.events.index") as any, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <DayNewsLayout
            auth={auth}
            containerClassName="container mx-auto px-4 py-12 lg:px-8 bg-[#F8F9FB]"
            seo={{
                title: "Local Events - Day News",
                description: "Discover upcoming events, meetings, and gatherings in your community.",
                url: route("daynews.events.index"),
            }}
        >
            <div className="mb-12 text-center">
                <div className="mb-2 flex items-center justify-center gap-2 text-primary">
                    <Calendar className="size-4 fill-current" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Community Calendar</span>
                </div>
                <h1 className="font-display text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
                    Upcoming <span className="text-primary italic">Events</span>
                </h1>
                <p className="mt-4 mx-auto max-w-xl text-lg text-muted-foreground leading-relaxed">
                    Don't miss out on what's happening in {currentRegion?.name || "your area"}.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                {/* Main Feed */}
                <div className="lg:col-span-8">
                    {/* Search and Filters Bar */}
                    <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 max-w-md">
                            <form onSubmit={handleSearch} className="group relative">
                                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    type="text"
                                    value={searchForm.data.search}
                                    onChange={(e) => searchForm.setData("search", e.target.value)}
                                    placeholder="Search events..."
                                    className="h-12 pl-12 pr-4 shadow-sm border-none bg-white ring-1 ring-muted focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </form>
                        </div>
                    </div>

                    {/* Events List */}
                    <div className="space-y-8">
                        {events.data.length === 0 ? (
                            <div className="rounded-3xl border-2 border-dashed p-20 text-center">
                                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
                                    <Calendar className="size-10 text-muted-foreground" />
                                </div>
                                <h3 className="mt-6 font-display text-xl font-bold">No events found</h3>
                                <p className="mt-2 text-muted-foreground">Try adjusting your filters or search query.</p>
                                <Button
                                    variant="outline"
                                    className="mt-8 rounded-xl font-bold"
                                    onClick={() => {
                                        searchForm.setData({ search: "", category: "", date: "" });
                                        router.get(route("daynews.events.index") as any);
                                    }}
                                >
                                    Clear All Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2">
                                {events.data.map((event) => (
                                    <Card
                                        key={event.id}
                                        className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white cursor-pointer"
                                        onClick={() => router.visit(route("daynews.events.show", event.id) as any)}
                                    >
                                        <div className="aspect-[16/10] overflow-hidden bg-muted relative">
                                            {event.image ? (
                                                <img
                                                    src={event.image}
                                                    alt={event.title}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                                    <Calendar className="size-12 opacity-20" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4">
                                                <div className="flex flex-col items-center justify-center rounded-xl bg-white shadow-lg p-2 min-w-[60px]">
                                                    <span className="text-xs font-bold text-red-500 uppercase">
                                                        {new Date(event.event_date).toLocaleString('default', { month: 'short' })}
                                                    </span>
                                                    <span className="text-xl font-black text-zinc-900 leading-none">
                                                        {new Date(event.event_date).getDate()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <CardContent className="p-5">
                                            <h3 className="mb-2 line-clamp-2 font-display text-xl font-black leading-tight group-hover:text-primary transition-colors">
                                                {event.title}
                                            </h3>
                                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="size-4 text-primary" />
                                                    <span>{event.venue?.name || event.location || "Location TBD"}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {events.meta?.last_page > 1 && (
                            <div className="mt-16 flex justify-center gap-3">
                                {events.meta.links.map((link: any, i: number) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? "default" : "outline"}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url)}
                                        className={cn(
                                            "h-10 min-w-[40px] px-4 font-bold transition-all",
                                            link.active && "shadow-lg shadow-primary/20 scale-110"
                                        )}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4">
                    <AnnouncementSidebar
                        location={currentRegion?.name}
                    />
                </div>
            </div>
        </DayNewsLayout>
    );
}
