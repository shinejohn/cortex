import { Link } from "@inertiajs/react";
import { CalendarIcon, UserIcon } from "lucide-react";
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
    };
    theme?: "daynews" | "downtownsguide" | "eventcity";
    className?: string;
    showExcerpt?: boolean;
    showAuthor?: boolean;
    showDate?: boolean;
    showCategory?: boolean;
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
    const themeClasses = {
        daynews: "border-blue-200 hover:border-blue-300",
        downtownsguide: "border-purple-200 hover:border-purple-300",
        eventcity: "border-indigo-200 hover:border-indigo-300",
    };

    const categoryColors = {
        daynews: "bg-blue-100 text-blue-800",
        downtownsguide: "bg-purple-100 text-purple-800",
        eventcity: "bg-indigo-100 text-indigo-800",
    };

    const href = article.slug ? `/posts/${article.slug}` : `/posts/${article.id}`;

    return (
        <Link href={href} className={cn("block rounded-lg border bg-card p-4 transition-all hover:shadow-md", themeClasses[theme], className)}>
            {article.featured_image && (
                <div className="mb-4 aspect-video w-full overflow-hidden rounded-md">
                    <img src={article.featured_image} alt={article.title} className="h-full w-full object-cover" />
                </div>
            )}

            <div className="space-y-2">
                {showCategory && article.category && (
                    <span className={cn("inline-block rounded-full px-2 py-1 text-xs font-medium", categoryColors[theme])}>{article.category}</span>
                )}

                <h3 className="line-clamp-2 text-lg font-semibold text-foreground">{article.title}</h3>

                {showExcerpt && article.excerpt && <p className="line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {showAuthor && article.author && (
                        <div className="flex items-center gap-1">
                            <UserIcon className="h-3 w-3" />
                            <span>{article.author.name}</span>
                        </div>
                    )}

                    {showDate && article.published_at && (
                        <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{new Date(article.published_at).toLocaleDateString()}</span>
                        </div>
                    )}

                    {article.view_count !== undefined && <span>{article.view_count.toLocaleString()} views</span>}
                </div>
            </div>
        </Link>
    );
}
