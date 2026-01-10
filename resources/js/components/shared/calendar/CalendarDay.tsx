import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EventList } from "../events/EventList";

interface CalendarDayProps {
    events: Array<{
        id: string;
        title: string;
        event_date?: string;
        time?: string;
        venue?: {
            id: string;
            name: string;
            city?: string;
        };
        category?: string;
        slug?: string;
    }>;
    theme?: "daynews" | "downtownsguide" | "eventcity";
    className?: string;
    initialDate?: Date;
    onDateChange?: (date: Date) => void;
}

export function CalendarDay({ events, theme = "eventcity", className, initialDate, onDateChange }: CalendarDayProps) {
    const [currentDate, setCurrentDate] = useState(initialDate || new Date());

    const _themeColors = {
        daynews: {
            header: "bg-muted",
            today: "bg-primary text-primary-foreground",
        },
        downtownsguide: {
            header: "bg-muted",
            today: "bg-primary text-primary-foreground",
        },
        eventcity: {
            header: "bg-muted",
            today: "bg-primary text-primary-foreground",
        },
    };

    const getEventsForDate = (date: Date) => {
        const dateStr = date.toISOString().split("T")[0];
        return events
            .filter((event) => {
                if (!event.event_date) return false;
                const eventDate = new Date(event.event_date).toISOString().split("T")[0];
                return eventDate === dateStr;
            })
            .sort((a, b) => {
                const timeA = a.time || "00:00";
                const timeB = b.time || "00:00";
                return timeA.localeCompare(timeB);
            });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    };

    const navigateDay = (direction: "prev" | "next") => {
        const newDate = new Date(currentDate);
        if (direction === "prev") {
            newDate.setDate(newDate.getDate() - 1);
        } else {
            newDate.setDate(newDate.getDate() + 1);
        }
        setCurrentDate(newDate);
        onDateChange?.(newDate);
    };

    const dayEvents = getEventsForDate(currentDate);
    const today = isToday(currentDate);

    return (
        <div className={cn("space-y-4", className)}>
            {/* Day Header */}
            <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                <Button variant="ghost" size="icon" onClick={() => navigateDay("prev")} aria-label="Previous day">
                    <ChevronLeftIcon className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-foreground">
                            {currentDate.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </h2>
                        {today && <span className="text-sm text-muted-foreground">Today</span>}
                    </div>
                </div>

                <Button variant="ghost" size="icon" onClick={() => navigateDay("next")} aria-label="Next day">
                    <ChevronRightIcon className="h-5 w-5" />
                </Button>
            </div>

            {/* Events List */}
            {dayEvents.length > 0 ? (
                <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">
                        {dayEvents.length} {dayEvents.length === 1 ? "Event" : "Events"}
                    </h3>
                    <EventList events={dayEvents} theme={theme} gridCols={1} />
                </div>
            ) : (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-muted-foreground">No events scheduled for this day</p>
                </div>
            )}
        </div>
    );
}
