import api from './api';

interface City {
    id: string;
    geo_sw_placename: string;  // City name (e.g., "Clearwater")
    geo_sw_adminname1: string; // State (e.g., "Florida")
    geo_sw_iso3166_2: string;  // State code (e.g., "FL")
}

// Search cities
export const searchCities = async (query: string): Promise<City[]> => {
    const response = await api.get('/cities/search', {
        params: { q: query },
    });
    return response.data.data;
};

// Get popular/featured cities
export const getPopularCities = async (): Promise<City[]> => {
    const response = await api.get('/cities/popular');
    return response.data.data;
};

// Get city details
export const getCity = async (cityId: string): Promise<City> => {
    const response = await api.get(`/cities/${cityId}`);
    return response.data.data;
};

// Get city by coordinates (Reverse Geocoding)
export const getCityByCoords = async (lat: number, lng: number): Promise<City> => {
    const response = await api.post('/cities/locate', { lat, lng });
    return response.data.data;
};
