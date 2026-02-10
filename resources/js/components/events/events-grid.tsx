import { usePage } from "@inertiajs/react";
import { CalendarIcon, CheckIcon, MapPinIcon, ShareIcon } from "lucide-react";
import { useState } from "react";
import { GridCard } from "@/components/common/grid-card";
import { GridSection } from "@/components/common/grid-section";
import { Button } from "@/components/ui/button";
import type { Event, EventsGridProps } from "@/types/events";

const EventsGrid = ({ events: propEvents, title }: { events?: any[], title?: string }) => {
    const { featuredEvents: contextEvents } = usePage<EventsGridProps>().props;
    const events = propEvents || contextEvents;
    const sectionTitle = title || "Featured Events";

    const [shareSuccess, setShareSuccess] = useState<string | null>(null);
    const [calendarSuccess, setCalendarSuccess] = useState<string | null>(null);

    const handleShareEvent = (e: React.MouseEvent, event: Event): void => {
        e.preventDefault();
        e.stopPropagation();

        if (navigator.share) {
            navigator.share({
                title: event.title,
                text: `Check out this event: ${event.title}`,
                url: window.location.origin + `/events/${event.id}`,
            }).catch(console.error);
            setShareSuccess(event.id);
            setTimeout(() => setShareSuccess(null), 2000);
        } else {
            navigator.clipboard.writeText(window.location.origin + `/events/${event.id}`)
                .then(() => {
                    setShareSuccess(event.id);
                    setTimeout(() => setShareSuccess(null), 2000);
                });
        }
    };

    const handleAddToCalendar = (e: React.MouseEvent, event: any): void => {
        e.preventDefault();
        e.stopPropagation();
        // Simplified calendar logic
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${new Date(event.date).toISOString().replace(/-|:|\.\d\d\d/g, "")}/${new Date(new Date(event.date).getTime() + 3600000).toISOString().replace(/-|:|\.\d\d\d/g, "")}&details=Event&location=${encodeURIComponent(event.venue)}`;
        window.open(googleCalendarUrl, '_blank');
        setCalendarSuccess(event.id);
        setTimeout(() => setCalendarSuccess(null), 2000);
    };

    const renderEventContent = (event: any) => (
        <>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {new Date(event.date).toLocaleDateString()}
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {event.venue || 'TBA'}
                </div>
                <span className="text-sm font-medium">{event.price}</span>
            </div>
        </>
    );

    const renderEventActions = (event: any) => (
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

    if (!events || events.length === 0) return null;

    return (
        <GridSection
            title={sectionTitle}
            viewAllHref="/events"
            viewAllText="View all events"
            promoteHref="/advertise/event-promotion"
            promoteText="Promote your event here"
            className="bg-muted/50"
        >
            {events.map((event) => (
                <GridCard
                    key={event.id}
                    id={event.id}
                    href={`/events/${event.id}`}
                    image={event.image || '/images/event-placeholder.jpg'}
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
