import { EventList } from "../events/EventList";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from "lucide-react";

interface CalendarViewProps {
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
    view?: "month" | "week" | "day";
    onDateSelect?: (date: Date) => void;
}

export function CalendarView({ events, theme = "eventcity", className, view = "month", onDateSelect }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const themeColors = {
        daynews: {
            header: "bg-blue-50",
            today: "bg-blue-600 text-white",
            selected: "bg-blue-100",
            hover: "hover:bg-blue-50",
        },
        downtownsguide: {
            header: "bg-purple-50",
            today: "bg-purple-600 text-white",
            selected: "bg-purple-100",
            hover: "hover:bg-purple-50",
        },
        eventcity: {
            header: "bg-indigo-50",
            today: "bg-indigo-600 text-white",
            selected: "bg-indigo-100",
            hover: "hover:bg-indigo-50",
        },
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

    const isSelected = (date: Date) => {
        if (!selectedDate) return false;
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        );
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        onDateSelect?.(date);
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

    const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

    return (
        <div className={cn("space-y-4", className)}>
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
                <button onClick={() => navigateMonth("prev")} className="rounded-md p-2 hover:bg-muted" aria-label="Previous month">
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold text-foreground">{monthName}</h2>
                </div>

                <button onClick={() => navigateMonth("next")} className="rounded-md p-2 hover:bg-muted" aria-label="Next month">
                    <ChevronRightIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="rounded-lg border bg-card">
                {/* Week Day Headers */}
                <div className={cn("grid grid-cols-7 rounded-t-lg", themeColors[theme].header)}>
                    {weekDays.map((day) => (
                        <div key={day} className="p-2 text-center text-sm font-medium">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-px bg-border">
                    {days.map((date, index) => {
                        if (!date) {
                            return <div key={`empty-${index}`} className="aspect-square bg-background" />;
                        }

                        const dayEvents = getEventsForDate(date);
                        const today = isToday(date);
                        const selected = isSelected(date);

                        return (
                            <button
                                key={date.toISOString()}
                                onClick={() => handleDateClick(date)}
                                className={cn(
                                    "aspect-square bg-background p-1 text-left transition-colors",
                                    today && themeColors[theme].today,
                                    selected && !today && themeColors[theme].selected,
                                    !today && !selected && themeColors[theme].hover,
                                )}
                            >
                                <div className={cn("flex h-full flex-col", today ? "text-white" : "text-foreground")}>
                                    <span className="text-xs font-medium">{date.getDate()}</span>
                                    {dayEvents.length > 0 && (
                                        <div className="mt-1 flex flex-wrap gap-0.5">
                                            {dayEvents.slice(0, 2).map((event) => (
                                                <div
                                                    key={event.id}
                                                    className={cn("h-1 w-full rounded", today ? "bg-white/50" : themeColors[theme].selected)}
                                                    title={event.title}
                                                />
                                            ))}
                                            {dayEvents.length > 2 && (
                                                <span className={cn("text-xs", today ? "text-white/80" : "text-muted-foreground")}>
                                                    +{dayEvents.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Date Events */}
            {selectedDate && selectedDateEvents.length > 0 && (
                <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">
                        Events on{" "}
                        {selectedDate.toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </h3>
                    <EventList events={selectedDateEvents} theme={theme} gridCols={2} />
                </div>
            )}
        </div>
    );
}
