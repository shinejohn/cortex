import { Link } from "@inertiajs/react";
import { Clock, MapPin } from "lucide-react";
import React from "react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Region {
    id: string;
    name: string;
    slug: string;
    type: string;
}

interface Author {
    id: string;
    name: string;
}

interface Workspace {
    id: number;
    name: string;
}

interface NewsArticle {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image: string | null;
    published_at: string;
    view_count: number;
    author: Author | null;
    regions: Region[];
    type?: string;
    category?: string | null;
    workspace?: Workspace | null;
}

interface NewsArticleCardProps {
    article: NewsArticle;
    featured?: boolean;
    compact?: boolean;
    isSponsored?: boolean;
}

export default function NewsArticleCard({ article, featured = false, compact = false, isSponsored = false }: NewsArticleCardProps) {
    const publishedDate = new Date(article.published_at);
    const timeAgo = getTimeAgo(publishedDate);

    // All articles now use the same route
    const articleUrl = route("daynews.posts.show", { slug: article.slug });

    if (compact) {
        return (
            <Link href={articleUrl}>
                <article className="group cursor-pointer border-b py-4 transition-colors hover:bg-accent/50">
                    <div className="flex gap-3">
                        {article.featured_image && (
                            <div className="size-20 flex-shrink-0 overflow-hidden rounded-md">
                                <img
                                    src={article.featured_image}
                                    alt={article.title}
                                    className="size-full object-cover transition-transform group-hover:scale-105"
                                />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            {isSponsored && (
                                <Badge variant="outline" className="mb-1 text-xs">
                                    Sponsored
                                </Badge>
                            )}
                            <h3 className="mb-1 line-clamp-2 text-sm font-semibold leading-tight transition-colors group-hover:text-primary">
                                {article.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Clock className="size-3" />
                                    {timeAgo}
                                </span>
                                {article.regions.length > 0 && (
                                    <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="size-3" />
                                            {article.regions[0].name}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </article>
            </Link>
        );
    }

    if (featured) {
        return (
            <Link href={articleUrl}>
                <Card className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg p-0 gap-0">
                    {article.featured_image && (
                        <div className="aspect-[21/9] overflow-hidden">
                            <img
                                src={article.featured_image}
                                alt={article.title}
                                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                    )}
                    <CardHeader className="pt-6">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            {isSponsored && (
                                <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                                    Sponsored
                                </Badge>
                            )}
                            {article.regions.map((region) => (
                                <Badge key={region.id} variant="secondary">
                                    <MapPin />
                                    {region.name}
                                </Badge>
                            ))}
                        </div>
                        <CardTitle className="text-2xl transition-colors group-hover:text-primary">{article.title}</CardTitle>
                        {article.excerpt && <CardDescription className="text-base line-clamp-3">{article.excerpt}</CardDescription>}
                    </CardHeader>
                    <CardContent className="pb-6">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-3">
                                {article.author && <span className="font-medium">By {article.author.name}</span>}
                                {article.workspace && !article.author && <span className="font-medium">By {article.workspace.name}</span>}
                                <span className="flex items-center gap-1">
                                    <Clock className="size-4" />
                                    {timeAgo}
                                </span>
                            </div>
                            <span className="text-xs">{article.view_count} views</span>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        );
    }

    return (
        <Link href={articleUrl}>
            <Card className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-md p-0 gap-0">
                {article.featured_image && (
                    <div className="aspect-[4/3] overflow-hidden">
                        <img
                            src={article.featured_image}
                            alt={article.title}
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                )}
                <CardHeader className="pt-6">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        {isSponsored && (
                            <Badge variant="outline" className="text-xs">
                                Sponsored
                            </Badge>
                        )}
                        {article.regions.slice(0, 2).map((region) => (
                            <Badge key={region.id} variant="secondary">
                                <MapPin />
                                {region.name}
                            </Badge>
                        ))}
                    </div>
                    <CardTitle className="line-clamp-2 text-lg transition-colors group-hover:text-primary">{article.title}</CardTitle>
                    {article.excerpt && <CardDescription className="line-clamp-2">{article.excerpt}</CardDescription>}
                </CardHeader>
                <CardContent className="pb-6">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {timeAgo}
                        </span>
                        {article.author && <span>By {article.author.name}</span>}
                        {article.workspace && !article.author && <span>By {article.workspace.name}</span>}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function getTimeAgo(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
        }
    }

    return "Just now";
}
