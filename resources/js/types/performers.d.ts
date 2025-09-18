import type { SharedData } from "./index";

/** Performer music genres */
export const PERFORMER_GENRES = {
    ROCK_ALTERNATIVE: "Rock/Alternative",
    INDIE: "Indie",
    POP_TOP_40: "Pop/Top 40",
    JAZZ: "Jazz",
    CLASSICAL: "Classical",
    COUNTRY: "Country",
    ELECTRONIC: "Electronic",
    FOLK: "Folk",
    R_AND_B: "R&B",
    HIP_HOP: "Hip Hop",
    BLUES: "Blues",
    REGGAE: "Reggae",
    LATIN: "Latin",
    WORLD: "World Music",
} as const;

export type PerformerGenre = (typeof PERFORMER_GENRES)[keyof typeof PERFORMER_GENRES];

/** Upcoming show information */
export interface UpcomingShow {
    readonly date: string;
    readonly venue: string;
    readonly ticketsAvailable: boolean;
}

/** Enhanced Performer interface matching mock data structure */
export interface Performer {
    readonly id: string;
    readonly name: string;
    readonly profileImage: string;
    readonly genres: readonly PerformerGenre[];
    readonly rating: number;
    readonly reviewCount: number;
    readonly followerCount: number;
    readonly bio: string;
    readonly yearsActive: number;
    readonly showsPlayed: number;
    readonly homeCity: string;
    readonly isVerified: boolean;
    readonly isTouringNow: boolean;
    readonly availableForBooking: boolean;
    readonly hasMerchandise: boolean;
    readonly hasOriginalMusic: boolean;
    readonly offersMeetAndGreet: boolean;
    readonly takesRequests: boolean;
    readonly availableForPrivateEvents: boolean;
    readonly isFamilyFriendly: boolean;
    readonly hasSamples: boolean;
    readonly trendingScore: number;
    readonly distanceMiles: number;
    readonly addedDate: string;
    readonly introductoryPricing: boolean;
    readonly upcomingShows: readonly UpcomingShow[];
    // Laravel model fields
    readonly status?: "active" | "inactive" | "pending" | "suspended";
    readonly userId?: string;
    readonly createdAt?: string;
    readonly updatedAt?: string;
    // Compatibility fields
    readonly image: string; // alias for profileImage
    readonly upcomingShow: UpcomingShow | null; // first upcoming show
}

/** Performer pricing structure */
export interface PerformerPricing {
    readonly basePrice: number;
    readonly currency: string;
    readonly minimumBookingHours: number;
    readonly travelFeePerMile?: number;
    readonly setupFee?: number;
    readonly cancellationPolicy: string;
}

/** Performer category for filtering and organization */
export interface PerformerCategory {
    readonly id: string;
    readonly name: string;
    readonly icon: string;
    readonly count: number;
    readonly color: string;
}

/** Performer filters */
export interface PerformerFilters {
    readonly category: string;
    readonly location?: string;
    readonly genre?: PerformerGenre;
    readonly rating?: number;
    readonly availableForBooking?: boolean;
    readonly isVerified?: boolean;
    readonly priceRange?: {
        readonly min: number;
        readonly max: number;
    };
    readonly distance?: {
        readonly lat: number;
        readonly lng: number;
        readonly radius: number; // in miles
    };
    readonly eventType?: "private" | "public" | "corporate";
    readonly isFamilyFriendly?: boolean;
}

/** Page Props */
export interface PerformersPageProps extends SharedData {
    readonly featuredPerformers?: readonly Performer[];
    readonly performerCategories?: readonly PerformerCategory[];
    readonly allPerformers?: readonly Performer[];
    readonly filters?: PerformerFilters;
}

export interface PerformersGridProps extends SharedData {
    readonly featuredPerformers?: readonly Performer[];
}

/** Performer actions */
export interface PerformerCardActions {
    readonly onShare: (performer: Performer) => void;
    readonly onLike: (performer: Performer) => void;
    readonly onFollow?: (performer: Performer) => void;
    readonly onBook?: (performer: Performer) => void;
    readonly onViewProfile: (performer: Performer) => void;
}

/** Performer creation/editing */
export interface CreatePerformerData {
    readonly name: string;
    readonly bio: string;
    readonly genres: readonly PerformerGenre[];
    readonly homeCity: string;
    readonly profileImage?: string;
    readonly pricing?: PerformerPricing;
    readonly availableForBooking: boolean;
    readonly availableForPrivateEvents: boolean;
    readonly isFamilyFriendly: boolean;
    readonly offersMeetAndGreet: boolean;
    readonly takesRequests: boolean;
    readonly hasMerchandise: boolean;
    readonly hasOriginalMusic: boolean;
}

export interface UpdatePerformerData extends Partial<CreatePerformerData> {
    readonly id: string;
    readonly status?: Performer["status"];
    readonly isVerified?: boolean;
}

/** Booking-related interfaces */
export interface PerformerBookingRequest {
    readonly performerId: string;
    readonly eventDate: string;
    readonly startTime: string;
    readonly endTime: string;
    readonly venueId?: string;
    readonly eventType: "private" | "public" | "corporate";
    readonly expectedAudience: number;
    readonly budget: number;
    readonly message?: string;
    readonly contactInfo: {
        readonly name: string;
        readonly email: string;
        readonly phone?: string;
    };
    readonly specialRequests?: readonly string[];
}
