import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { router, usePage } from "@inertiajs/react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

interface Props {
    couponId: number;
    score: number;
    upvotesCount: number;
    downvotesCount: number;
    userVote?: "up" | "down";
    size?: "sm" | "default";
    showCounts?: boolean;
}

export function CouponVoteButtons({
    couponId,
    score,
    upvotesCount,
    downvotesCount,
    userVote: initialVote,
    size = "default",
    showCounts = true,
}: Props) {
    const [vote, setVote] = useState<"up" | "down" | undefined>(initialVote);
    const [currentScore, setCurrentScore] = useState(score);
    const [currentUpvotes, setCurrentUpvotes] = useState(upvotesCount);
    const [currentDownvotes, setCurrentDownvotes] = useState(downvotesCount);
    const [loading, setLoading] = useState(false);
    const { auth } = usePage().props as { auth?: { user?: { id: number } } };

    const handleVote = (type: "up" | "down") => {
        if (!auth?.user) {
            router.get(route("login"));
            return;
        }

        if (loading) return;
        setLoading(true);

        const newVote = vote === type ? undefined : type;
        setVote(newVote);

        // Optimistic update
        let scoreChange = 0;
        if (vote === "up") scoreChange -= 1;
        if (vote === "down") scoreChange += 1;
        if (newVote === "up") scoreChange += 1;
        if (newVote === "down") scoreChange -= 1;
        setCurrentScore(currentScore + scoreChange);

        router.post(
            route("daynews.coupons.vote", couponId),
            { type: newVote },
            {
                preserveScroll: true,
                onFinish: () => setLoading(false),
                onError: () => {
                    setVote(vote);
                    setCurrentScore(currentScore);
                },
            },
        );
    };

    const iconSize = size === "sm" ? "size-3" : "size-4";
    const buttonSize = size === "sm" ? "h-7 px-2" : "h-8 px-3";

    return (
        <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    buttonSize,
                    "gap-1",
                    vote === "up" && "text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700",
                )}
                onClick={() => handleVote("up")}
                disabled={loading}
                title="Upvote"
            >
                <ThumbsUp className={iconSize} />
                {showCounts && <span className="text-xs">{currentUpvotes}</span>}
            </Button>
            <span
                className={cn(
                    "font-medium min-w-8 text-center",
                    size === "sm" ? "text-xs" : "text-sm",
                    currentScore > 0 && "text-green-600",
                    currentScore < 0 && "text-red-600",
                )}
            >
                {currentScore > 0 ? `+${currentScore}` : currentScore}
            </span>
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    buttonSize,
                    "gap-1",
                    vote === "down" && "text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700",
                )}
                onClick={() => handleVote("down")}
                disabled={loading}
                title="Downvote"
            >
                <ThumbsDown className={iconSize} />
                {showCounts && <span className="text-xs">{currentDownvotes}</span>}
            </Button>
        </div>
    );
}
