import type { SharedData } from './index';

export interface PerformerUpcomingShow {
    id: string;
    date: string;
    venue: string;
    location: string;
    ticketsAvailable: boolean;
    ticketUrl?: string;
}

export interface PerformerEvent {
    id: string;
    title: string;
    description: string;
    event_date: string;
    time: string;
    image?: string;
    venue: {
        id?: string;
        name: string;
        address: string;
    };
}

export interface PerformerReview {
    id: string;
    content: string;
    rating: number;
    user: {
        name: string;
        avatar?: string;
    };
    created_at: string;
}

export interface PerformerProfile {
    id: string;
    name: string;
    profileImage: string;
    genres: string[];
    rating: number;
    reviewCount: number;
    followerCount: number;
    bio: string;
    yearsActive: number;
    showsPlayed: number;
    homeCity: string;
    isVerified: boolean;
    isTouringNow: boolean;
    availableForBooking: boolean;
    hasMerchandise: boolean;
    hasOriginalMusic: boolean;
    offersMeetAndGreet: boolean;
    takesRequests: boolean;
    availableForPrivateEvents: boolean;
    isFamilyFriendly: boolean;
    hasSamples: boolean;
    trendingScore: number;
    upcomingShows: PerformerUpcomingShow[];
    events: PerformerEvent[];
}

export interface RatingStats {
    average: number;
    total: number;
    distribution: number[];
    by_context: {
        performance: number;
        professionalism: number;
        value: number;
        overall: number;
    };
}

export interface PerformerShowPageProps extends SharedData {
    performer: PerformerProfile;
    ratingStats: RatingStats;
    reviews: PerformerReview[];
    isFollowing: boolean;
}

export type ProfileTab =
    | 'overview'
    | 'upcoming-shows'
    | 'past-shows'
    | 'media'
    | 'reviews'
    | 'about';