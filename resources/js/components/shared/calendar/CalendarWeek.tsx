import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EventList } from "../events/EventList";

interface CalendarWeekProps {
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
    onDateSelect?: (date: Date) => void;
}

export function CalendarWeek({ events, theme = "eventcity", className, onDateSelect }: CalendarWeekProps) {
    const [currentWeek, setCurrentWeek] = useState(new Date());

    const getWeekDays = () => {
        const startOfWeek = new Date(currentWeek);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day;
        startOfWeek.setDate(diff);

        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const getEventsForDate = (date: Date) => {
        const dateStr = date.toISOString().split("T")[0];
        return events.filter((event) => {
            if (!event.event_date) return false;
            const eventDate = new Date(event.event_date).toISOString().split("T")[0];
            return eventDate === dateStr;
        });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    };

    const navigateWeek = (direction: "prev" | "next") => {
        const newDate = new Date(currentWeek);
        if (direction === "prev") {
            newDate.setDate(newDate.getDate() - 7);
        } else {
            newDate.setDate(newDate.getDate() + 7);
        }
        setCurrentWeek(newDate);
    };

    const weekDays = getWeekDays();
    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];

    return (
        <div className={cn("space-y-6", className)}>
            {/* Week Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => navigateWeek("prev")} aria-label="Previous week" className="rounded-lg">
                    <ChevronLeftIcon className="size-5" />
                </Button>

                <h2 className="font-display text-xl font-black tracking-tight text-foreground">
                    {weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
                    {weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </h2>

                <Button variant="ghost" size="icon" onClick={() => navigateWeek("next")} aria-label="Next week" className="rounded-lg">
                    <ChevronRightIcon className="size-5" />
                </Button>
            </div>

            {/* Week Grid */}
            <div className="grid grid-cols-7 gap-3">
                {weekDays.map((date) => {
                    const dayEvents = getEventsForDate(date);
                    const today = isToday(date);

                    return (
                        <div
                            key={date.toISOString()}
                            className={cn(
                                "overflow-hidden rounded-xl border-none p-3 shadow-sm transition-all",
                                today ? "bg-primary text-primary-foreground" : "bg-card",
                            )}
                        >
                            <div className={cn("mb-2 text-center", today ? "text-white" : "text-foreground")}>
                                <div className="text-[10px] uppercase tracking-widest font-black">
                                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                                </div>
                                <div className="font-display text-lg font-black">{date.getDate()}</div>
                            </div>

                            <div className="space-y-1.5">
                                {dayEvents.slice(0, 3).map((event) => (
                                    <div
                                        key={event.id}
                                        className={cn(
                                            "rounded-lg px-2 py-1.5 text-xs",
                                            today ? "bg-white/20 text-white" : "bg-muted text-foreground",
                                        )}
                                        title={event.title}
                                    >
                                        <div className="truncate font-medium">{event.title}</div>
                                        {event.time && <div className="text-[10px] opacity-75">{event.time}</div>}
                                    </div>
                                ))}
                                {dayEvents.length > 3 && (
                                    <div className={cn("text-center text-xs font-medium", today ? "text-white/80" : "text-muted-foreground")}>
                                        +{dayEvents.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
