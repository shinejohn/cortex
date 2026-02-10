import { Head, router } from "@inertiajs/react";
import { Save } from "lucide-react";
import React from "react";
import DayNewsHeader from "@/components/day-news/day-news-header";
import PostForm from "@/components/day-news/post-form";
import { Badge } from "@/components/ui/badge";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface Region {
    id: number;
    name: string;
    type: string;
}

interface Post {
    id: number;
    type: string;
    category: string | null;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    featured_image: string | null;
    metadata: {
        ad_days?: number;
        ad_placement?: string;
    };
    status: string;
    regions: number[];
}

interface EditPostProps {
    auth: Auth;
    post: Post;
    regions: Region[];
}

export default function EditPost({ auth, post, regions }: EditPostProps) {
    const handleSubmit = (data: any) => {
        router.post(
            route("daynews.posts.update", post.id) as any,
            {
                ...data,
                _method: "PATCH",
            },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-[#FDFCFB]">
                <Head>
                    <title>Edit Post - Day News</title>
                </Head>
                <DayNewsHeader auth={auth} />

                <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-10">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <Save className="size-6" />
                            </div>
                            <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary font-black uppercase tracking-widest text-[10px] px-3">
                                Editor Mode
                            </Badge>
                        </div>
                        <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl text-zinc-900">Edit Post</h1>
                        <p className="mt-3 text-base font-medium text-muted-foreground leading-relaxed max-w-2xl">
                            Update your draft before publishing
                        </p>
                    </div>

                    <PostForm
                        initialData={{
                            type: post.type,
                            category: post.category,
                            title: post.title,
                            content: post.content,
                            excerpt: post.excerpt || "",
                            region_ids: post.regions,
                            metadata: post.metadata,
                        }}
                        regions={regions}
                        isEditing={true}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
        </LocationProvider>
    );
}
