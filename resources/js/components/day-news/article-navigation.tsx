import React from "react";
import { ArrowUp, List, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArticleNavigationProps {
    commentCount: number;
    className?: string;
}

export const ArticleNavigation = ({ commentCount, className }: ArticleNavigationProps) => {
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
            <div className="rounded-lg border bg-card p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick Jump</h3>
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

            <div className="rounded-lg border bg-card p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Reading Tools</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                    <p>Adjust font size and theme in your profile settings.</p>
                </div>
            </div>
        </div>
    );
};
