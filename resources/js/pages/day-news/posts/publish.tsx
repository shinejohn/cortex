import DayNewsHeader from "@/components/day-news/day-news-header";
import PublishPreview from "@/components/day-news/publish-preview";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { Head } from "@inertiajs/react";
import React from "react";

interface Region {
    id: number;
    name: string;
}

interface Post {
    id: number;
    type: string;
    category: string | null;
    title: string;
    excerpt: string | null;
    content: string;
    featured_image: string | null;
    metadata: {
        ad_days?: number;
        ad_placement?: string;
    };
    regions: Region[];
}

interface Pricing {
    is_free: boolean;
    cost: number;
    reason: string | null;
}

interface PublishPostProps {
    auth: Auth;
    post: Post;
    pricing: Pricing;
}

export default function PublishPost({ auth, post, pricing }: PublishPostProps) {
    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head>
                    <title>Publish Post - Day News</title>
                </Head>
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Publish Post</h1>
                        <p className="mt-1 text-muted-foreground">Review your post before publishing</p>
                    </div>

                    <PublishPreview post={post} pricing={pricing} />
                </div>
            </div>
        </LocationProvider>
    );
}
