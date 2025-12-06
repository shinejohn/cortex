import DayNewsHeader from "@/components/day-news/day-news-header";
import PostCard from "@/components/day-news/post-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { Head, Link, router } from "@inertiajs/react";
import { FileText, Plus } from "lucide-react";
import React from "react";

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
            router.delete(`/posts/${postId}`, {
                preserveScroll: true,
            });
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            "/posts",
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

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">My Posts</h1>
                            <p className="mt-1 text-muted-foreground">Manage your Day News posts</p>
                        </div>
                        <Button asChild>
                            <Link href="/posts/create">
                                <Plus className="mr-2 size-4" />
                                Create Post
                            </Link>
                        </Button>
                    </div>

                    <div className="mb-6 flex flex-wrap gap-4">
                        <div className="w-48">
                            <Select value={filters.type || "all"} onValueChange={(value) => handleFilterChange("type", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
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
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
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
                        <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed">
                            <div className="text-center">
                                <FileText className="mx-auto mb-4 size-12 text-muted-foreground" />
                                <h2 className="mb-2 text-xl font-semibold">No posts found</h2>
                                <p className="mb-4 text-muted-foreground">
                                    {filters.type || filters.status ? "Try adjusting your filters" : "Get started by creating your first post"}
                                </p>
                                <Button asChild>
                                    <Link href="/posts/create">Create Post</Link>
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
                                <div className="mt-8 flex justify-center gap-2">
                                    {Array.from({ length: posts.last_page }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={page === posts.current_page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() =>
                                                router.get(
                                                    "/posts",
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
