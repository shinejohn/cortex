import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PerformerReview, RatingStats } from "@/types/performer-profile";

interface PerformerReviewsProps {
    reviews: PerformerReview[];
    ratingStats: RatingStats;
    performerId: string;
}

export function PerformerReviews({ reviews, ratingStats }: PerformerReviewsProps) {
    const renderStars = (rating: number) => {
        return [...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Overall Rating</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
                            <div className="text-5xl font-bold text-gray-900 mb-2">{ratingStats.average.toFixed(1)}</div>
                            <div className="flex mb-2">{renderStars(Math.round(ratingStats.average))}</div>
                            <div className="text-sm text-gray-600">Based on {ratingStats.total} reviews</div>
                        </div>

                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => {
                                const count = ratingStats.distribution[rating - 1] || 0;
                                const percentage = ratingStats.total > 0 ? (count / ratingStats.total) * 100 : 0;

                                return (
                                    <div key={rating} className="flex items-center gap-2">
                                        <span className="text-sm font-medium w-8">{rating}★</span>
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-yellow-400" style={{ width: `${percentage}%` }} />
                                        </div>
                                        <span className="text-sm text-gray-600 w-12 text-right">{percentage.toFixed(0)}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Performance</div>
                            <div className="text-lg font-bold">{ratingStats.by_context.performance.toFixed(1)}</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Professionalism</div>
                            <div className="text-lg font-bold">{ratingStats.by_context.professionalism.toFixed(1)}</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Value</div>
                            <div className="text-lg font-bold">{ratingStats.by_context.value.toFixed(1)}</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Overall</div>
                            <div className="text-lg font-bold">{ratingStats.by_context.overall.toFixed(1)}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {reviews.map((review) => (
                    <Card key={review.id}>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                    {review.user.avatar ? (
                                        <img src={review.user.avatar} alt={review.user.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-500 font-medium text-lg">
                                            {review.user.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{review.user.name}</h4>
                                            <span className="text-sm text-gray-500">
                                                {new Date(review.created_at).toLocaleDateString("en-US", {
                                                    month: "long",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex">{renderStars(review.rating)}</div>
                                    </div>
                                    <p className="text-gray-700">{review.content}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {reviews.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                        <p className="text-gray-500">Be the first to review this performer!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
