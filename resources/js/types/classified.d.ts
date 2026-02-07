import { PaginatedData, Region } from "@/types/coupon";

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

export interface Specification {
    name: string;
    value: string;
}

export interface CustomAttribute {
    key: string;
    value: string;
}

export interface Classified {
    id: number;
    title: string;
    slug: string;
    description: string;
    price: string;
    price_display: string;
    price_type: 'fixed' | 'negotiable' | 'free' | 'contact';
    condition: string;
    condition_display?: string;
    status: 'active' | 'sold' | 'expired' | 'draft';
    location: string;
    contact_email?: string;
    contact_phone?: string;
    category: Category;
    images: ClassifiedImage[];
    // For index view mostly, but can be present
    user: {
        id: number;
        name: string;
        avatar?: string;
        created_at: string;
    };
    created_at: string;
    expires_at?: string;
    is_active: boolean;
    view_count: number;

    // Auth/Interaction
    is_owner: boolean;
    is_saved: boolean;
    saves_count: number;

    regions: Region[];
    specifications: Specification[];
    custom_attributes: CustomAttribute[];
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

export interface SimilarClassified extends Classified {
    primary_image?: string;
}

export interface ClassifiedShowPageProps {
    classified: Classified;
    contact?: {
        email?: string;
        phone?: string;
    };
    canViewContact: boolean;
    similarClassifieds: SimilarClassified[];
}
