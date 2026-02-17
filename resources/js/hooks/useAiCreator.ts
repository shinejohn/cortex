import axios from "axios";
import { useCallback, useState } from "react";
import type {
  AiCreatorSession,
  Classification,
  FactCheckResult,
  HeadlineOption,
  ImageSuggestion,
  PerformerMatch,
  QualityAnalysis,
  SeoAnalysis,
  VenueMatch,
} from "@/types/ai-creator";

const API_BASE = "/api/v1";

export function useAiCreator() {
  const [session, setSession] = useState<AiCreatorSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useCallback(
    async <T>(method: string, url: string, data?: object): Promise<T> => {
      setError(null);
      const response = await axios.request<T>({
        method,
        url: `${API_BASE}${url}`,
        data,
        withCredentials: true,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      return response.data;
    },
    [],
  );

  const initSession = useCallback(
    async (contentType: string, regionId?: string) => {
      setIsLoading(true);
      try {
        const result = await api<{ success: boolean; data: AiCreatorSession }>(
          "post",
          "/ai-creator/sessions",
          { content_type: contentType, region_id: regionId },
        );
        if (result.success && result.data) {
          setSession(result.data);
          return result.data;
        }
        throw new Error("Failed to create session");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to init session";
        setError(msg);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );

  const analyzeContent = useCallback(
    async (title: string, content: string) => {
      if (!session) throw new Error("No session");
      setIsLoading(true);
      try {
        const result = await api<{
          success: boolean;
          data: { seo_analysis: SeoAnalysis; quality_analysis: QualityAnalysis; classification: Classification };
        }>("post", `/ai-creator/sessions/${session.id}/analyze`, { title, content });
        if (result.success && result.data) return result.data;
        throw new Error("Analysis failed");
      } finally {
        setIsLoading(false);
      }
    },
    [api, session],
  );

  const generateContent = useCallback(
    async (prompt: string, tone?: string, length?: string): Promise<Record<string, unknown>> => {
      if (!session) throw new Error("No session");
      setIsLoading(true);
      try {
        const result = await api<{ success: boolean; data: Record<string, unknown> }>(
          "post",
          `/ai-creator/sessions/${session.id}/generate`,
          { prompt, tone, length },
        );
        if (result.success && result.data) return result.data;
        return {};
      } finally {
        setIsLoading(false);
      }
    },
    [api, session],
  );

  const generateHeadlines = useCallback(
    async (topic: string): Promise<HeadlineOption[]> => {
      if (!session) throw new Error("No session");
      setIsLoading(true);
      try {
        const result = await api<{ success: boolean; data: HeadlineOption[] }>(
          "post",
          `/ai-creator/sessions/${session.id}/headlines`,
          { topic },
        );
        if (result.success && result.data) return result.data;
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [api, session],
  );

  const factCheckContent = useCallback(
    async (content: string) => {
      if (!session) throw new Error("No session");
      setIsLoading(true);
      try {
        const result = await api<{ success: boolean; data: FactCheckResult[] }>(
          "post",
          `/ai-creator/sessions/${session.id}/fact-check`,
          { content },
        );
        if (result.success && result.data) return result.data;
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [api, session],
  );

  const suggestImages = useCallback(
    async (title: string, tags: string[] = []) => {
      if (!session) throw new Error("No session");
      setIsLoading(true);
      try {
        const result = await api<{ success: boolean; data: ImageSuggestion[] }>(
          "post",
          `/ai-creator/sessions/${session.id}/images`,
          { title, tags },
        );
        if (result.success && result.data) return result.data;
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [api, session],
  );

  const parseEvent = useCallback(
    async (description: string): Promise<Record<string, unknown>> => {
      if (!session) throw new Error("No session");
      setIsLoading(true);
      try {
        const result = await api<{ success: boolean; data: Record<string, unknown> }>(
          "post",
          `/ai-creator/sessions/${session.id}/parse-event`,
          { description },
        );
        if (result.success && result.data) return result.data;
        return {};
      } finally {
        setIsLoading(false);
      }
    },
    [api, session],
  );

  const matchVenue = useCallback(
    async (query: string): Promise<VenueMatch[]> => {
      if (!session) throw new Error("No session");
      setIsLoading(true);
      try {
        const result = await api<{ success: boolean; data: VenueMatch[] }>(
          "post",
          `/ai-creator/sessions/${session.id}/match-venue`,
          { query },
        );
        if (result.success && result.data) return result.data;
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [api, session],
  );

  const matchPerformer = useCallback(
    async (query: string) => {
      if (!session) throw new Error("No session");
      setIsLoading(true);
      try {
        const result = await api<{ success: boolean; data: PerformerMatch[] }>(
          "post",
          `/ai-creator/sessions/${session.id}/match-performer`,
          { query },
        );
        if (result.success && result.data) return result.data;
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [api, session],
  );

  return {
    session,
    isLoading,
    error,
    initSession,
    analyzeContent,
    generateContent,
    generateHeadlines,
    factCheckContent,
    suggestImages,
    parseEvent,
    matchVenue,
    matchPerformer,
  };
}
