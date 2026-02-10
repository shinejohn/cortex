import React from "react";
import { AlertCircle, Bookmark, Heart, MessageSquare, Share2, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileArticleBarProps {
    commentCount: number;
    reactions: {
        helpful: number;
        love: number;
        surprising: number;
    };
    onReaction: (type: string) => void;
    onShare: () => void;
    onSave: () => void;
    isSaved?: boolean;
    className?: string;
}

export const MobileArticleBar = ({
    commentCount,
    reactions,
    onReaction,
    onShare,
    onSave,
    isSaved,
    className,
}: MobileArticleBarProps) => {
    return (
        <div
            className={cn(
                "fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur shadow-lg supports-[backdrop-filter]:bg-background/80 md:hidden",
                className,
            )}
        >
            <div className="flex items-center justify-between px-4 py-2">
                {/* Reactions */}
                <div className="flex items-center gap-4">
                    <button onClick={() => onReaction("helpful")} className="flex flex-col items-center gap-0.5">
                        <ThumbsUp className="size-5 text-muted-foreground" />
                        <span className="text-[10px] font-medium text-muted-foreground">{reactions?.helpful ?? 0}</span>
                    </button>
                    <button onClick={() => onReaction("love")} className="flex flex-col items-center gap-0.5">
                        <Heart className="size-5 text-muted-foreground" />
                        <span className="text-[10px] font-medium text-muted-foreground">{reactions?.love ?? 0}</span>
                    </button>
                    <button onClick={() => onReaction("surprising")} className="flex flex-col items-center gap-0.5">
                        <AlertCircle className="size-5 text-muted-foreground" />
                        <span className="text-[10px] font-medium text-muted-foreground">{reactions?.surprising ?? 0}</span>
                    </button>
                </div>

                {/* Divider */}
                <div className="mx-2 h-6 w-px bg-border" />

                {/* Comments */}
                <button
                    onClick={() => document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" })}
                    className="flex items-center gap-1"
                >
                    <MessageSquare className="size-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{commentCount}</span>
                </button>

                {/* Divider */}
                <div className="mx-2 h-6 w-px bg-border" />

                {/* Share */}
                <button className="p-2" onClick={onShare}>
                    <Share2 className="size-5 text-muted-foreground" />
                </button>

                {/* Divider */}
                <div className="mx-2 h-6 w-px bg-border" />

                {/* Save */}
                <button className="p-2" onClick={onSave}>
                    <Bookmark className={cn("size-5 text-muted-foreground", isSaved && "fill-primary text-primary")} />
                </button>
            </div>
        </div>
    );
};
