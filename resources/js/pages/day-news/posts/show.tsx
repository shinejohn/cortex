import Advertisement from "@/components/day-news/advertisement";
import DayNewsHeader from "@/components/day-news/day-news-header";
import NewsArticleCard from "@/components/day-news/news-article-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { Head } from "@inertiajs/react";
import { Calendar, Eye, MapPin, User } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Region {
    id: number;
    name: string;
}

interface Author {
    id: number;
    name: string;
}

interface Workspace {
    id: number;
    name: string;
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
    view_count: number;
    published_at: string | null;
    author: Author | null;
    workspace: Workspace | null;
    regions: Region[];
}

interface Ad {
    id: number;
    placement: string;
    advertable: {
        id: number;
        title: string;
        excerpt: string | null;
        featured_image: string | null;
        slug: string;
    };
    expires_at: string;
}

interface RelatedPost {
    id: number;
    type: string;
    category: string | null;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image: string | null;
    view_count: number;
    published_at: string;
    author: Author | null;
    workspace: Workspace | null;
    regions: Region[];
}

interface ShowPostProps {
    auth?: Auth;
    post: Post;
    relatedPosts: RelatedPost[];
}

export default function ShowPost({ auth, post, relatedPosts }: ShowPostProps) {
    const [sidebarAds, setSidebarAds] = useState<Ad[]>([]);
    const [bannerAds, setBannerAds] = useState<Ad[]>([]);
    const [inlineAds, setInlineAds] = useState<Ad[]>([]);

    useEffect(() => {
        const regionId = post.regions[0]?.id;

        // Fetch sidebar ads
        fetch(`/api/advertisements?platform=day_news&placement=sidebar&region_id=${regionId}`)
            .then((res) => res.json())
            .then((data) => setSidebarAds(data.ads))
            .catch((err) => console.error("Failed to fetch sidebar ads:", err));

        // Fetch banner ads
        fetch(`/api/advertisements?platform=day_news&placement=banner&region_id=${regionId}`)
            .then((res) => res.json())
            .then((data) => setBannerAds(data.ads))
            .catch((err) => console.error("Failed to fetch banner ads:", err));

        // Fetch inline ads
        fetch(`/api/advertisements?platform=day_news&placement=inline&region_id=${regionId}`)
            .then((res) => res.json())
            .then((data) => setInlineAds(data.ads))
            .catch((err) => console.error("Failed to fetch inline ads:", err));
    }, [post.regions]);

    const handleAdImpression = (adId: number) => {
        fetch(`/api/advertisements/${adId}/impression`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
    };

    const handleAdClick = (adId: number) => {
        fetch(`/api/advertisements/${adId}/click`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title={`${post.title} - Day News`} />
                <DayNewsHeader auth={auth} />

                {/* Banner Ad */}
                {bannerAds.length > 0 && (
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        {bannerAds.map((ad) => (
                            <Advertisement key={ad.id} ad={ad} onImpression={handleAdImpression} onClick={handleAdClick} />
                        ))}
                    </div>
                )}

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main content */}
                        <article className="lg:col-span-2">
                            {/* Post header */}
                            <div className="mb-6">
                                <div className="mb-4 flex flex-wrap gap-2">
                                    <Badge className="capitalize">{post.type}</Badge>
                                    {post.category && (
                                        <Badge variant="outline" className="capitalize">
                                            {post.category.replace("_", " ")}
                                        </Badge>
                                    )}
                                    {post.regions.map((region) => (
                                        <Badge key={region.id} variant="secondary">
                                            <MapPin className="mr-1 size-3" />
                                            {region.name}
                                        </Badge>
                                    ))}
                                </div>

                                <h1 className="mb-4 text-4xl font-bold leading-tight">{post.title}</h1>

                                {post.excerpt && <p className="mb-4 text-xl text-muted-foreground">{post.excerpt}</p>}

                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    {post.author && (
                                        <div className="flex items-center gap-2">
                                            <User className="size-4" />
                                            <span>By {post.author.name}</span>
                                        </div>
                                    )}

                                    {post.workspace && (
                                        <div className="flex items-center gap-2">
                                            <span>via {post.workspace.name}</span>
                                        </div>
                                    )}

                                    {post.published_at && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="size-4" />
                                            <span>{new Date(post.published_at).toLocaleDateString()}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <Eye className="size-4" />
                                        <span>{post.view_count} views</span>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            {/* Featured image */}
                            {post.featured_image && (
                                <div className="mb-6 overflow-hidden rounded-lg">
                                    <img src={post.featured_image} alt={post.title} className="w-full" />
                                </div>
                            )}

                            {/* Content with inline ad */}
                            <div className="prose prose-lg max-w-none dark:prose-invert">
                                <p className="whitespace-pre-wrap">{post.content.slice(0, Math.floor(post.content.length / 2))}</p>
                            </div>

                            {/* Inline Ad in the middle of content */}
                            {inlineAds.length > 0 && (
                                <div className="my-8">
                                    {inlineAds.slice(0, 1).map((ad) => (
                                        <Advertisement key={ad.id} ad={ad} onImpression={handleAdImpression} onClick={handleAdClick} />
                                    ))}
                                </div>
                            )}

                            <div className="prose prose-lg max-w-none dark:prose-invert">
                                <p className="whitespace-pre-wrap">{post.content.slice(Math.floor(post.content.length / 2))}</p>
                            </div>
                        </article>

                        {/* Sidebar */}
                        <aside className="space-y-6">
                            {/* Related Posts */}
                            {relatedPosts.length > 0 && (
                                <div>
                                    <h2 className="mb-4 border-b-2 border-border pb-2 font-serif text-xl font-bold">More from this Region</h2>
                                    <div className="space-y-0">
                                        {relatedPosts.map((relatedPost) => (
                                            <NewsArticleCard key={relatedPost.id} article={relatedPost} compact />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sponsored */}
                            {sidebarAds.length > 0 && (
                                <div>
                                    <h2 className="mb-4 border-b-2 border-border pb-2 font-serif text-xl font-bold">Sponsored</h2>
                                    <div className="space-y-4">
                                        {sidebarAds.map((ad) => (
                                            <Advertisement key={ad.id} ad={ad} onImpression={handleAdImpression} onClick={handleAdClick} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </div>
        </LocationProvider>
    );
}
