import { Head, Link } from "@inertiajs/react";
import { BusinessDetail } from "@/components/shared/business/BusinessDetail";
import { ReviewList } from "@/components/shared/reviews/ReviewList";
import { EventList } from "@/components/shared/events/EventList";
import { NewsList } from "@/components/shared/news/NewsList";
import { BusinessList } from "@/components/shared/business/BusinessList";
import { StoreIcon, StarIcon, ArrowLeftIcon, TagIcon, CalendarIcon, NewspaperIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DowntownGuideBusinessShowProps {
    business: {
        id: string;
        name: string;
        description?: string;
        content?: string;
        image?: string;
        address?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        phone?: string;
        email?: string;
        website?: string;
        rating?: number;
        reviews_count?: number;
        categories?: string[];
        opening_hours?: Record<string, string>;
        slug?: string;
        is_verified?: boolean;
        latitude?: number;
        longitude?: number;
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
    };
    averageRating: number;
    ratingDistribution: Record<number, number>;
    activeCoupons: Array<{
        id: string;
        title: string;
        description?: string;
        discount_type: string;
        discount_value?: number;
        code?: string;
        slug?: string;
    }>;
    deals: Array<{
        id: string;
        title: string;
        description?: string;
        discount_type: string;
        discount_value?: number;
        slug?: string;
    }>;
    upcomingEvents: Array<{
        id: string;
        title: string;
        event_date?: string;
        slug?: string;
    }>;
    relatedArticles: Array<{
        id: string;
        title: string;
        excerpt?: string;
        featured_image?: string;
        published_at?: string;
        slug?: string;
    }>;
    relatedBusinesses: Array<{
        id: string;
        name: string;
        description?: string;
        image?: string;
        rating?: number;
        reviews_count?: number;
        slug?: string;
    }>;
}

export default function DowntownGuideBusinessShow({
    business,
    reviews,
    averageRating,
    ratingDistribution,
    activeCoupons,
    deals,
    upcomingEvents,
    relatedArticles,
    relatedBusinesses,
}: DowntownGuideBusinessShowProps) {
    return (
        <>
            <Head title={`${business.name} - DowntownsGuide`} />
            
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
                {/* Header */}
                <div className="relative overflow-hidden border-b-4 border-purple-600 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 shadow-xl">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <Link
                            href={route("downtown-guide.businesses.index")}
                            className="mb-4 inline-flex items-center gap-2 text-purple-100 hover:text-white"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            <span>Back to Business Directory</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm">
                                <StoreIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    Business Profile
                                </h1>
                                <p className="mt-1 text-sm text-purple-100">
                                    Complete business information, reviews, deals, and more
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Business Details */}
                            <div className="rounded-xl border-2 border-purple-200 bg-white p-6 shadow-lg">
                                <BusinessDetail business={business} theme="downtownsguide" showMap={true} />
                            </div>

                            {/* Tabs */}
                            <Tabs defaultValue="reviews" className="w-full">
                                <TabsList className="grid w-full grid-cols-4 bg-purple-50">
                                    <TabsTrigger value="reviews" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                                        <StarIcon className="mr-2 h-4 w-4" />
                                        Reviews ({reviews.data.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="deals" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                                        <TagIcon className="mr-2 h-4 w-4" />
                                        Deals & Coupons ({activeCoupons.length + deals.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="events" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        Events ({upcomingEvents.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="news" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                                        <NewspaperIcon className="mr-2 h-4 w-4" />
                                        News ({relatedArticles.length})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="reviews" className="mt-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-bold text-gray-900">
                                                Customer Reviews
                                            </h2>
                                            {averageRating > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <StarIcon className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-lg font-semibold">
                                                        {averageRating.toFixed(1)} / 5.0
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <ReviewList
                                            reviews={reviews.data}
                                            theme="downtownsguide"
                                            showHelpful={true}
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="deals" className="mt-6">
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Active Deals & Coupons
                                        </h2>
                                        {(deals.length > 0 || activeCoupons.length > 0) ? (
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {deals.map((deal) => (
                                                    <div
                                                        key={deal.id}
                                                        className="rounded-lg border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4"
                                                    >
                                                        <h3 className="font-bold text-purple-900">{deal.title}</h3>
                                                        {deal.description && (
                                                            <p className="mt-1 text-sm text-gray-700">{deal.description}</p>
                                                        )}
                                                    </div>
                                                ))}
                                                {activeCoupons.map((coupon) => (
                                                    <div
                                                        key={coupon.id}
                                                        className="rounded-lg border-2 border-purple-200 bg-white p-4"
                                                    >
                                                        <h3 className="font-bold text-purple-900">{coupon.title}</h3>
                                                        {coupon.code && (
                                                            <p className="mt-1 text-sm font-mono text-purple-600">
                                                                Code: {coupon.code}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-8 text-center">
                                                <TagIcon className="mx-auto h-12 w-12 text-purple-400" />
                                                <p className="mt-4 text-lg font-bold text-gray-900">No active deals</p>
                                                <p className="mt-2 text-sm text-gray-600">
                                                    Check back later for deals and coupons
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="events" className="mt-6">
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Upcoming Events
                                        </h2>
                                        {upcomingEvents.length > 0 ? (
                                            <EventList
                                                events={upcomingEvents}
                                                theme="downtownsguide"
                                                gridCols={2}
                                            />
                                        ) : (
                                            <div className="rounded-xl border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-8 text-center">
                                                <CalendarIcon className="mx-auto h-12 w-12 text-purple-400" />
                                                <p className="mt-4 text-lg font-bold text-gray-900">No upcoming events</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="news" className="mt-6">
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold text-gray-900">
                                            News & Articles
                                        </h2>
                                        {relatedArticles.length > 0 ? (
                                            <NewsList
                                                articles={relatedArticles}
                                                theme="downtownsguide"
                                                gridCols={2}
                                            />
                                        ) : (
                                            <div className="rounded-xl border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-8 text-center">
                                                <NewspaperIcon className="mx-auto h-12 w-12 text-purple-400" />
                                                <p className="mt-4 text-lg font-bold text-gray-900">No articles found</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <div className="rounded-xl border-2 border-purple-200 bg-white p-6 shadow-lg">
                                <h3 className="mb-4 text-lg font-bold text-gray-900">Quick Stats</h3>
                                <div className="space-y-3">
                                    {business.rating !== undefined && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Rating</span>
                                            <div className="flex items-center gap-1">
                                                <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-semibold">{business.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    )}
                                    {business.reviews_count !== undefined && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Reviews</span>
                                            <span className="font-semibold">{business.reviews_count}</span>
                                        </div>
                                    )}
                                    {activeCoupons.length + deals.length > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Active Deals</span>
                                            <span className="font-semibold">{activeCoupons.length + deals.length}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Related Businesses */}
                            {relatedBusinesses.length > 0 && (
                                <div className="rounded-xl border-2 border-purple-200 bg-white p-6 shadow-lg">
                                    <h3 className="mb-4 text-lg font-bold text-gray-900">Similar Businesses</h3>
                                    <BusinessList
                                        businesses={relatedBusinesses}
                                        theme="downtownsguide"
                                        gridCols={1}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

