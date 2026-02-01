import { Link } from "@inertiajs/react";
import { Calendar, MapPin, Clock, ExternalLink } from "lucide-react";
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Featured Event - Takes up 1/3 of the width */}
            {featuredEvent && (
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-800 flex items-center text-sm">
                                <Calendar className="h-4 w-4 mr-2 text-news-primary" />
                                Featured Event
                            </h3>
                        </div>
                        <div className="relative h-48">
                            {featuredEvent.image ? (
                                <img
                                    src={featuredEvent.image}
                                    alt={featuredEvent.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <Calendar className="h-12 w-12 text-gray-300" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                            <div className="absolute bottom-3 left-3 right-3">
                                <h3 className="text-white font-bold text-lg leading-tight">
                                    {featuredEvent.title}
                                </h3>
                                <div className="flex items-center text-white/90 text-xs mt-1">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    <span>{new Date(featuredEvent.event_date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <div className="flex items-center text-gray-500 text-xs mb-2">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                <span>{featuredEvent.time}</span>
                            </div>
                            <div className="flex items-center text-gray-500 text-xs mb-3">
                                <MapPin className="h-3.5 w-3.5 mr-1" />
                                <span>{featuredEvent.venue?.name || "TBD"}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-3">
                                {featuredEvent.description}
                            </p>
                            <Link
                                href={`/events/${featuredEvent.id}`}
                                className="w-full bg-news-primary text-white py-2 rounded-md hover:bg-news-primary-dark transition-colors text-center text-sm font-medium"
                            >
                                View Details & Tickets
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Upcoming Events - Takes up 2/3 of the width */}
            <div className="lg:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {upcomingEvents.map((event) => (
                        <div
                            key={event.id}
                            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex hover:shadow-md transition-shadow h-[160px]"
                        >
                            <div className="w-1/3">
                                <div className="h-full">
                                    {event.image ? (
                                        <img
                                            src={event.image}
                                            alt={event.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                            <Calendar className="h-6 w-6 text-gray-200" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="w-2/3 p-3 flex flex-col overflow-hidden">
                                <div className="mb-1">
                                    <span className="inline-block text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-tight">
                                        {event.category}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-800 mb-1 text-xs truncate">
                                    {event.title}
                                </h3>
                                <div className="flex items-center text-gray-500 text-[10px] mb-1">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    <span>{new Date(event.event_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center text-gray-500 text-[10px] mb-1">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{event.time}</span>
                                </div>
                                <div className="flex items-center text-gray-500 text-[10px] truncate">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    <span>{event.venue?.name || "TBD"}</span>
                                </div>
                                <div className="mt-auto pt-2 flex justify-between items-center">
                                    <Link
                                        href={`/events/${event.id}`}
                                        className="text-[10px] text-news-primary font-bold uppercase tracking-tight flex items-center hover:underline"
                                    >
                                        Details
                                        <ExternalLink className="h-2.5 w-2.5 ml-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}

                    {upcomingEvents.length === 0 && (
                        <div className="sm:col-span-2 flex items-center justify-center h-full border-2 border-dashed border-gray-200 rounded-lg p-8 text-muted-foreground">
                            No more upcoming events scheduled.
                        </div>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <Link
                        href="/events"
                        className="inline-flex items-center px-6 py-2 border-2 border-news-primary text-news-primary rounded-md font-bold text-sm tracking-tight hover:bg-news-primary hover:text-white transition-all"
                    >
                        View All Upcoming Events
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

// ChevronRight was used but not imported
import { ChevronRight } from "lucide-react";

export default EventsPreview;
