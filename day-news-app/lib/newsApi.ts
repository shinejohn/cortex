import api from './api';

interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    meta: {
        page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}

interface Article {
    id: string;
    title: string;
    subtitle?: string;
    content: string;
    slug: string;
    publication_date: string;
    category: string;
    status: 'draft' | 'pending_review' | 'published' | 'archived';
    image?: string;
    image_description?: string;
    tags: string[];
    priority_score: number;
    likes: string[];
    saved: string[];
    shared: string[];
    author?: VirtualJournalist;
    city?: City;
    created_at: string;
    updated_at: string;
}

interface VirtualJournalist {
    id: string;
    fullname: string;
    bio?: string;
    avatar?: string;
    specialism: string[];
}

interface City {
    id: string;
    geo_sw_placename: string;  // City name
    geo_sw_adminname1: string; // State
    geo_sw_postalcode: string;
    geo_sw_lat: number;
    geo_sw_lng: number;
}

// Get news feed for a city
export const getNews = async (
    cityId: string,
    page = 1,
    perPage = 20,
    category?: string
): Promise<PaginatedResponse<Article>> => {
    const params: Record<string, any> = {
        city_id: cityId,
        status: 'published',
        page,
        per_page: perPage,
        sort: 'publication_date',
        order: 'desc',
    };

    if (category && category !== 'all') {
        params.category = category;
    }

    const response = await api.get('/posts', { params });
    return response.data;
};

// Get featured/hero story
export const getFeaturedStory = async (cityId: string): Promise<Article | null> => {
    const response = await api.get('/posts', {
        params: {
            city_id: cityId,
            status: 'published',
            sort: 'priority_score',
            order: 'desc',
            per_page: 1,
        },
    });
    return response.data.data[0] || null;
};

// Get single article by slug
export const getArticle = async (slug: string): Promise<Article> => {
    const response = await api.get(`/posts/${slug}`);
    return response.data.data;
};

// Get related articles
export const getRelatedArticles = async (
    articleId: string,
    cityId: string,
    limit = 5
): Promise<Article[]> => {
    const response = await api.get('/posts', {
        params: {
            city_id: cityId,
            status: 'published',
            exclude_id: articleId,
            per_page: limit,
        },
    });
    return response.data.data;
};

// Search articles
export const searchArticles = async (
    query: string,
    cityId?: string
): Promise<Article[]> => {
    const params: Record<string, any> = {
        q: query,
        status: 'published',
    };

    if (cityId) {
        params.city_id = cityId;
    }

    const response = await api.get('/posts/search', { params });
    return response.data.data;
};

// Get user's saved articles
export const getSavedArticles = async (userId: string): Promise<Article[]> => {
    const response = await api.get(`/users/${userId}/saved-posts`);
    return response.data.data;
};
