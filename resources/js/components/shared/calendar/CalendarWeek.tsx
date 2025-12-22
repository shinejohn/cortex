import { EventList } from "../events/EventList";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

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

export function CalendarWeek({
    events,
    theme = "eventcity",
    className,
    onDateSelect,
}: CalendarWeekProps) {
    const [currentWeek, setCurrentWeek] = useState(new Date());

    const themeColors = {
        daynews: {
            today: "bg-blue-600 text-white",
            selected: "bg-blue-100",
        },
        downtownsguide: {
            today: "bg-purple-600 text-white",
            selected: "bg-purple-100",
        },
        eventcity: {
            today: "bg-indigo-600 text-white",
            selected: "bg-indigo-100",
        },
    };

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
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
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
        <div className={cn("space-y-4", className)}>
            {/* Week Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigateWeek("prev")}
                    className="rounded-md p-2 hover:bg-muted"
                    aria-label="Previous week"
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>

                <h2 className="text-xl font-semibold text-foreground">
                    {weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
                    {weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </h2>

                <button
                    onClick={() => navigateWeek("next")}
                    className="rounded-md p-2 hover:bg-muted"
                    aria-label="Next week"
                >
                    <ChevronRightIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Week Grid */}
            <div className="grid grid-cols-7 gap-2">
                {weekDays.map((date) => {
                    const dayEvents = getEventsForDate(date);
                    const today = isToday(date);

                    return (
                        <div
                            key={date.toISOString()}
                            className={cn(
                                "rounded-lg border bg-card p-2",
                                today && themeColors[theme].today
                            )}
                        >
                            <div className={cn("mb-2 text-center", today ? "text-white" : "text-foreground")}>
                                <div className="text-xs font-medium">
                                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                                </div>
                                <div className="text-lg font-semibold">{date.getDate()}</div>
                            </div>

                            <div className="space-y-1">
                                {dayEvents.slice(0, 3).map((event) => (
                                    <div
                                        key={event.id}
                                        className={cn(
                                            "rounded px-2 py-1 text-xs",
                                            today ? "bg-white/20 text-white" : "bg-muted text-foreground"
                                        )}
                                        title={event.title}
                                    >
                                        <div className="truncate">{event.title}</div>
                                        {event.time && (
                                            <div className="text-xs opacity-75">{event.time}</div>
                                        )}
                                    </div>
                                ))}
                                {dayEvents.length > 3 && (
                                    <div className={cn("text-xs", today ? "text-white/80" : "text-muted-foreground")}>
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

