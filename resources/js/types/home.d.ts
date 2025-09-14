import type { SharedData } from "./index";
import type { Performer, PerformersGridProps } from "./performers";

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

// Re-export for backward compatibility
export type { Performer, PerformersGridProps };
