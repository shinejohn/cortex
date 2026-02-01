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
        <div className={cn("fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg md:hidden", className)}>
            <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-4">
                    <button onClick={() => onReaction("helpful")} className="flex flex-col items-center gap-0.5">
                        <ThumbsUp className="size-5 text-muted-foreground" />
                        <span className="text-[10px] font-medium text-muted-foreground">{reactions.helpful}</span>
                    </button>
                    <button onClick={() => onReaction("love")} className="flex flex-col items-center gap-0.5">
                        <Heart className="size-5 text-muted-foreground" />
                        <span className="text-[10px] font-medium text-muted-foreground">{reactions.love}</span>
                    </button>
                    <button onClick={() => onReaction("surprising")} className="flex flex-col items-center gap-0.5">
                        <AlertCircle className="size-5 text-muted-foreground" />
                        <span className="text-[10px] font-medium text-muted-foreground">{reactions.surprising}</span>
                    </button>
                </div>

                <div className="flex items-center gap-4 border-l pl-4">
                    <button
                        onClick={() => document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" })}
                        className="flex flex-col items-center gap-0.5"
                    >
                        <MessageSquare className="size-5 text-muted-foreground" />
                        <span className="text-[10px] font-medium text-muted-foreground">{commentCount}</span>
                    </button>
                    <button onClick={onShare} className="p-1">
                        <Share2 className="size-5 text-muted-foreground" />
                    </button>
                    <button onClick={onSave} className="p-1">
                        <Bookmark className={cn("size-5 text-muted-foreground", isSaved && "fill-primary text-primary")} />
                    </button>
                </div>
            </div>
        </div>
    );
};
