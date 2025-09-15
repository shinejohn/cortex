import type { SharedData } from "./index";
import type { Location } from "./events";

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

export type VenueAmenity =
    (typeof VENUE_AMENITIES)[keyof typeof VENUE_AMENITIES];

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

export type VenueEventType =
    (typeof VENUE_EVENT_TYPES)[keyof typeof VENUE_EVENT_TYPES];

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

/** Enhanced Venue interface matching mock data structure */
export interface Venue {
    readonly id: string;
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
    readonly unavailableDates: readonly string[];
    readonly lastBookedDaysAgo: number;
    readonly responseTimeHours: number;
    readonly listedDate: string;
    // Laravel model fields
    readonly status?: "active" | "inactive" | "pending" | "suspended";
    readonly ownerId?: string;
    readonly createdAt?: string;
    readonly updatedAt?: string;
    // Computed/derived fields for compatibility
    readonly pricePerHour: number;
    readonly pricePerEvent: number;
    readonly pricePerDay: number;
}

/** Venue category for filtering and organization */
export interface VenueCategory {
    readonly id: string;
    readonly name: string;
    readonly icon: string;
    readonly count: number;
    readonly color: string;
}

/** Venue filters */
export interface VenueFilters {
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

/** Page Props */
export interface VenuesPageProps extends SharedData {
    readonly featuredVenues?: readonly Venue[];
    readonly allVenues?: readonly Venue[];
    readonly venueCategories?: readonly VenueCategory[];
    readonly filters?: VenueFilters;
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
