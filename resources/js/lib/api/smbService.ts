import axios from "axios";
import type {
    SmbFullProfile,
    SmbAiContext,
    SmbIntelligenceSummary,
} from "@/types/smb";

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

export const smbService = {
    getFullProfile(id: string): Promise<{ data: SmbFullProfile }> {
        return api.get(`/smb/${id}/full-profile`).then((r) => r.data);
    },

    getAIContext(id: string): Promise<{ data: SmbAiContext }> {
        return api.get(`/smb/${id}/ai-context`).then((r) => r.data);
    },

    getIntelligenceSummary(id: string): Promise<{ data: SmbIntelligenceSummary }> {
        return api.get(`/smb/${id}/intelligence-summary`).then((r) => r.data);
    },

    updateSection(
        id: string,
        section: "ai_context" | "survey_responses" | "customer_intelligence" | "competitor_analysis",
        data: Record<string, unknown>
    ): Promise<{ data: SmbFullProfile }> {
        return api
            .patch(`/smb/${id}/profile/${section}`, data)
            .then((r) => r.data);
    },

    requestEnrichment(id: string): Promise<{ data: { last_enriched_at: string | null } }> {
        return api.post(`/smb/${id}/enrich`).then((r) => r.data);
    },
};
