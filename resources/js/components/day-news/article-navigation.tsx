import React from "react";
import { Link } from "@inertiajs/react";
import { ArrowUp, List, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface RelatedStory {
    id: number;
    title: string;
    slug: string;
    featured_image?: string | null;
}

interface ArticleNavigationProps {
    commentCount: number;
    relatedStories?: RelatedStory[];
    className?: string;
}

export const ArticleNavigation = ({ commentCount, relatedStories, className }: ArticleNavigationProps) => {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const scrollToComments = () => {
        document.getElementById("comments")?.scrollIntoView({
            behavior: "smooth",
        });
    };

    return (
        <div className={cn("sticky top-32 space-y-6", className)}>
            {/* In This Article */}
            <div className="overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
                <h3 className="mb-3 font-display text-sm font-black uppercase tracking-widest text-foreground">In This Article</h3>
                <ul className="space-y-2 text-sm">
                    <li>
                        <button
                            onClick={scrollToTop}
                            className="text-primary transition-colors hover:underline"
                        >
                            Top of Article
                        </button>
                    </li>
                </ul>
            </div>

            {/* Related Stories */}
            <div className="overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
                <h3 className="mb-3 font-display text-sm font-black uppercase tracking-widest text-foreground">Related Stories</h3>
                <ul className="space-y-3 text-sm">
                    {relatedStories && relatedStories.length > 0 ? (
                        relatedStories.slice(0, 5).map((story) => (
                            <li key={story.id}>
                                <Link
                                    href={`/posts/${story.slug}`}
                                    className="group flex items-start gap-2 text-muted-foreground transition-colors hover:text-primary"
                                >
                                    {story.featured_image && (
                                        <img
                                            src={story.featured_image}
                                            alt=""
                                            className="mt-0.5 size-8 shrink-0 rounded object-cover"
                                        />
                                    )}
                                    <span className="line-clamp-2 leading-snug group-hover:underline">
                                        {story.title}
                                    </span>
                                </Link>
                            </li>
                        ))
                    ) : (
                        <li className="italic text-muted-foreground">No related stories available.</li>
                    )}
                </ul>
            </div>

            {/* Quick Jump */}
            <div className="overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
                <h3 className="mb-3 font-display text-sm font-black uppercase tracking-widest text-foreground">Quick Jump</h3>
                <div className="space-y-1">
                    <button
                        onClick={scrollToTop}
                        className="flex w-full items-center gap-2 rounded-md p-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        <ArrowUp className="size-4" />
                        <span>Top of Article</span>
                    </button>
                    <button className="flex w-full items-center gap-2 rounded-md p-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                        <List className="size-4" />
                        <span>Key Points</span>
                    </button>
                    <button
                        onClick={scrollToComments}
                        className="flex w-full items-center justify-between rounded-md p-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        <span className="flex items-center gap-2">
                            <MessageSquare className="size-4" />
                            <span>Comments</span>
                        </span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{commentCount}</span>
                    </button>
                </div>
            </div>

            {/* Reading Tools */}
            <div className="overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
                <h3 className="mb-3 font-display text-sm font-black uppercase tracking-widest text-foreground">Reading Tools</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                    <p>Adjust font size and theme in your profile settings.</p>
                </div>
            </div>
        </div>
    );
};
