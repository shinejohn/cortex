import type { SharedData } from "./index";

export interface Performer {
    readonly id: string;
    readonly name: string;
    readonly homeCity: string;
    readonly genres: string[];
    readonly rating: string;
    readonly reviewCount: string;
    readonly image: string;
    readonly upcomingShow: {
        readonly date: string;
        readonly venue?: string;
    };
}

export interface PerformerCategory {
    readonly id: string;
    readonly name: string;
    readonly icon: string;
    readonly count: number;
    readonly color: string;
}

export interface PerformersPageProps extends SharedData {
    readonly featuredPerformers?: Performer[];
    readonly performerCategories?: PerformerCategory[];
    readonly allPerformers?: Performer[];
}

export interface PerformersGridProps extends SharedData {
    readonly featuredPerformers?: Performer[];
}

export interface PerformerCardActions {
    readonly onShare: (performer: Performer) => void;
    readonly onLike: (performer: Performer) => void;
}

export interface PerformerFilters {
    readonly category: string;
    readonly location?: string;
    readonly genre?: string;
    readonly rating?: number;
}
