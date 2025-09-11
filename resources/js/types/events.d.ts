import type { SharedData } from "./index";

export interface Event {
    readonly id: string;
    readonly title: string;
    readonly date: string;
    readonly venue: string;
    readonly price: string;
    readonly category: string;
    readonly image: string;
}

export interface DayEvents {
    readonly date: string;
    readonly dayName: string;
    readonly displayName: string;
    readonly events: Event[];
}

export interface EventsPageProps extends SharedData {
    readonly featuredEvents?: Event[];
    readonly upcomingEvents?: Event[];
}

export interface EventsGridProps extends SharedData {
    readonly featuredEvents?: Event[];
}

export interface UpcomingEventsProps extends SharedData {
    readonly upcomingEvents?: Event[];
}

export interface EventCardActions {
    readonly onShare: (event: Event) => void;
    readonly onAddToCalendar: (event: Event) => void;
}

export interface EventFilters {
    readonly category: string;
    readonly date?: string;
    readonly venue?: string;
    readonly priceRange?: {
        readonly min: number;
        readonly max: number;
    };
}
