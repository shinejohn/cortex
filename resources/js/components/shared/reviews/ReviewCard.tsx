import { StarIcon, ThumbsUpIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
    review: {
        id: string;
        title?: string;
        content: string;
        rating: number;
        user?: {
            id: string;
            name: string;
            avatar?: string;
        };
        created_at?: string;
        helpful_count?: number;
        is_featured?: boolean;
        is_verified?: boolean;
    };
    theme?: "daynews" | "downtownsguide" | "eventcity";
    className?: string;
    showHelpful?: boolean;
    onHelpful?: (reviewId: string) => void;
}

function getTimeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
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

export function ReviewCard({ review, theme = "downtownsguide", className, showHelpful = true, onHelpful }: ReviewCardProps) {
    const [helpfulClicked, setHelpfulClicked] = useState(false);

    const handleHelpful = () => {
        if (!helpfulClicked) {
            setHelpfulClicked(true);
            onHelpful?.(review.id);
        }
    };

    return (
        <div className={cn(
            "overflow-hidden rounded-xl border-none bg-card p-5 shadow-sm",
            review.is_featured && "ring-1 ring-primary/20 bg-accent/30",
            className,
        )}>
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {review.user && (
                            <>
                                {review.user.avatar ? (
                                    <img src={review.user.avatar} alt={review.user.name} className="size-10 rounded-full" />
                                ) : (
                                    <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                                        <UserIcon className="size-5 text-muted-foreground" />
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <p className="font-medium text-foreground">{review.user.name}</p>
                                        {review.is_verified && (
                                            <span className="text-[10px] text-primary font-black" title="Verified Review">
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    {review.created_at && (
                                        <p className="text-xs text-muted-foreground">{getTimeAgo(review.created_at)}</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Rating Stars */}
                    <div className="flex items-center gap-1">
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon
                                    key={star}
                                    className={cn(
                                        "size-4",
                                        star <= review.rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted",
                                    )}
                                />
                            ))}
                        </div>
                        {review.is_featured && (
                            <Badge variant="secondary" className="ml-2 rounded-full text-[10px] uppercase tracking-widest font-black">
                                Featured
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Title */}
                {review.title && <h4 className="font-display font-black tracking-tight text-foreground">{review.title}</h4>}

                {/* Content */}
                <p className="text-sm leading-relaxed text-muted-foreground">{review.content}</p>

                {/* Helpful Button */}
                {showHelpful && (
                    <div className="flex items-center">
                        <Button
                            onClick={handleHelpful}
                            disabled={helpfulClicked}
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 rounded-lg px-3 text-muted-foreground"
                        >
                            <ThumbsUpIcon className={cn("size-4", helpfulClicked && "fill-primary text-primary")} />
                            <span>Helpful ({review.helpful_count ?? 0})</span>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
