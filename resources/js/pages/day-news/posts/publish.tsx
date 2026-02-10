import { Head } from "@inertiajs/react";
import { Eye } from "lucide-react";
import React from "react";
import DayNewsHeader from "@/components/day-news/day-news-header";
import PublishPreview from "@/components/day-news/publish-preview";
import { Badge } from "@/components/ui/badge";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

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
            <div className="min-h-screen bg-[#FDFCFB]">
                <Head>
                    <title>Publish Post - Day News</title>
                </Head>
                <DayNewsHeader auth={auth} />

                <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-10">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <Eye className="size-6" />
                            </div>
                            <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary font-black uppercase tracking-widest text-[10px] px-3">
                                Final Review
                            </Badge>
                        </div>
                        <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl text-zinc-900">Publish Post</h1>
                        <p className="mt-3 text-base font-medium text-muted-foreground leading-relaxed max-w-2xl">
                            Review your post before publishing
                        </p>
                    </div>

                    <PublishPreview post={post} pricing={pricing} />
                </div>
            </div>
        </LocationProvider>
    );
}
