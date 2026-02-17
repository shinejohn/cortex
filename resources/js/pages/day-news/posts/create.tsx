import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import React, { useCallback, useEffect, useState } from "react";
import { route } from "ziggy-js";
import AiWritingPanel from "@/components/day-news/ai-writing-panel";
import DayNewsHeader from "@/components/day-news/day-news-header";
import PostForm from "@/components/day-news/post-form";
import { LocationProvider } from "@/contexts/location-context";
import { useAiCreator } from "@/hooks/useAiCreator";
import type { Auth } from "@/types";

interface Region {
    id: number;
    name: string;
    type: string;
}

interface CreatePostProps {
    auth: Auth;
    regions: Region[];
    initialType: string;
    categories: string[];
    defaultRegionId: string | null;
}

interface PostFormData {
    type: string;
    category: string | null;
    title: string;
    content: string;
    excerpt: string;
    featured_image: File | null;
    region_ids: number[];
    metadata: { ad_days?: number; ad_placement?: string };
}

export default function CreatePost({ auth, regions, initialType }: CreatePostProps) {
    const { initSession, generateContent, generateHeadlines, isLoading, error: aiError } = useAiCreator();
    const [aiPrompt, setAiPrompt] = useState("");
    const [headlineSuggestions, setHeadlineSuggestions] = useState<Array<{ headline: string }>>([]);

    const { data, setData, post, processing, errors } = useForm<PostFormData>({
        type: initialType,
        category: null,
        title: "",
        content: "",
        excerpt: "",
        featured_image: null,
        region_ids: [],
        metadata: {},
    });

    const handleSetData = useCallback(
        (key: string, value: unknown) => {
            setData(key, value);
        },
        [setData],
    );

    useEffect(() => {
        initSession("article").catch(() => {});
    }, [initSession]);

    const handleGenerate = async () => {
        if (!aiPrompt.trim()) return;
        try {
            const result = await generateContent(aiPrompt);
            if (result && typeof result === "object") {
                const r = result as Record<string, unknown>;
                if (r.title) setData("title", r.title);
                if (r.content) setData("content", r.content);
                if (r.excerpt) setData("excerpt", r.excerpt);
            }
        } catch {
            // Error surfaced via aiError
        }
    };

    const handleHeadlines = async () => {
        try {
            const topic = data.title || aiPrompt || "local news";
            const result = await generateHeadlines(topic);
            if (Array.isArray(result)) {
                setHeadlineSuggestions(
                    result.map((h) => ({
                        headline: typeof h === "object" && h && "headline" in h ? (h as { headline: string }).headline : String(h),
                    })),
                );
            }
        } catch {
            // Error surfaced via aiError
        }
    };

    const handleSelectHeadline = (headline: string) => {
        setData("title", headline);
    };

    const handleSubmit = (_formData: PostFormData) => {
        post(route("daynews.posts.store"), {
            preserveScroll: true,
        });
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head>
                    <title>Create Post - Day News</title>
                </Head>
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Create Post</h1>
                        <p className="mt-1 text-muted-foreground">Share your news with the community. Use AI to help draft your article.</p>
                    </div>

                    <div className="space-y-6">
                        <AiWritingPanel
                            prompt={aiPrompt}
                            onPromptChange={setAiPrompt}
                            onGenerate={handleGenerate}
                            onHeadlines={handleHeadlines}
                            isLoading={isLoading}
                            error={aiError ?? undefined}
                            headlineSuggestions={headlineSuggestions}
                            onSelectHeadline={handleSelectHeadline}
                        />

                        <PostForm
                            initialData={{ type: initialType }}
                            regions={regions}
                            onSubmit={handleSubmit}
                            data={data}
                            setData={handleSetData}
                            processing={processing}
                            errors={errors}
                        />
                    </div>
                </div>
            </div>
        </LocationProvider>
    );
}
