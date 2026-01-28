import api from './api';

interface MultimediaContent {
    id: string;
    content_type: 'podcast' | 'video';
    title: string;
    description?: string;
    media_url: string;
    thumbnail?: string;
    duration?: number;
    city_id: string;
    status: 'draft' | 'published';
    episode_number?: number;
    show_id?: string;
    chapters?: Chapter[];
    created_at: string;
}

interface Chapter {
    title: string;
    start_time: number;
}

interface Show {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    episode_count: number;
}

// Get podcasts
export const getPodcasts = async (
    cityId: string,
    page = 1
): Promise<{ data: MultimediaContent[]; meta: any }> => {
    const response = await api.get('/multimedia', {
        params: {
            city_id: cityId,
            content_type: 'podcast',
            status: 'published',
            page,
            sort: 'created_at',
            order: 'desc',
        },
    });
    return response.data;
};

// Get videos
export const getVideos = async (
    cityId: string,
    page = 1
): Promise<{ data: MultimediaContent[]; meta: any }> => {
    const response = await api.get('/multimedia', {
        params: {
            city_id: cityId,
            content_type: 'video',
            status: 'published',
            page,
            sort: 'created_at',
            order: 'desc',
        },
    });
    return response.data;
};

// Get single episode
export const getEpisode = async (episodeId: string): Promise<MultimediaContent> => {
    const response = await api.get(`/multimedia/${episodeId}`);
    return response.data.data;
};

// Get shows list
export const getShows = async (cityId: string): Promise<Show[]> => {
    const response = await api.get('/shows', {
        params: { city_id: cityId },
    });
    return response.data.data;
};

// Get episodes for a show
export const getShowEpisodes = async (showId: string): Promise<MultimediaContent[]> => {
    const response = await api.get(`/shows/${showId}/episodes`);
    return response.data.data;
};
