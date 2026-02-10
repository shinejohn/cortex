import { Link, usePage } from "@inertiajs/react";
import { ArrowRightIcon, CalendarIcon, CheckIcon, MapPinIcon, ShareIcon } from "lucide-react";
import { useState } from "react";
import { GridCard } from "@/components/common/grid-card";
import { GridSection } from "@/components/common/grid-section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DayEvents, Event, UpcomingEventsProps } from "@/types/events";

const UpcomingEvents = ({ events: propEvents }: { events?: any[] }) => {
    const { upcomingEvents: contextEvents } = usePage<UpcomingEventsProps>().props;
    const upcomingEvents = propEvents || contextEvents || [];
    const [shareSuccess, setShareSuccess] = useState<string | null>(null);
    const [calendarSuccess, setCalendarSuccess] = useState<string | null>(null);

    const handleShareEvent = (e: React.MouseEvent, event: Event): void => {
        e.stopPropagation();
        e.preventDefault();

        if (navigator.share) {
            navigator.share({
                title: event.title,
                text: `Check out this event: ${event.title}`,
                url: window.location.origin + `/events/${event.id}`,
            }).catch(console.error);
            setShareSuccess(event.id);
            setTimeout(() => setShareSuccess(null), 2000);
        } else {
            navigator.clipboard.writeText(`${window.location.origin}/events/${event.id}`)
                .then(() => {
                    setShareSuccess(event.id);
                    setTimeout(() => setShareSuccess(null), 2000);
                });
        }
    };

    const handleAddToCalendar = (e: React.MouseEvent, event: any): void => {
        e.stopPropagation();
        e.preventDefault();

        // Simplified calendar link
        const startDate = new Date(event.date).toISOString().replace(/-|:|\.\d\d\d/g, "");
        // Add 2 hours
        const endDate = new Date(new Date(event.date).getTime() + 7200000).toISOString().replace(/-|:|\.\d\d\d/g, "");
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=Event&location=${encodeURIComponent(event.venue || '')}`;

        window.open(googleCalendarUrl, "_blank");
        setCalendarSuccess(event.id);
        setTimeout(() => setCalendarSuccess(null), 2000);
    };

    const getNext7Days = (): any[] => {
        const days = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateString = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

            let displayName = dayName;
            if (i === 0) displayName = "Today";
            if (i === 1) displayName = "Tomorrow";

            const dayEvents = upcomingEvents.filter(e => {
                const ed = new Date(e.date);
                return ed.getDate() === date.getDate() && ed.getMonth() === date.getMonth() && ed.getFullYear() === date.getFullYear();
            });

            days.push({ date: dateString, dayName, displayName, events: dayEvents });
        }
        return days;
    };

    const next7Days = getNext7Days();

    const renderEventContent = (event: any) => (
        <>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {new Date(event.date).toLocaleDateString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
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
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleShareEvent(e, event)}>
                {shareSuccess === event.id ? <CheckIcon className="h-4 w-4 text-green-500" /> : <ShareIcon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleAddToCalendar(e, event)}>
                {calendarSuccess === event.id ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CalendarIcon className="h-4 w-4" />}
            </Button>
        </div>
    );

    if (upcomingEvents.length === 0) return null;

    return (
        <div className="py-4">
            <div className="mx-auto px-3 sm:px-4">
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

                <div className="space-y-4">
                    {next7Days.filter(d => d.events.length > 0).map((day, index) => (
                        <div key={index} className={`py-4 ${index % 2 === 1 ? "bg-muted/30" : ""}`}>
                            <div className="max-w-7xl px-3 sm:px-4 mx-auto">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-5 w-5 text-primary" />
                                        <h3 className="text-lg font-bold text-foreground">{day.displayName} - {day.date}</h3>
                                        <Badge variant="outline" className="ml-2">{day.events.length} events</Badge>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {day.events.map((event: any) => (
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
                                </div>
                            </div>
                        </div>
                    ))}
                    {next7Days.every(d => d.events.length === 0) && (
                        <div className="text-center py-12 bg-muted/30 rounded-lg">
                            <p className="text-muted-foreground">No upcoming events scheduled for the next 7 days.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpcomingEvents;
