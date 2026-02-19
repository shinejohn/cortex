import axios from "axios";

const API_BASE = "/api/v1";

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
});

export interface CommunityFilters {
    category?: string;
    fibonacco_status?: string;
    min_profile_completeness?: number;
    per_page?: number;
    page?: number;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    meta: {
        page: number;
        per_page: number;
        total: number;
        last_page: number;
        from: number | null;
        to: number | null;
    };
}

export const communityService = {
    list(filters?: Record<string, string | number | undefined>): Promise<PaginatedResponse<unknown>> {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([k, v]) => {
                if (v !== undefined && v !== "") params.set(k, String(v));
            });
        }
        return api.get(`/communities?${params}`).then((r) => r.data);
    },

    get(id: string): Promise<{ success: boolean; data: unknown }> {
        return api.get(`/communities/${id}`).then((r) => r.data);
    },

    getBusinesses(
        communityId: string,
        filters?: CommunityFilters
    ): Promise<PaginatedResponse<Record<string, unknown>>> {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([k, v]) => {
                if (v !== undefined && v !== "") params.set(k, String(v));
            });
        }
        return api.get(`/communities/${communityId}/businesses?${params}`).then((r) => r.data);
    },
};
