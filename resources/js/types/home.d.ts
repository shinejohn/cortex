import { SharedData } from "./index";

export interface Venue {
    id: string;
    name: string;
    location: string;
    capacity: string;
    venueType: string;
    rating: string;
    reviewCount: string;
    image: string;
}

export interface Performer {
    id: string;
    name: string;
    homeCity: string;
    genres: string[];
    rating: string;
    reviewCount: string;
    image: string;
    upcomingShow: {
        date: string;
        venue?: string;
    };
}

export interface VenuesGridProps extends SharedData {
    featuredVenues?: Venue[];
}

export interface PerformersGridProps extends SharedData {
    featuredPerformers?: Performer[];
}
