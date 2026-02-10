import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReviewCard } from "./ReviewCard";

interface ReviewListProps {
    reviews: Array<{
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
    }>;
    theme?: "daynews" | "downtownsguide" | "eventcity";
    className?: string;
    showHelpful?: boolean;
    onHelpful?: (reviewId: string) => void;
}

export function ReviewList({ reviews, theme = "downtownsguide", className, showHelpful = true, onHelpful }: ReviewListProps) {
    if (reviews.length === 0) {
        return (
            <div className="rounded-xl border border-dashed p-12 text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                    <StarIcon className="size-6 text-muted-foreground" />
                </div>
                <p className="font-display font-black tracking-tight text-foreground">No reviews yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Be the first to share your experience</p>
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} theme={theme} showHelpful={showHelpful} onHelpful={onHelpful} />
            ))}
        </div>
    );
}
