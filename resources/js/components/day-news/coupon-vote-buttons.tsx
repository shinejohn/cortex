import { Button } from "@/components/ui/button";
import { router } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

interface Props {
    couponId: number;
    score: number;
    upvotesCount: number;
    downvotesCount: number;
    userVote?: 'up' | 'down';
}

export function CouponVoteButtons({ couponId, score, upvotesCount, downvotesCount, userVote: initialVote }: Props) {
    const [vote, setVote] = useState<'up' | 'down' | undefined>(initialVote);
    const [currentScore, setCurrentScore] = useState(score);
    const [loading, setLoading] = useState(false);
    const { auth } = usePage().props as any;

    const handleVote = (type: 'up' | 'down') => {
        if (!auth.user) {
            router.get(route('login'));
            return;
        }

        if (loading) return;
        setLoading(true);

        const newVote = vote === type ? undefined : type;
        setVote(newVote);

        // Optimistic update
        let scoreChange = 0;
        if (vote === 'up') scoreChange -= 1;
        if (vote === 'down') scoreChange += 1;
        if (newVote === 'up') scoreChange += 1;
        if (newVote === 'down') scoreChange -= 1;
        setCurrentScore(currentScore + scoreChange);

        router.post(
            route("daynews.coupons.vote", couponId),
            { type: newVote },
            {
                preserveScroll: true,
                onFinish: () => setLoading(false),
                onError: () => {
                    // Revert on error
                    setVote(vote);
                    setCurrentScore(currentScore);
                },
            }
        );
    };

    return (
        <div className="flex items-center gap-1 rounded-full border bg-background p-1">
            <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-full hover:bg-green-100 hover:text-green-600 ${vote === 'up' ? "bg-green-100 text-green-600" : "text-muted-foreground"
                    }`}
                onClick={() => handleVote('up')}
                disabled={loading}
                title="Upvote"
            >
                <ThumbsUp className={`h-4 w-4 ${vote === 'up' ? "fill-current" : ""}`} />
            </Button>

            <span className={`min-w-[2ch] text-center text-sm font-bold ${currentScore > 0 ? "text-green-600" : currentScore < 0 ? "text-red-600" : "text-muted-foreground"
                }`}>
                {currentScore}
            </span>

            <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-full hover:bg-red-100 hover:text-red-600 ${vote === 'down' ? "bg-red-100 text-red-600" : "text-muted-foreground"
                    }`}
                onClick={() => handleVote('down')}
                disabled={loading}
                title="Downvote"
            >
                <ThumbsDown className={`h-4 w-4 ${vote === 'down' ? "fill-current" : ""}`} />
            </Button>
        </div>
    );
}
