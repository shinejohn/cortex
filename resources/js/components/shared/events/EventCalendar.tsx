import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { EventCard } from "./EventCard";

interface EventCalendarProps {
    events: Array<{
        id: string;
        title: string;
        description?: string;
        image?: string;
        event_date?: string;
        time?: string;
        venue?: {
            id: string;
            name: string;
            city?: string;
        };
        category?: string;
        is_free?: boolean;
        price_min?: number;
        price_max?: number;
        slug?: string;
    }>;
    theme?: "daynews" | "downtownsguide" | "eventcity";
    className?: string;
    view?: "month" | "week" | "day";
}

export function EventCalendar({ events, theme = "eventcity", className, view = "month" }: EventCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

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

    const navigateMonth = (direction: "prev" | "next") => {
        const newDate = new Date(currentDate);
        if (direction === "prev") {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
    };

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const days = getDaysInMonth();
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className={cn("space-y-6", className)}>
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
                <button onClick={() => navigateMonth("prev")} className="rounded-lg p-2 transition-colors hover:bg-muted">
                    <ChevronLeftIcon className="size-5" />
                </button>

                <div className="flex items-center gap-3">
                    <CalendarIcon className="size-5 text-primary" />
                    <h2 className="font-display text-xl font-black tracking-tight text-foreground">{monthName}</h2>
                </div>

                <button onClick={() => navigateMonth("next")} className="rounded-lg p-2 transition-colors hover:bg-muted">
                    <ChevronRightIcon className="size-5" />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                {/* Week Day Headers */}
                <div className="grid grid-cols-7 bg-muted/50">
                    {weekDays.map((day) => (
                        <div key={day} className="p-3 text-center text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-px bg-border/50">
                    {days.map((date, index) => {
                        if (!date) {
                            return <div key={`empty-${index}`} className="aspect-square bg-background" />;
                        }

                        const dayEvents = getEventsForDate(date);
                        const today = isToday(date);

                        return (
                            <div
                                key={date.toISOString()}
                                className={cn(
                                    "aspect-square bg-background p-1 transition-colors",
                                    today && "bg-primary text-primary-foreground",
                                    !today && "hover:bg-muted/50",
                                )}
                            >
                                <div className={cn("flex h-full flex-col", today ? "text-white" : "text-foreground")}>
                                    <span className="text-xs font-medium">{date.getDate()}</span>
                                    {dayEvents.length > 0 && (
                                        <div className="mt-1 flex flex-wrap gap-0.5">
                                            {dayEvents.slice(0, 3).map((event) => (
                                                <div
                                                    key={event.id}
                                                    className={cn("h-1 w-full rounded-full", today ? "bg-white/50" : "bg-primary/40")}
                                                    title={event.title}
                                                />
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <span className={cn("text-[10px]", today ? "text-white/80" : "text-muted-foreground")}>
                                                    +{dayEvents.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Events List for Selected Date */}
            {view === "month" && (
                <div className="space-y-3">
                    <h3 className="font-display font-black tracking-tight text-foreground">Upcoming Events</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {events.slice(0, 6).map((event) => (
                            <EventCard key={event.id} event={event} theme={theme} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
