import type { SharedData } from "./index";
import type { Performer, PerformersGridProps } from "./performers";
import type { Venue as FullVenue, VenuesGridProps as FullVenuesGridProps } from "./venues";

/** Simplified venue interface for backward compatibility */
export interface Venue {
    readonly id: string;
    readonly name: string;
    readonly location: string;
    readonly capacity: string;
    readonly venueType: string;
    readonly rating: string;
    readonly reviewCount: string;
    readonly image: string;
}

export interface VenuesGridProps extends SharedData {
    readonly featuredVenues?: Venue[];
}

// Re-export for backward compatibility and new types
export type { Performer, PerformersGridProps, FullVenue, FullVenuesGridProps };
