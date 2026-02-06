import { Link } from "@inertiajs/react";
import { CalendarIcon, EyeIcon, Share2Icon, UserIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sanitizeHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

interface NewsDetailProps {
    article: {
        id: string;
        title: string;
        content: string;
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
        tags?: Array<{ id: string; name: string; slug: string }>;
    };
    theme?: "daynews" | "downtownsguide" | "eventcity";
    className?: string;
    showShare?: boolean;
}

export function NewsDetail({ article, theme = "daynews", className, showShare = true }: NewsDetailProps) {
    const [shareSuccess, setShareSuccess] = useState(false);

    // Use semantic tokens - consistent across themes

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: article.title,
                    text: article.title,
                    url: window.location.href,
                });
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 2000);
            } catch (_error) {
                // User cancelled or error
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 2000);
        }
    };

    return (
        <article className={cn("space-y-6", className)}>
            {/* Header */}
            <header className="space-y-4">
                {article.category && <Badge variant="secondary">{article.category}</Badge>}

                <h1 className="text-3xl font-bold text-foreground md:text-4xl">{article.title}</h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {article.author && (
                        <div className="flex items-center gap-2">
                            {article.author.avatar ? (
                                <img src={article.author.avatar} alt={article.author.name} className="h-8 w-8 rounded-full" />
                            ) : (
                                <UserIcon className="h-5 w-5" />
                            )}
                            <Link href={`/authors/${article.author.id}`} className="hover:text-foreground">
                                {article.author.name}
                            </Link>
                        </div>
                    )}

                    {article.published_at && (
                        <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            <time dateTime={article.published_at}>
                                {new Date(article.published_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </time>
                        </div>
                    )}

                    {article.view_count !== undefined && (
                        <div className="flex items-center gap-1">
                            <EyeIcon className="h-4 w-4" />
                            <span>{article.view_count.toLocaleString()} views</span>
                        </div>
                    )}

                    {showShare && (
                        <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto" title="Share article">
                            <Share2Icon className="h-4 w-4" />
                            {shareSuccess ? "Copied!" : "Share"}
                        </Button>
                    )}
                </div>
            </header>

            {/* Featured Image */}
            {article.featured_image && (
                <div className="aspect-video w-full overflow-hidden rounded-lg">
                    <img src={article.featured_image} alt={article.title} className="h-full w-full object-cover" />
                </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }} />

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4">
                    <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                    {article.tags.map((tag) => (
                        <Link key={tag.id} href={`/tags/${tag.slug}`} className="rounded-full bg-muted px-3 py-1 text-sm hover:bg-muted/80">
                            #{tag.name}
                        </Link>
                    ))}
                </div>
            )}
        </article>
    );
}
