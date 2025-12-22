import { CalendarView } from "./CalendarView";

interface CalendarMonthProps {
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

export function CalendarMonth({
    events,
    theme = "eventcity",
    className,
    onDateSelect,
}: CalendarMonthProps) {
    return (
        <CalendarView
            events={events}
            theme={theme}
            view="month"
            className={className}
            onDateSelect={onDateSelect}
        />
    );
}

