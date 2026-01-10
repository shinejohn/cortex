import { Link, usePage } from "@inertiajs/react";
import { ArrowRightIcon, CalendarIcon, CheckIcon, MapPinIcon, ShareIcon } from "lucide-react";
import { useState } from "react";
import { GridCard } from "@/components/common/grid-card";
import { GridSection } from "@/components/common/grid-section";
import { Button } from "@/components/ui/button";
import type { DayEvents, Event, UpcomingEventsProps } from "@/types/events";

const UpcomingEvents = () => {
    const { upcomingEvents = [] } = usePage<UpcomingEventsProps>().props;
    const [shareSuccess, setShareSuccess] = useState<string | null>(null);
    const [calendarSuccess, setCalendarSuccess] = useState<string | null>(null);

    const handleShareEvent = (e: React.MouseEvent, event: Event): void => {
        e.stopPropagation();
        e.preventDefault();

        setShareSuccess(event.id);
        setTimeout(() => setShareSuccess(null), 2000);

        if (navigator.share) {
            navigator.share({
                title: event.title,
                text: `Check out this event: ${event.title}`,
                url: window.location.origin + `/events/${event.id}`,
            });
        } else {
            navigator.clipboard.writeText(`${window.location.origin}/events/${event.id}`);
        }
    };

    const handleAddToCalendar = (e: React.MouseEvent, event: Event): void => {
        e.stopPropagation();
        e.preventDefault();

        setCalendarSuccess(event.id);
        setTimeout(() => setCalendarSuccess(null), 2000);

        const startDate = new Date(event.date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        const endDate = new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
            event.title,
        )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(`Event at ${event.venue}`)}&location=${encodeURIComponent(event.venue)}`;

        window.open(googleCalendarUrl, "_blank");
    };

    // Generate next 7 days
    const getNext7Days = (): DayEvents[] => {
        const days: DayEvents[] = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const dayName = date.toLocaleDateString("en-US", {
                weekday: "long",
            });
            const dateString = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });

            // Generate display name with Today/Tomorrow
            let displayName: string;
            if (i === 0) {
                displayName = `Today - ${dateString}`;
            } else if (i === 1) {
                displayName = `Tomorrow - ${dateString}`;
            } else {
                displayName = `${dayName} - ${dateString}`;
            }

            // Filter events for this day
            const dayEvents = upcomingEvents.filter((event) => {
                try {
                    const eventDate = new Date(event.date);
                    const currentDate = new Date(date);
                    return eventDate.toDateString() === currentDate.toDateString();
                } catch {
                    // Fallback: distribute events across the 7 days if date parsing fails
                    return parseInt(event.id) % 7 === i;
                }
            });

            days.push({
                date: dateString,
                dayName,
                displayName,
                events: dayEvents,
            });
        }

        return days;
    };

    const next7Days = getNext7Days();

    const renderEventContent = (event: Event) => (
        <>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {new Date(event.date).toLocaleDateString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                })}
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {event.venue}
                </div>
                <span className="text-sm font-medium">{event.price}</span>
            </div>
        </>
    );

    const renderEventActions = (event: Event) => (
        <>
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleShareEvent(e, event)}
                className="text-muted-foreground hover:text-primary p-1 h-8 w-8"
                title="Share Event"
            >
                {shareSuccess === event.id ? <CheckIcon className="h-4 w-4 text-green-500" /> : <ShareIcon className="h-4 w-4" />}
            </Button>

            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleAddToCalendar(e, event)}
                className="text-muted-foreground hover:text-primary p-1 h-8 w-8"
                title="Add to Calendar"
            >
                {calendarSuccess === event.id ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CalendarIcon className="h-4 w-4" />}
            </Button>
        </>
    );

    return (
        <div className="py-4">
            <div className="mx-auto px-3 sm:px-4">
                {/* Main Section Header */}
                <div className="max-w-7xl px-3 sm:px-4 mx-auto flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Upcoming Events</h2>
                    </div>
                    <Button variant="link" size="sm" asChild className="text-primary hover:text-primary/80 font-medium text-sm p-0">
                        <Link href="/events">
                            View all events
                            <ArrowRightIcon className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                {/* Day Grids */}
                <div className="space-y-4">
                    {next7Days.map((day, index) => (
                        <div key={index} className={`py-4 ${index % 2 === 1 ? "bg-muted/30" : ""}`}>
                            <div className="max-w-7xl px-3 sm:px-4 mx-auto">
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-5 w-5 text-primary" />
                                            <h3 className="text-lg font-bold text-foreground">{day.displayName}</h3>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center">
                                            {day.events.length === 0
                                                ? "No events scheduled"
                                                : `${day.events.length} event${day.events.length > 1 ? "s" : ""} scheduled`}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {day.events.length === 0 ? (
                                        <div className="col-span-full text-center py-8">
                                            <p className="text-muted-foreground">No events scheduled for this day</p>
                                        </div>
                                    ) : (
                                        day.events.map((event) => (
                                            <GridCard
                                                key={event.id}
                                                id={event.id}
                                                href={`/events/${event.id}`}
                                                image={event.image}
                                                imageAlt={event.title}
                                                badge={event.category}
                                                title={event.title}
                                                actions={renderEventActions(event)}
                                            >
                                                {renderEventContent(event)}
                                            </GridCard>
                                        ))
                                    )}
                                </div>

                                <div className="mt-4 text-center">
                                    <Button variant="link" size="sm" asChild className="text-primary hover:text-primary/80 text-sm font-medium p-0">
                                        <Link href="/advertise/event-promotion">Promote your event here</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UpcomingEvents;
