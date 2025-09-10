import { SharedData } from "./index";

export interface Event {
    id: string;
    title: string;
    date: string;
    venue: string;
    price: string;
    category: string;
    image: string;
}

export interface EventsGridProps extends SharedData {
    featuredEvents?: Event[];
}
