import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, Filter, Star } from "lucide-react";
import { ReviewList } from "@/components/shared/reviews/ReviewList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        router.get(route("downtown-guide.reviews.index", business.slug), { ...filters, [key]: value || undefined }, { preserveState: true });
    };

    return (
        <>
            <Head title={`Reviews for ${business.name} - DowntownsGuide`} />

            <div className="min-h-screen bg-background">
                <main className="container mx-auto px-4 py-8">
                    {/* Back link */}
                    <Link
                        href={route("downtown-guide.businesses.show", business.slug)}
                        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Back to {business.name}
                    </Link>

                    <h1 className="mb-8 font-display text-3xl font-black tracking-tight">Reviews for {business.name}</h1>

                    <div className="grid gap-8 lg:grid-cols-4">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-3">
                            {/* Filters */}
                            <div className="rounded-lg border bg-card p-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Filter:</span>
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
                                    <Select value={filters.sort || "newest"} onValueChange={(value) => handleFilterChange("sort", value)}>
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
                            <ReviewList reviews={reviews.data} theme="downtownsguide" showHelpful={true} />

                            {/* Pagination */}
                            {reviews.last_page > 1 && (
                                <div className="mt-8 flex items-center justify-center gap-2">
                                    {reviews.links.map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                if (link.url) {
                                                    router.visit(link.url);
                                                }
                                            }}
                                            disabled={!link.url || link.active}
                                            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                                link.active
                                                    ? "bg-primary text-primary-foreground"
                                                    : link.url
                                                      ? "bg-card text-foreground hover:bg-muted"
                                                      : "bg-muted text-muted-foreground cursor-not-allowed"
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Rating Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Rating Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center">
                                        <div className="mb-2 text-4xl font-bold text-primary">{averageRating.toFixed(1)}</div>
                                        <div className="mb-4 flex items-center justify-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <Star
                                                    key={i}
                                                    className={`size-5 ${
                                                        i <= Math.floor(averageRating) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
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
                                                        <Star className="size-3 fill-yellow-400 text-yellow-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                            <div className="h-full bg-primary transition-all" style={{ width: `${percentage}%` }} />
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Write Review CTA */}
                            <Link href={route("downtown-guide.reviews.create", business.slug)}>
                                <Button className="w-full">Write a Review</Button>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
