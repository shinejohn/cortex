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

interface CreatePostProps {
    auth: Auth;
    regions: Region[];
    initialType: string;
}

export default function CreatePost({ auth, regions, initialType }: CreatePostProps) {
    const handleSubmit = (data: any) => {
        router.post("/posts", data, {
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
                        <p className="mt-1 text-muted-foreground">Share your news with the community</p>
                    </div>

                    <PostForm initialData={{ type: initialType }} regions={regions} onSubmit={handleSubmit} />
                </div>
            </div>
        </LocationProvider>
    );
}
