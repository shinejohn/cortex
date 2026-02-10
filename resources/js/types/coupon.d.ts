export interface Business {
    id: number;
    name: string;
    description?: string;
    logo?: string;
    images?: string[];
    website?: string;
    phone?: string;
    email?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    rating?: number;
    review_count?: number;
    is_verified?: boolean;
    slug: string;
    categories?: string[];
    opening_hours?: Record<string, string>;
}

export interface Region {
    id: number;
    name: string;
    slug: string;
}

export interface CouponUser {
    id: number;
    name: string;
    avatar?: string;
}

export interface Comment {
    id: number;
    content: string;
    user: CouponUser;
    created_at: string;
    likes_count?: number;
    is_liked?: boolean;
    replies?: Comment[];
}

export interface Coupon {
    id: number;
    title: string;
    slug: string;
    description: string;
    code?: string;
    discount_value: string;
    discount_type: 'percentage' | 'fixed_amount';
    discount_display: string;
    image?: string;
    valid_from: string;
    valid_until?: string;
    terms_conditions?: string;
    is_verified: boolean;
    score: number;
    upvotes_count: number;
    downvotes_count: number;
    user_vote?: 'up' | 'down';
    saves_count: number;
    is_saved: boolean;
    view_count: number;
    created_at: string;
    category: string;
    business: Business;
    user?: CouponUser;
    regions: Region[];
    comments?: Comment[];
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
}

export interface FilterOptions {
    search?: string;
    category?: string;
    sort?: string;
}

export interface CouponsIndexPageProps {
    featuredCoupons: Coupon[];
    coupons: PaginatedData<Coupon>;
    categories: Category[];
    filters: FilterOptions;
    hasRegion: boolean;
}

export interface CouponShowPageProps {
    coupon: Coupon;
    relatedCoupons: Coupon[];
}
