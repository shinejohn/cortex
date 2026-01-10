import { Head, router } from "@inertiajs/react";
import React from "react";
import DayNewsHeader from "@/components/day-news/day-news-header";
import PostForm from "@/components/day-news/post-form";
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
            `/posts/${post.id}`,
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
            <div className="min-h-screen bg-background">
                <Head>
                    <title>Edit Post - Day News</title>
                </Head>
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Edit Post</h1>
                        <p className="mt-1 text-muted-foreground">Update your draft before publishing</p>
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
