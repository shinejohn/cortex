import { StarIcon, ThumbsUpIcon, UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

export function ReviewCard({
    review,
    theme = "downtownsguide",
    className,
    showHelpful = true,
    onHelpful,
}: ReviewCardProps) {
    const [helpfulClicked, setHelpfulClicked] = useState(false);

    const themeColors = {
        daynews: {
            featured: "border-blue-200 bg-blue-50",
        },
        downtownsguide: {
            featured: "border-purple-200 bg-purple-50",
        },
        eventcity: {
            featured: "border-indigo-200 bg-indigo-50",
        },
    };

    const handleHelpful = () => {
        if (!helpfulClicked) {
            setHelpfulClicked(true);
            onHelpful?.(review.id);
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, index) => (
            <StarIcon
                key={index}
                className={cn(
                    "h-4 w-4",
                    index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                )}
            />
        ));
    };

    return (
        <div
            className={cn(
                "rounded-lg border bg-card p-4",
                review.is_featured && themeColors[theme].featured,
                className
            )}
        >
            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        {review.user && (
                            <div className="flex items-center gap-2">
                                {review.user.avatar ? (
                                    <img
                                        src={review.user.avatar}
                                        alt={review.user.name}
                                        className="h-10 w-10 rounded-full"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-foreground">{review.user.name}</p>
                                    {review.created_at && (
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(review.created_at).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    )}
                                </div>
                                {review.is_verified && (
                                    <span className="text-xs text-blue-600" title="Verified Review">
                                        ✓
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Rating */}
                        <div className="mt-2 flex items-center gap-2">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <span className="text-sm font-medium text-foreground">
                                {review.rating.toFixed(1)}
                            </span>
                        </div>
                    </div>

                    {review.is_featured && (
                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                            Featured
                        </span>
                    )}
                </div>

                {/* Title */}
                {review.title && (
                    <h4 className="font-semibold text-foreground">{review.title}</h4>
                )}

                {/* Content */}
                <p className="text-sm text-muted-foreground">{review.content}</p>

                {/* Helpful Button */}
                {showHelpful && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleHelpful}
                            disabled={helpfulClicked}
                            className={cn(
                                "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors",
                                helpfulClicked
                                    ? "bg-green-100 text-green-700"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                        >
                            <ThumbsUpIcon className="h-3 w-3" />
                            <span>Helpful</span>
                            {review.helpful_count !== undefined && review.helpful_count > 0 && (
                                <span>({review.helpful_count})</span>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

