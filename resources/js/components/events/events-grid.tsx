import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Event, EventsGridProps } from "@/types/home";
import { Link, usePage } from "@inertiajs/react";
import {
    ArrowRightIcon,
    CalendarIcon,
    CheckIcon,
    MapPinIcon,
    ShareIcon,
    TagIcon,
} from "lucide-react";
import { useState } from "react";

const EventsGrid = () => {
    const { featuredEvents } = usePage<EventsGridProps>().props;
    const [shareSuccess, setShareSuccess] = useState<string | null>(null);
    const [calendarSuccess, setCalendarSuccess] = useState<string | null>(null);

    const handleShareEvent = (e: React.MouseEvent, event: Event): void => {
        e.stopPropagation();
        e.preventDefault();

        setShareSuccess(event.id);
        setTimeout(() => setShareSuccess(null), 2000);

        // Share logic here
        if (navigator.share) {
            navigator.share({
                title: event.title,
                text: `Check out this event: ${event.title}`,
                url: window.location.origin + `/events/${event.id}`,
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(
                `${window.location.origin}/events/${event.id}`
            );
        }
    };

    const handleAddToCalendar = (
        e: React.MouseEvent,
        event: Event,
        eventId: string
    ): void => {
        e.stopPropagation();
        e.preventDefault();

        setCalendarSuccess(eventId);
        setTimeout(() => setCalendarSuccess(null), 2000);

        // Calendar logic here
        const startDate =
            new Date(event.date)
                .toISOString()
                .replace(/[-:]/g, "")
                .split(".")[0] + "Z";
        const endDate =
            new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000)
                .toISOString()
                .replace(/[-:]/g, "")
                .split(".")[0] + "Z";

        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
            event.title
        )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(
            `Event at ${event.venue}`
        )}&location=${encodeURIComponent(event.venue)}`;

        window.open(googleCalendarUrl, "_blank");
    };

    return (
        <div className="bg-gray-50 py-4">
            <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Featured Events
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center">
                            <TagIcon className="h-3 w-3 mr-1" />
                            Sponsored listings
                        </p>
                    </div>
                    <Button
                        variant="link"
                        size="sm"
                        asChild
                        className="text-primary hover:text-primary-800 font-medium text-sm p-0"
                    >
                        <Link href="/events">
                            View all events
                            <ArrowRightIcon className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {featuredEvents?.map((event) => (
                        <Card
                            key={event.id}
                            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer p-0 border-0"
                        >
                            <Link
                                href={`/events/${event.id}`}
                                className="block"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <Badge
                                            variant="secondary"
                                            className="px-2 py-1 bg-black/30 backdrop-blur-sm text-white text-xs rounded-full border-0"
                                        >
                                            {event.category}
                                        </Badge>
                                    </div>
                                </div>
                            </Link>

                            <CardContent className="p-4">
                                <Link
                                    href={`/events/${event.id}`}
                                    className="block"
                                >
                                    <h3 className="font-bold text-lg text-gray-900 mb-1 hover:text-primary-600 transition-colors">
                                        {event.title}
                                    </h3>
                                </Link>

                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                    <CalendarIcon className="h-4 w-4 mr-1" />
                                    {event.date}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <MapPinIcon className="h-4 w-4 mr-1" />
                                        {event.venue}
                                    </div>
                                    <span className="text-sm font-medium">
                                        {event.price}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) =>
                                            handleShareEvent(e, event)
                                        }
                                        className="text-gray-500 hover:text-primary-600 p-1 h-8 w-8"
                                        title="Share Event"
                                    >
                                        {shareSuccess === event.id ? (
                                            <CheckIcon className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <ShareIcon className="h-4 w-4" />
                                        )}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) =>
                                            handleAddToCalendar(
                                                e,
                                                event,
                                                event.id
                                            )
                                        }
                                        className="text-gray-500 hover:text-primary-600 p-1 h-8 w-8"
                                        title="Add to Calendar"
                                    >
                                        {calendarSuccess === event.id ? (
                                            <CheckIcon className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <CalendarIcon className="h-4 w-4" />
                                        )}
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        asChild
                                        className="text-xs bg-primary-100 text-primary-700 hover:bg-primary-200 border-0"
                                    >
                                        <Link href={`/events/${event.id}`}>
                                            Details
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-4 text-center">
                    <Button
                        variant="link"
                        size="sm"
                        asChild
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium p-0"
                    >
                        <Link href="/advertise/event-promotion">
                            Promote your event here
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EventsGrid;
