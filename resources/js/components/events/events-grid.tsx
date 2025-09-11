import { Button } from "@/components/ui/button";
import { GridCard } from "@/components/common/grid-card";
import { GridSection } from "@/components/common/grid-section";
import type { Event, EventsGridProps } from "@/types/events";
import { usePage } from "@inertiajs/react";
import { CalendarIcon, CheckIcon, MapPinIcon, ShareIcon } from "lucide-react";
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

    const renderEventContent = (event: Event) => (
        <>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {event.date}
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
                {shareSuccess === event.id ? (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                ) : (
                    <ShareIcon className="h-4 w-4" />
                )}
            </Button>

            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleAddToCalendar(e, event, event.id)}
                className="text-muted-foreground hover:text-primary p-1 h-8 w-8"
                title="Add to Calendar"
            >
                {calendarSuccess === event.id ? (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                ) : (
                    <CalendarIcon className="h-4 w-4" />
                )}
            </Button>
        </>
    );

    return (
        <GridSection
            title="Featured Events"
            viewAllHref="/events"
            viewAllText="View all events"
            promoteHref="/advertise/event-promotion"
            promoteText="Promote your event here"
            className="bg-muted/50"
        >
            {featuredEvents?.map((event) => (
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
            ))}
        </GridSection>
    );
};

export default EventsGrid;
