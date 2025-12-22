import { Head, Link } from "@inertiajs/react";
import { ReviewList } from "@/components/shared/reviews/ReviewList";
import { StarIcon, ArrowLeftIcon, FilterIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { router } from "@inertiajs/react";

interface DowntownGuideReviewsIndexProps {
    business: {
        id: string;
        name: string;
        slug?: string;
    };
    reviews: {
        data: Array<{
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
        }>;
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
    };
    averageRating: number;
    ratingDistribution: Record<number, number>;
    reviewCount: number;
    filters: {
        rating?: number;
        sort?: string;
    };
}

export default function DowntownGuideReviewsIndex({
    business,
    reviews,
    averageRating,
    ratingDistribution,
    reviewCount,
    filters,
}: DowntownGuideReviewsIndexProps) {
    const handleFilterChange = (key: string, value: string) => {
        router.get(
            route("downtown-guide.reviews.index", business.slug),
            { ...filters, [key]: value || undefined },
            { preserveState: true }
        );
    };

    return (
        <>
            <Head title={`Reviews for ${business.name} - DowntownsGuide`} />
            
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
                {/* Header */}
                <div className="border-b-4 border-purple-600 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <Link
                            href={route("downtown-guide.businesses.show", business.slug)}
                            className="mb-4 inline-flex items-center gap-2 text-purple-100 hover:text-white"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            <span>Back to Business</span>
                        </Link>
                        <h1 className="text-2xl font-bold text-white">
                            Reviews for {business.name}
                        </h1>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-4">
                        {/* Main Content */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Filters */}
                            <div className="rounded-xl border-2 border-purple-200 bg-white p-4 shadow-lg">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <FilterIcon className="h-4 w-4 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-700">Filter:</span>
                                    </div>
                                    <Select
                                        value={filters.rating?.toString() || "all"}
                                        onValueChange={(value) => handleFilterChange("rating", value)}
                                    >
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Ratings</SelectItem>
                                            <SelectItem value="5">5 Stars</SelectItem>
                                            <SelectItem value="4">4 Stars</SelectItem>
                                            <SelectItem value="3">3 Stars</SelectItem>
                                            <SelectItem value="2">2 Stars</SelectItem>
                                            <SelectItem value="1">1 Star</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={filters.sort || "newest"}
                                        onValueChange={(value) => handleFilterChange("sort", value)}
                                    >
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="newest">Newest First</SelectItem>
                                            <SelectItem value="oldest">Oldest First</SelectItem>
                                            <SelectItem value="highest">Highest Rated</SelectItem>
                                            <SelectItem value="lowest">Lowest Rated</SelectItem>
                                            <SelectItem value="helpful">Most Helpful</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Reviews */}
                            <ReviewList
                                reviews={reviews.data}
                                theme="downtownsguide"
                                showHelpful={true}
                            />

                            {/* Pagination */}
                            {reviews.last_page > 1 && (
                                <div className="flex justify-center">
                                    <div className="flex gap-2">
                                        {reviews.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    if (link.url) {
                                                        router.visit(link.url);
                                                    }
                                                }}
                                                disabled={!link.url || link.active}
                                                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                                                    link.active
                                                        ? "bg-purple-600 text-white"
                                                        : link.url
                                                        ? "bg-white text-gray-700 hover:bg-purple-50"
                                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Rating Summary */}
                            <div className="rounded-xl border-2 border-purple-200 bg-white p-6 shadow-lg">
                                <h3 className="mb-4 text-lg font-bold text-gray-900">Rating Summary</h3>
                                <div className="text-center">
                                    <div className="mb-2 text-4xl font-bold text-purple-600">
                                        {averageRating.toFixed(1)}
                                    </div>
                                    <div className="mb-4 flex items-center justify-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <StarIcon
                                                key={i}
                                                className={`h-5 w-5 ${
                                                    i < Math.floor(averageRating)
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-300"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Based on {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                                    </p>
                                </div>

                                {/* Rating Distribution */}
                                <div className="mt-6 space-y-2">
                                    {[5, 4, 3, 2, 1].map((rating) => {
                                        const count = ratingDistribution[rating] || 0;
                                        const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                                        return (
                                            <div key={rating} className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-medium">{rating}</span>
                                                    <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                                        <div
                                                            className="h-full bg-purple-600 transition-all"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-600">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Write Review CTA */}
                            <Link href={route("downtown-guide.reviews.create", business.slug)}>
                                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                                    Write a Review
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

