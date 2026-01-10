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
            <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground">No reviews yet</p>
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
