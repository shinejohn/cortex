import { Head, Link, router } from "@inertiajs/react";
import { FileText, Plus, SlidersHorizontal } from "lucide-react";
import React from "react";
import DayNewsHeader from "@/components/day-news/day-news-header";
import PostCard from "@/components/day-news/post-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface Region {
    id: number;
    name: string;
}

interface Payment {
    amount: number;
    status: string;
}

interface Post {
    id: number;
    type: string;
    category: string | null;
    title: string;
    slug: string;
    excerpt: string | null;
    status: string;
    view_count: number;
    published_at: string | null;
    expires_at: string | null;
    regions: Region[];
    payment: Payment | null;
    can_edit: boolean;
    can_delete: boolean;
}

interface PaginatedPosts {
    data: Post[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Filters {
    type?: string;
    status?: string;
}

interface PostsIndexProps {
    auth: Auth;
    posts: PaginatedPosts;
    filters: Filters;
}

export default function PostsIndex({ auth, posts, filters }: PostsIndexProps) {
    const handleDelete = (postId: number) => {
        if (confirm("Are you sure you want to delete this post?")) {
            router.delete(route("daynews.posts.destroy", postId) as any, {
                preserveScroll: true,
            });
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            route("daynews.posts.index") as any,
            {
                ...filters,
                [key]: value === "all" ? undefined : value,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head>
                    <title>My Posts - Day News</title>
                </Head>
                <DayNewsHeader auth={auth} />

                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">My Posts</h1>
                            <p className="mt-2 text-sm font-medium text-muted-foreground">Manage your Day News posts</p>
                        </div>
                        <Button asChild className="h-12 gap-2 px-6 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
                            <Link href={route("daynews.posts.create") as any}>
                                <Plus className="size-4" />
                                Create Post
                            </Link>
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="mb-8 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                            <SlidersHorizontal className="size-3.5" />
                            Filters
                        </div>
                        <div className="w-48">
                            <Select value={filters.type || "all"} onValueChange={(value) => handleFilterChange("type", value)}>
                                <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 font-bold text-sm focus:bg-white transition-colors">
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-zinc-200">
                                    <SelectItem value="all">All types</SelectItem>
                                    <SelectItem value="article">Article</SelectItem>
                                    <SelectItem value="announcement">Announcement</SelectItem>
                                    <SelectItem value="notice">Notice</SelectItem>
                                    <SelectItem value="ad">Advertisement</SelectItem>
                                    <SelectItem value="schedule">Schedule</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-48">
                            <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange("status", value)}>
                                <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 font-bold text-sm focus:bg-white transition-colors">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-zinc-200">
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                    <SelectItem value="removed">Removed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {posts.data.length === 0 ? (
                        <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-zinc-200">
                            {/* Decorative blobs */}
                            <div className="absolute -top-24 -right-24 size-64 rounded-full bg-primary/5 blur-3xl" />
                            <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-indigo-500/5 blur-3xl" />

                            <div className="relative z-10 text-center">
                                <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-muted">
                                    <FileText className="size-10 text-muted-foreground" />
                                </div>
                                <h2 className="mb-2 font-display text-xl font-black tracking-tight">No posts found</h2>
                                <p className="mb-6 text-sm font-medium text-muted-foreground">
                                    {filters.type || filters.status ? "Try adjusting your filters" : "Get started by creating your first post"}
                                </p>
                                <Button asChild className="h-12 px-8 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
                                    <Link href={route("daynews.posts.create") as any}>Create Post</Link>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {posts.data.map((post) => (
                                    <PostCard key={post.id} post={post} onDelete={handleDelete} />
                                ))}
                            </div>

                            {posts.last_page > 1 && (
                                <div className="mt-12 flex justify-center gap-3">
                                    {Array.from({ length: posts.last_page }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={page === posts.current_page ? "default" : "outline"}
                                            size="sm"
                                            className={`h-10 min-w-[40px] px-4 font-bold transition-all ${
                                                page === posts.current_page ? "shadow-lg shadow-primary/20 scale-110" : ""
                                            }`}
                                            onClick={() =>
                                                router.get(
                                                    route("daynews.posts.index") as any,
                                                    { ...filters, page },
                                                    {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                    },
                                                )
                                            }
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </LocationProvider>
    );
}
