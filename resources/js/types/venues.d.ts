import type { Location } from "./events";
import type { SharedData } from "./index";

/** Address and location information for venues */
export interface VenueLocation {
    readonly address: string;
    readonly neighborhood: string;
    readonly coordinates: Location;
}

/** Venue pricing structure */
export interface VenuePricing {
    readonly pricePerHour: number;
    readonly pricePerEvent: number;
    readonly pricePerDay: number;
}

/** Venue amenities */
export const VENUE_AMENITIES = {
    PARKING: "Parking Available",
    WHEELCHAIR_ACCESSIBLE: "Wheelchair Accessible",
    KITCHEN_CATERING: "Kitchen/Catering",
    AV_EQUIPMENT: "A/V Equipment",
    WIFI: "WiFi",
    BAR_SERVICE: "Bar Service",
    STAGE_PERFORMANCE: "Stage/Performance Area",
    AIR_CONDITIONING: "Air Conditioning",
    OUTDOOR_SPACE: "Outdoor Space",
    SECURITY: "Security",
    SOUND_SYSTEM: "Sound System",
    LIGHTING: "Professional Lighting",
    DRESSING_ROOMS: "Dressing Rooms",
} as const;

export type VenueAmenity = (typeof VENUE_AMENITIES)[keyof typeof VENUE_AMENITIES];

/** Event types that venues support */
export const VENUE_EVENT_TYPES = {
    WEDDING: "Wedding",
    CORPORATE: "Corporate",
    GALA: "Gala",
    CONFERENCE: "Conference",
    CONCERT: "Concert",
    BIRTHDAY: "Birthday",
    GRADUATION: "Graduation",
    FUNDRAISER: "Fundraiser",
    WORKSHOP: "Workshop",
    EXHIBITION: "Exhibition",
} as const;

export type VenueEventType = (typeof VENUE_EVENT_TYPES)[keyof typeof VENUE_EVENT_TYPES];

/** Venue types/categories */
export const VENUE_TYPES = {
    EVENT_SPACES: "Event Spaces",
    RESTAURANTS: "Restaurants",
    HOTELS: "Hotels",
    OUTDOOR_VENUES: "Outdoor Venues",
    THEATERS: "Theaters",
    MUSEUMS: "Museums",
    CLUBS: "Clubs",
    COMMUNITY_CENTERS: "Community Centers",
    CHURCHES: "Churches",
    GALLERIES: "Galleries",
} as const;

export type VenueType = (typeof VENUE_TYPES)[keyof typeof VENUE_TYPES];

/** Enhanced Venue interface matching Laravel controller structure */
export interface Venue {
    readonly id: number;
    readonly name: string;
    readonly description: string;
    readonly images: readonly string[];
    readonly verified: boolean;
    readonly venueType: VenueType;
    readonly capacity: number;
    readonly pricing: VenuePricing;
    readonly rating: number;
    readonly reviewCount: number;
    readonly location: VenueLocation;
    readonly distance: number; // in miles
    readonly amenities: readonly VenueAmenity[];
    readonly eventTypes: readonly VenueEventType[];
    readonly availability: {
        readonly unavailableDates: readonly string[];
        readonly responseTimeHours: number;
    };
    readonly lastBookedDaysAgo: number;
    readonly listedDate: string;
    // Laravel model fields
    readonly status?: "active" | "inactive" | "pending" | "suspended";
    readonly ownerId?: string;
    readonly createdAt?: string;
    readonly updatedAt?: string;
}

/** Venue category for filtering and organization */
export interface VenueCategory {
    readonly id: string;
    readonly name: string;
    readonly icon: string;
    readonly count: number;
    readonly color: string;
}

/** Venue filters matching Laravel controller parameters */
export interface VenueFilters {
    readonly search?: string;
    readonly venue_types?: string[];
    readonly min_capacity?: number;
    readonly max_capacity?: number;
    readonly min_price?: number;
    readonly max_price?: number;
    readonly amenities?: string[];
    readonly verified?: boolean;
    readonly date?: string;
}

