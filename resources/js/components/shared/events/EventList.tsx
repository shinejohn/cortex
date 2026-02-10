import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventCard } from "./EventCard";

interface EventListProps {
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
    gridCols?: 1 | 2 | 3 | 4;
    showDescription?: boolean;
    showVenue?: boolean;
    showPrice?: boolean;
    showShare?: boolean;
}

export function EventList({
    events,
    theme = "eventcity",
    className,
    gridCols = 3,
    showDescription = true,
    showVenue = true,
    showPrice = true,
    showShare = false,
}: EventListProps) {
    const gridClasses = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    };

    if (events.length === 0) {
        return (
            <div className="rounded-xl border border-dashed p-12 text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                    <CalendarIcon className="size-6 text-muted-foreground" />
                </div>
                <p className="font-display font-black tracking-tight text-foreground">No events found</p>
                <p className="mt-1 text-sm text-muted-foreground">Check back later for upcoming events</p>
            </div>
        );
    }

    return (
        <div className={cn("grid gap-6", gridClasses[gridCols], className)}>
            {events.map((event) => (
                <EventCard
                    key={event.id}
                    event={event}
                    theme={theme}
                    showDescription={showDescription}
                    showVenue={showVenue}
                    showPrice={showPrice}
                    showShare={showShare}
                />
            ))}
        </div>
    );
}
