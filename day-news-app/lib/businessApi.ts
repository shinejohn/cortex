import api from './api';

interface Business {
    id: string;
    name: string;
    type: string;
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
    geo?: {
        lat: number;
        lng: number;
    };
    city_id: string;
    priority_score: number;
    created_at: string;
}

// Get businesses
export const getBusinesses = async (
    cityId: string,
    page = 1,
    perPage = 20,
    type?: string
): Promise<{ data: Business[]; meta: any }> => {
    const params: Record<string, any> = {
        city_id: cityId,
        page,
        per_page: perPage,
    };

    if (type) {
        params.type = type;
    }

    const response = await api.get('/businesses', { params });
    return response.data;
};

// Get single business
export const getBusiness = async (businessId: string): Promise<Business> => {
    const response = await api.get(`/businesses/${businessId}`);
    return response.data.data;
};

// Search businesses
export const searchBusinesses = async (
    query: string,
    cityId: string
): Promise<Business[]> => {
    const response = await api.get('/businesses/search', {
        params: { q: query, city_id: cityId },
    });
    return response.data.data;
};

// Get business categories
export const getBusinessCategories = async (): Promise<string[]> => {
    const response = await api.get('/businesses/categories');
    return response.data.data;
};
