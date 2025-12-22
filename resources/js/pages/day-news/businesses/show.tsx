import { Head, Link } from "@inertiajs/react";
import { BusinessDetail } from "@/components/shared/business/BusinessDetail";
import { ReviewList } from "@/components/shared/reviews/ReviewList";
import { NewsList } from "@/components/shared/news/NewsList";
import { BusinessList } from "@/components/shared/business/BusinessList";
import { NewspaperIcon, MapPinIcon, StarIcon, ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DayNewsBusinessShowProps {
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
    relatedArticles: Array<{
        id: string;
        title: string;
        excerpt?: string;
        featured_image?: string;
        published_at?: string;
        author?: {
            id: string;
            name: string;
        };
        category?: string;
        slug?: string;
    }>;
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
    organizationContent?: {
        articles?: Array<{
            id: string;
            title: string;
            excerpt?: string;
            featured_image?: string;
            published_at?: string;
            slug?: string;
        }>;
        events?: Array<{
            id: string;
            title: string;
            event_date?: string;
            slug?: string;
        }>;
        coupons?: Array<{
            id: string;
            title: string;
            discount_value?: number;
            slug?: string;
        }>;
    };
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

export default function DayNewsBusinessShow({
    business,
    relatedArticles,
    reviews,
    averageRating,
    organizationContent,
    relatedBusinesses,
}: DayNewsBusinessShowProps) {
    return (
        <>
            <Head title={`${business.name} - Day News`} />
            
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
                {/* Header */}
                <div className="border-b-4 border-blue-600 bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <Link
                            href={route("businesses.index")}
                            className="mb-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            <span>Back to Business Directory</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <NewspaperIcon className="h-8 w-8 text-blue-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Business Profile
                                </h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Local business information and community news
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
                            <div className="rounded-lg border-2 border-blue-200 bg-white p-6 shadow-sm">
                                <BusinessDetail business={business} theme="daynews" showMap={true} />
                            </div>

                            {/* Tabs */}
                            <Tabs defaultValue="news" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 bg-blue-50">
                                    <TabsTrigger value="news" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                                        <NewspaperIcon className="mr-2 h-4 w-4" />
                                        News & Articles
                                    </TabsTrigger>
                                    <TabsTrigger value="reviews" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                                        <StarIcon className="mr-2 h-4 w-4" />
                                        Reviews ({reviews.data.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="related" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                                        <MapPinIcon className="mr-2 h-4 w-4" />
                                        Related
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="news" className="mt-6">
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold text-gray-900">
                                            News & Articles About {business.name}
                                        </h2>
                                        {relatedArticles.length > 0 || (organizationContent?.articles && organizationContent.articles.length > 0) ? (
                                            <NewsList
                                                articles={[...relatedArticles, ...(organizationContent?.articles || [])]}
                                                theme="daynews"
                                                gridCols={2}
                                                showExcerpt={true}
                                                showAuthor={true}
                                                showDate={true}
                                            />
                                        ) : (
                                            <div className="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50 p-8 text-center">
                                                <NewspaperIcon className="mx-auto h-12 w-12 text-blue-400" />
                                                <p className="mt-4 text-lg font-medium text-gray-900">No articles found</p>
                                                <p className="mt-2 text-sm text-gray-600">
                                                    Check back later for news about this business
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

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
                                            theme="daynews"
                                            showHelpful={true}
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="related" className="mt-6">
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Related Businesses
                                        </h2>
                                        {relatedBusinesses.length > 0 ? (
                                            <BusinessList
                                                businesses={relatedBusinesses}
                                                theme="daynews"
                                                gridCols={2}
                                            />
                                        ) : (
                                            <div className="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50 p-8 text-center">
                                                <MapPinIcon className="mx-auto h-12 w-12 text-blue-400" />
                                                <p className="mt-4 text-lg font-medium text-gray-900">No related businesses</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <div className="rounded-lg border-2 border-blue-200 bg-white p-6 shadow-sm">
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
                                    {relatedArticles.length > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Articles</span>
                                            <span className="font-semibold">{relatedArticles.length}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact Info */}
                            {(business.phone || business.email || business.website) && (
                                <div className="rounded-lg border-2 border-blue-200 bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 text-lg font-bold text-gray-900">Contact</h3>
                                    <div className="space-y-2 text-sm">
                                        {business.phone && (
                                            <div>
                                                <span className="text-gray-600">Phone: </span>
                                                <a href={`tel:${business.phone}`} className="text-blue-600 hover:underline">
                                                    {business.phone}
                                                </a>
                                            </div>
                                        )}
                                        {business.email && (
                                            <div>
                                                <span className="text-gray-600">Email: </span>
                                                <a href={`mailto:${business.email}`} className="text-blue-600 hover:underline">
                                                    {business.email}
                                                </a>
                                            </div>
                                        )}
                                        {business.website && (
                                            <div>
                                                <a
                                                    href={business.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    Visit Website
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

