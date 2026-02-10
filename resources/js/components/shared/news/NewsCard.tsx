import { Link } from "@inertiajs/react";
import { CalendarIcon, ClockIcon, UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NewsCardProps {
    article: {
        id: string;
        title: string;
        excerpt?: string;
        featured_image?: string;
        published_at?: string;
        author?: {
            id: string;
            name: string;
            avatar?: string;
        };
        category?: string;
        view_count?: number;
        slug?: string;
        regions?: Array<{ id: string; name: string }>;
    };
    theme?: "daynews" | "downtownsguide" | "eventcity";
    className?: string;
    showExcerpt?: boolean;
    showAuthor?: boolean;
    showDate?: boolean;
    showCategory?: boolean;
}

function getTimeAgo(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals: Record<string, number> = {
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

export function NewsCard({
    article,
    theme = "daynews",
    className,
    showExcerpt = true,
    showAuthor = true,
    showDate = true,
    showCategory = true,
}: NewsCardProps) {
    const href = article.slug ? `/posts/${article.slug}` : `/posts/${article.id}`;
    const timeAgo = article.published_at ? getTimeAgo(new Date(article.published_at)) : null;

    return (
        <Link
            href={href}
            className={cn(
                "group block overflow-hidden rounded-xl border-none bg-card shadow-sm transition-all hover:shadow-md",
                className,
            )}
        >
            {/* Image */}
            {article.featured_image && (
                <div className="aspect-[4/3] overflow-hidden">
                    <img
                        src={article.featured_image}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            )}

            <div className="p-4">
                {/* Category & Meta Badges */}
                <div className="mb-2 flex flex-wrap items-center gap-2">
                    {showCategory && article.category && (
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-widest font-black">
                            {article.category}
                        </Badge>
                    )}
                    {article.regions && article.regions.length > 0 && article.regions.map((region) => (
                        <Badge key={region.id} variant="outline" className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground">
                            {region.name}
                        </Badge>
                    ))}
                </div>

                {/* Title */}
                <h3 className="line-clamp-2 font-display text-lg font-black tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {article.title}
                </h3>

                {/* Excerpt */}
                {showExcerpt && article.excerpt && (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
                )}

                {/* Meta Row */}
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                        {showAuthor && article.author && (
                            <div className="flex items-center gap-1.5">
                                {article.author.avatar ? (
                                    <img src={article.author.avatar} alt={article.author.name} className="size-5 rounded-full" />
                                ) : (
                                    <UserIcon className="size-3.5 text-primary" />
                                )}
                                <span className="font-medium">{article.author.name}</span>
                            </div>
                        )}

                        {showDate && article.published_at && (
                            <span className="flex items-center gap-1">
                                <ClockIcon className="size-3.5 text-primary" />
                                {timeAgo}
                            </span>
                        )}
                    </div>

                    {article.view_count !== undefined && (
                        <span className="text-[10px]">{article.view_count.toLocaleString()} views</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
