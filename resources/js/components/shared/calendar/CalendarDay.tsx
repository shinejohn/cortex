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
        <div className={cn("space-y-6", className)}>
            {/* Day Header */}
            <div className="flex items-center justify-between overflow-hidden rounded-xl border-none bg-card p-4 shadow-sm">
                <Button variant="ghost" size="icon" onClick={() => navigateDay("prev")} aria-label="Previous day" className="rounded-lg">
                    <ChevronLeftIcon className="size-5" />
                </Button>

                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50">
                        <CalendarIcon className="size-5 text-primary" />
                    </div>
                    <div className="text-center">
                        <h2 className="font-display text-xl font-black tracking-tight text-foreground">
                            {currentDate.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </h2>
                        {today && (
                            <span className="text-[10px] uppercase tracking-widest font-black text-primary">Today</span>
                        )}
                    </div>
                </div>

                <Button variant="ghost" size="icon" onClick={() => navigateDay("next")} aria-label="Next day" className="rounded-lg">
                    <ChevronRightIcon className="size-5" />
                </Button>
            </div>

            {/* Events List */}
            {dayEvents.length > 0 ? (
                <div className="space-y-3">
                    <h3 className="font-display font-black tracking-tight text-foreground">
                        {dayEvents.length} {dayEvents.length === 1 ? "Event" : "Events"}
                    </h3>
                    <EventList events={dayEvents} theme={theme} gridCols={1} />
                </div>
            ) : (
                <div className="rounded-xl border border-dashed p-12 text-center">
                    <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                        <CalendarIcon className="size-6 text-muted-foreground" />
                    </div>
                    <p className="font-display font-black tracking-tight text-foreground">No events scheduled</p>
                    <p className="mt-1 text-sm text-muted-foreground">No events scheduled for this day</p>
                </div>
            )}
        </div>
    );
}
