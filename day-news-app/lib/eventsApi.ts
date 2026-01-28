import api from './api';

interface Event {
    id: string;
    announcement_type: string;
    event_type: string;
    short_description: string;
    full_description?: string;
    main_image?: string;
    location: {
        address?: string;
        city?: string;
        state?: string;
        lat?: number;
        lng?: number;
    };
    date_time_start: string;
    date_time_end?: string;
    link?: string;
    tags: string[];
    likes: string[];
    created_at: string;
}

// Get upcoming events
export const getEvents = async (
    cityId: string,
    page = 1,
    perPage = 20,
    eventType?: string
): Promise<{ data: Event[]; meta: any }> => {
    const params: Record<string, any> = {
        city_id: cityId,
        start_date: new Date().toISOString(),
        page,
        per_page: perPage,
        sort: 'date_time_start',
        order: 'asc',
    };

    if (eventType) {
        params.event_type = eventType;
    }

    const response = await api.get('/events', { params });
    return response.data;
};

// Get single event
export const getEvent = async (eventId: string): Promise<Event> => {
    const response = await api.get(`/events/${eventId}`);
    return response.data.data;
};

// Get events for date range (calendar view)
export const getEventsInRange = async (
    cityId: string,
    startDate: string,
    endDate: string
): Promise<Event[]> => {
    const response = await api.get('/events', {
        params: {
            city_id: cityId,
            start_date: startDate,
            end_date: endDate,
        },
    });
    return response.data.data;
};

// RSVP to event
export const rsvpToEvent = async (eventId: string): Promise<void> => {
    await api.post(`/events/${eventId}/rsvp`);
};

// Cancel RSVP
export const cancelRsvp = async (eventId: string): Promise<void> => {
    await api.delete(`/events/${eventId}/rsvp`);
};
