import { Head, router } from "@inertiajs/react";
import { FileText, Sparkles } from "lucide-react";
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

interface CreatePostProps {
    auth: Auth;
    regions: Region[];
    initialType: string;
}

export default function CreatePost({ auth, regions, initialType }: CreatePostProps) {
    const handleSubmit = (data: any) => {
        router.post(route("daynews.posts.store") as any, data, {
            preserveScroll: true,
        });
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-[#FDFCFB]">
                <Head>
                    <title>Create Post - Day News</title>
                </Head>
                <DayNewsHeader auth={auth} />

                <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-10">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <FileText className="size-6" />
                            </div>
                            <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary font-black uppercase tracking-widest text-[10px] px-3">
                                New Post
                            </Badge>
                        </div>
                        <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl text-zinc-900">Create Post</h1>
                        <p className="mt-3 text-base font-medium text-muted-foreground leading-relaxed max-w-2xl">
                            Share your news with the community
                        </p>
                    </div>

                    <PostForm initialData={{ type: initialType }} regions={regions} onSubmit={handleSubmit} />
                </div>
            </div>
        </LocationProvider>
    );
}
