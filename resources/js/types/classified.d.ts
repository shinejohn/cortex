import { PaginatedData } from "@/types/coupon";

export interface Category {
    id: number;
    name: string;
    slug: string;
}

export interface Condition {
    value: string;
    label: string;
}

export interface ClassifiedImage {
    id: number;
    url: string;
}

export interface Classified {
    id: number;
    title: string;
    slug: string;
    description: string;
    price: string;
    price_type: 'fixed' | 'negotiable' | 'free' | 'contact';
    condition: string;
    location: string;
    contact_email?: string;
    contact_phone?: string;
    category?: Category;
    images?: ClassifiedImage[];
    user?: {
        id: number;
        name: string;
        avatar?: string;
    };
    created_at: string;
    expires_at?: string;
    is_active: boolean;
    view_count: number;
}

export interface FilterOptions {
    search?: string;
    category?: string;
    condition?: string;
    sort?: string;
}

export interface ClassifiedsIndexPageProps {
    featuredClassifieds: Classified[];
    classifieds: PaginatedData<Classified>;
    categories: Category[];
    conditions: Condition[];
    filters: FilterOptions;
    hasRegion: boolean;
}

export interface SavedClassifiedsPageProps {
    classifieds: PaginatedData<Classified>;
}

export interface MyClassifiedsPageProps {
    classifieds: PaginatedData<Classified>;
}

export interface ClassifiedShowPageProps {
    classified: Classified;
    relatedClassifieds: Classified[];
}
