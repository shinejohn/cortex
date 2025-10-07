import type { Event } from "./events";
import type { SharedData } from "./index";
import type { PaginationLink, PaginationMeta } from "./venues";

/** Calendar categories */
export const CALENDAR_CATEGORIES = {
    ALL: "all",
    JAZZ: "jazz",
    KIDS: "kids",
    FITNESS: "fitness",
    SENIORS: "seniors",
    SCHOOLS: "schools",
    SPORTS: "sports",
    ARTS: "arts",
    FOOD: "food",
    PROFESSIONAL: "professional",
} as const;

export type CalendarCategory = (typeof CALENDAR_CATEGORIES)[keyof typeof CALENDAR_CATEGORIES];

/** Update frequency options */
export const UPDATE_FREQUENCIES = {
    DAILY: "daily",
    WEEKLY: "weekly",
    BI_WEEKLY: "bi-weekly",
    MONTHLY: "monthly",
} as const;

export type UpdateFrequency = (typeof UPDATE_FREQUENCIES)[keyof typeof UPDATE_FREQUENCIES];

/** Calendar curator/creator */
export interface CalendarCreator {
    readonly id: number;
    readonly name: string;
    readonly verified: boolean;
}

/** Main calendar interface */
export interface Calendar {
    readonly id: number;
    readonly title: string;
    readonly description: string;
    readonly category: string;
    readonly image: string | null;
    readonly about: string | null;
    readonly location: string | null;
    readonly update_frequency: UpdateFrequency;
    readonly subscription_price: number;
    readonly is_private: boolean;
    readonly is_verified: boolean;
    readonly followers_count: number;
    readonly events_count: number;
    readonly user: CalendarCreator;
    readonly created_at: string;
    readonly updated_at: string;
    readonly events?: readonly Event[];
    readonly editors?: readonly CalendarEditor[];
}

/** Calendar editor/collaborator */
export interface CalendarEditor {
    readonly id: number;
    readonly calendar_id: number;
    readonly user_id: number;
    readonly role: "editor" | "admin";
    readonly user: CalendarCreator;
    readonly created_at: string;
}

/** Trending calendar for homepage */
export interface TrendingCalendar {
    readonly id: number;
    readonly title: string;
    readonly description: string;
    readonly category: string;
    readonly image: string | null;
    readonly user: CalendarCreator;
    readonly followers_count: number;
    readonly events_count: number;
    readonly is_verified: boolean;
}

/** New calendar for homepage */
export interface NewCalendar {
    readonly id: number;
    readonly title: string;
    readonly description: string;
    readonly category: string;
    readonly image: string | null;
    readonly user: CalendarCreator;
    readonly created_at: string;
}

/** Calendar filters */
export interface CalendarFilters {
    readonly category?: string;
    readonly search?: string;
    readonly price_type?: "all" | "free" | "paid";
    readonly min_followers?: number;
    readonly max_followers?: number;
    readonly update_frequency?: string;
}

/** Calendar statistics */
export interface CalendarStats {
    readonly total_calendars: number;
    readonly total_followers: number;
    readonly active_curators: number;
}

/** Paginated calendars response */
export interface PaginatedCalendars {
    readonly data: readonly Calendar[];
    readonly links: readonly PaginationLink[];
    readonly meta: PaginationMeta;
}

/** Calendars index page props */
export interface CalendarsPageProps extends SharedData {
    readonly calendars: PaginatedCalendars;
    readonly trendingCalendars: readonly TrendingCalendar[];
    readonly newCalendars: readonly NewCalendar[];
    readonly filters: CalendarFilters;
    readonly stats: CalendarStats;
    readonly sort: string;
}

/** Calendar show page props */
export interface CalendarShowPageProps extends SharedData {
    readonly calendar: Calendar;
    readonly isFollowing: boolean;
    readonly canEdit: boolean;
}

/** Calendar creation data */
export interface CreateCalendarData {
    readonly title: string;
    readonly description: string;
    readonly category: string;
    readonly image?: File;
    readonly about?: string;
    readonly location?: string;
    readonly update_frequency: UpdateFrequency;
    readonly subscription_price: number;
    readonly is_private: boolean;
}

/** Calendar update data */
export interface UpdateCalendarData extends Partial<CreateCalendarData> {
    readonly id: number;
}

/** Add event to calendar request */
export interface AddEventToCalendarRequest {
    readonly event_id: number;
}

/** Add editor to calendar request */
export interface AddEditorToCalendarRequest {
    readonly user_id: number;
    readonly role: "editor" | "admin";
}