/** Legacy venue filters for compatibility */
export interface VenueFiltersLegacy {
    readonly venueType?: VenueType;
    readonly capacity?: {
        readonly min: number;
        readonly max: number;
    };
    readonly priceRange?: {
        readonly min: number;
        readonly max: number;
        readonly period: "hour" | "event" | "day";
    };
    readonly amenities?: readonly VenueAmenity[];
    readonly eventTypes?: readonly VenueEventType[];
    readonly location?: {
        readonly lat: number;
        readonly lng: number;
        readonly radius: number; // in miles
    };
    readonly rating?: number;
    readonly availableDate?: string;
    readonly verified?: boolean;
}

/** Trending venue for homepage */
export interface TrendingVenue {
    readonly id: number;
    readonly name: string;
    readonly venueType: string;
    readonly images: readonly string[];
    readonly location: {
        readonly neighborhood: string;
    };
    readonly rating: number;
    readonly reviewCount: number;
}

/** New venue for homepage */
export interface NewVenue {
    readonly id: number;
    readonly name: string;
    readonly venueType: string;
    readonly images: readonly string[];
    readonly location: {
        readonly neighborhood: string;
    };
    readonly listedDate: string;
}

/** Venue statistics */
export interface VenueStats {
    readonly totalVenues: number;
    readonly eventsThisWeek: number;
    readonly newVenuesThisWeek: number;
}

/** Pagination link */
export interface PaginationLink {
    readonly url: string | null;
    readonly label: string;
    readonly active: boolean;
}

/** Pagination meta information */
export interface PaginationMeta {
    readonly current_page: number;
    readonly last_page: number;
    readonly per_page: number;
    readonly total: number;
    readonly from: number;
    readonly to: number;
}

/** Paginated venues response */
export interface PaginatedVenues {
    readonly data: readonly Venue[];
    readonly links: readonly PaginationLink[];
    readonly meta: PaginationMeta;
}

/** Main venues page props matching Laravel controller */
export interface VenuesPageProps extends SharedData {
    readonly venues: PaginatedVenues;
    readonly trendingVenues: readonly TrendingVenue[];
    readonly newVenues: readonly NewVenue[];
    readonly upcomingEvents: readonly unknown[];
    readonly stats: VenueStats;
    readonly filters: VenueFilters;
    readonly sort: string;
}

/** Legacy page props for compatibility */
export interface VenuesPagePropsLegacy extends SharedData {
    readonly featuredVenues?: readonly Venue[];
    readonly allVenues?: readonly Venue[];
    readonly venueCategories?: readonly VenueCategory[];
    readonly filters?: VenueFiltersLegacy;
}

export interface VenuesGridProps extends SharedData {
    readonly featuredVenues?: readonly Venue[];
}

/** Venue actions */
export interface VenueCardActions {
    readonly onShare: (venue: Venue) => void;
    readonly onBookmark: (venue: Venue) => void;
    readonly onContact: (venue: Venue) => void;
    readonly onViewDetails: (venue: Venue) => void;
}

/** Venue creation/editing */
export interface CreateVenueData {
    readonly name: string;
    readonly description: string;
    readonly venueType: VenueType;
    readonly capacity: number;
    readonly pricing: VenuePricing;
    readonly location: Omit<VenueLocation, "coordinates"> & {
        readonly coordinates?: Location;
    };
    readonly amenities: readonly VenueAmenity[];
    readonly eventTypes: readonly VenueEventType[];
    readonly images?: readonly string[];
}

export interface UpdateVenueData extends Partial<CreateVenueData> {
    readonly id: string;
    readonly status?: Venue["status"];
    readonly verified?: boolean;
}

/** Booking-related interfaces */
export interface VenueAvailability {
    readonly venueId: string;
    readonly date: string;
    readonly isAvailable: boolean;
    readonly bookingId?: string;
    readonly timeSlots?: readonly {
        readonly startTime: string;
        readonly endTime: string;
        readonly isAvailable: boolean;
    }[];
}

export interface VenueBookingRequest {
    readonly venueId: string;
    readonly date: string;
    readonly startTime: string;
    readonly endTime: string;
    readonly eventType: VenueEventType;
    readonly expectedGuests: number;
    readonly message?: string;
    readonly contactInfo: {
        readonly name: string;
        readonly email: string;
        readonly phone?: string;
    };
}
