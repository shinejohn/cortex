import type { SharedData } from "./index";
import type { Performer } from "./performers";
import type { Venue } from "./venues";

/** Core location information */
export interface Location {
    readonly lat: number;
    readonly lng: number;
}

/** Event venue information */
export interface EventVenue {
    readonly name: string;
    readonly city: string;
}

/** Event pricing structure */
export interface EventPrice {
    readonly isFree: boolean;
    readonly min: number;
    readonly max: number;
}

/** Badge types for events */
export const EVENT_BADGE_TYPES = {
    FEATURED: "Featured",
    COMMUNITY_PICK: "Community Pick",
    EDUCATIONAL: "Educational",
    WORKSHOP: "Workshop",
    JAM_SESSION: "Jam Session",
    JAZZ_LEGEND: "Jazz Legend",
    RISING_STAR: "Rising Star",
    EXPERT_PICK: "Expert Pick",
    BEGINNER_FRIENDLY: "Beginner Friendly",
    JAZZ_HISTORY: "Jazz History",
    COMMUNITY_EVENT: "Community Event",
} as const;

export type EventBadge = (typeof EVENT_BADGE_TYPES)[keyof typeof EVENT_BADGE_TYPES];

/** Enhanced Event interface matching mock data structure */
export interface Event {
    readonly id: string;
    readonly title: string;
    readonly image: string;
    readonly date: Date | string;
    readonly time: string;
    readonly venue: EventVenue;
    readonly description: string;
    readonly badges: readonly EventBadge[];
    readonly subcategories: readonly string[];
    readonly price: EventPrice;
    readonly communityRating: string;
    readonly memberAttendance: number;
    readonly memberRecommendations: number;
    readonly discussionThreadId: string;
    readonly curatorNotes: string | null;
    readonly location: Location;
    // Laravel model fields
    readonly venueId?: string;
    readonly performerId?: string;
    readonly category?: string;
    readonly status?: "draft" | "published" | "cancelled" | "completed";
    readonly createdAt?: string;
    readonly updatedAt?: string;
    // Relations
    readonly venueModel?: Venue;
    readonly performer?: Performer;
}

/** Day-grouped events */
export interface DayEvents {
    readonly date: string;
    readonly dayName: string;
    readonly displayName: string;
    readonly events: readonly Event[];
}

/** Event category for filtering and organization */
export interface EventCategory {
    readonly id: string;
    readonly name: string;
    readonly icon: string;
    readonly count: number;
    readonly color: string;
}

/** Enhanced event filters */
export interface EventFilters {
    readonly category: string;
    readonly date?: string;
    readonly venue?: string;
    readonly priceRange?: {
        readonly min: number;
        readonly max: number;
    };
    readonly badges?: readonly EventBadge[];
    readonly location?: {
        readonly lat: number;
        readonly lng: number;
        readonly radius: number; // in miles
    };
    readonly rating?: number;
}

/** Page Props */
export interface EventsPageProps extends SharedData {
    readonly featuredEvents?: readonly Event[];
    readonly upcomingEvents?: readonly Event[];
    readonly eventCategories?: readonly EventCategory[];
    readonly filters?: EventFilters;
}

export interface EventsGridProps extends SharedData {
    readonly featuredEvents?: readonly Event[];
}

export interface UpcomingEventsProps extends SharedData {
    readonly upcomingEvents?: readonly Event[];
}

/** Event actions */
export interface EventCardActions {
    readonly onShare: (event: Event) => void;
    readonly onAddToCalendar: (event: Event) => void;
    readonly onBookmark?: (event: Event) => void;
    readonly onJoinDiscussion?: (event: Event) => void;
}

/** Event creation/editing */
export interface CreateEventData {
    readonly title: string;
    readonly description: string;
    readonly venueId: string;
    readonly performerId?: string;
    readonly date: string;
    readonly time: string;
    readonly price: EventPrice;
    readonly category: string;
    readonly subcategories: readonly string[];
    readonly badges?: readonly EventBadge[];
    readonly curatorNotes?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {
    readonly id: string;
    readonly status?: Event["status"];
}
