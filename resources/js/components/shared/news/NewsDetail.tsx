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
            navigator.clipboard.writeText(window.location.href);
            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 2000);
        }
    };

    return (
        <article className={cn("space-y-8", className)}>
            {/* Header */}
            <header className="space-y-4">
                {article.category && (
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-widest font-black">
                        {article.category}
                    </Badge>
                )}

                <h1 className="font-display text-3xl font-black tracking-tight text-foreground md:text-4xl lg:text-5xl">{article.title}</h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {article.author && (
                        <div className="flex items-center gap-2">
                            {article.author.avatar ? (
                                <img src={article.author.avatar} alt={article.author.name} className="size-8 rounded-full" />
                            ) : (
                                <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                                    <UserIcon className="size-4 text-muted-foreground" />
                                </div>
                            )}
                            <Link href={`/authors/${article.author.id}`} className="font-medium hover:text-primary">
                                {article.author.name}
                            </Link>
                        </div>
                    )}

                    {article.published_at && (
                        <div className="flex items-center gap-1">
                            <CalendarIcon className="size-3.5 text-primary" />
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
                            <EyeIcon className="size-3.5 text-primary" />
                            <span>{article.view_count.toLocaleString()} views</span>
                        </div>
                    )}

                    {showShare && (
                        <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto rounded-lg" title="Share article">
                            <Share2Icon className="size-4" />
                            {shareSuccess ? "Copied!" : "Share"}
                        </Button>
                    )}
                </div>
            </header>

            {/* Featured Image */}
            {article.featured_image && (
                <div className="aspect-[21/9] w-full overflow-hidden rounded-xl">
                    <img src={article.featured_image} alt={article.title} className="h-full w-full object-cover" />
                </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }} />

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 border-t pt-6">
                    <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Tags:</span>
                    {article.tags.map((tag) => (
                        <Link
                            key={tag.id}
                            href={`/tags/${tag.slug}`}
                            className="rounded-full bg-muted px-3 py-1 text-sm transition-colors hover:bg-muted/80 hover:text-primary"
                        >
                            #{tag.name}
                        </Link>
                    ))}
                </div>
            )}
        </article>
    );
}
