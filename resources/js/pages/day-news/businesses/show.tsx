import { Head, Link } from "@inertiajs/react";
import { ArrowLeftIcon, CheckCircle, Clock, Globe, Mail, MapPinIcon, NewspaperIcon, Phone, Share2, StarIcon } from "lucide-react";
import { BusinessDetail } from "@/components/shared/business/BusinessDetail";
import { BusinessList } from "@/components/shared/business/BusinessList";
import { NewsList } from "@/components/shared/news/NewsList";
import { ReviewList } from "@/components/shared/reviews/ReviewList";
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

            <div className="min-h-screen bg-[#F8F9FB]">
                {/* Hero Image */}
                {business.image && (
                    <div className="relative h-72 w-full overflow-hidden bg-zinc-200 md:h-96">
                        <img src={business.image} alt={business.name} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0">
                            <div className="container mx-auto px-4 pb-8 sm:px-6 lg:px-8">
                                <Link href={route("daynews.businesses.index") as any} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white transition-colors">
                                    <ArrowLeftIcon className="size-4" />
                                    BACK TO DIRECTORY
                                </Link>
                                <div className="flex items-center gap-3">
                                    <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-5xl">{business.name}</h1>
                                    {business.is_verified && (
                                        <CheckCircle className="size-6 text-blue-400" />
                                    )}
                                </div>
                                {business.categories && business.categories.length > 0 && (
                                    <div className="mt-3 flex gap-2">
                                        {business.categories.map((cat) => (
                                            <span key={cat} className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {!business.image && (
                    <div className="border-b bg-white">
                        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                            <Link href={route("daynews.businesses.index") as any} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                                <ArrowLeftIcon className="size-4" />
                                BACK TO DIRECTORY
                            </Link>
                            <div className="flex items-center gap-3">
                                <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">{business.name}</h1>
                                {business.is_verified && (
                                    <CheckCircle className="size-6 text-blue-500" />
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Business Details */}
                            <div className="overflow-hidden rounded-2xl border-none bg-white p-8 shadow-sm">
                                <BusinessDetail business={business} theme="daynews" showMap={true} />
                            </div>

                            {/* Tabs */}
                            <Tabs defaultValue="news" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 rounded-xl bg-zinc-100 p-1">
                                    <TabsTrigger value="news" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                        <NewspaperIcon className="mr-2 size-4" />
                                        News
                                    </TabsTrigger>
                                    <TabsTrigger value="reviews" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                        <StarIcon className="mr-2 size-4" />
                                        Reviews ({reviews.data.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="related" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                        <MapPinIcon className="mr-2 size-4" />
                                        Related
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="news" className="mt-6">
                                    <div className="space-y-4">
                                        <h2 className="font-display text-xl font-black tracking-tight">News & Articles About {business.name}</h2>
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
                                            <div className="rounded-3xl border-2 border-dashed p-16 text-center">
                                                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
                                                    <NewspaperIcon className="size-8 text-muted-foreground" />
                                                </div>
                                                <h3 className="mt-4 font-bold">No articles found</h3>
                                                <p className="mt-2 text-sm text-muted-foreground">Check back later for news about this business</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="reviews" className="mt-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="font-display text-xl font-black tracking-tight">Customer Reviews</h2>
                                            {averageRating > 0 && (
                                                <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2">
                                                    <StarIcon className="size-5 fill-amber-400 text-amber-400" />
                                                    <span className="text-lg font-black text-amber-700">{averageRating.toFixed(1)}</span>
                                                    <span className="text-sm text-amber-600">/ 5.0</span>
                                                </div>
                                            )}
                                        </div>
                                        <ReviewList reviews={reviews.data} theme="daynews" showHelpful={true} />
                                    </div>
                                </TabsContent>

                                <TabsContent value="related" className="mt-6">
                                    <div className="space-y-4">
                                        <h2 className="font-display text-xl font-black tracking-tight">Related Businesses</h2>
                                        {relatedBusinesses.length > 0 ? (
                                            <BusinessList businesses={relatedBusinesses} theme="daynews" gridCols={2} />
                                        ) : (
                                            <div className="rounded-3xl border-2 border-dashed p-16 text-center">
                                                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
                                                    <MapPinIcon className="size-8 text-muted-foreground" />
                                                </div>
                                                <h3 className="mt-4 font-bold">No related businesses</h3>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <div className="overflow-hidden rounded-2xl border-none bg-white p-6 shadow-sm">
                                <h3 className="mb-4 font-display text-lg font-black tracking-tight">Quick Stats</h3>
                                <div className="space-y-4">
                                    {business.rating !== undefined && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Rating</span>
                                            <div className="flex items-center gap-1.5">
                                                <StarIcon className="size-4 fill-amber-400 text-amber-400" />
                                                <span className="font-black">{business.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    )}
                                    {business.reviews_count !== undefined && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Reviews</span>
                                            <span className="font-black">{business.reviews_count}</span>
                                        </div>
                                    )}
                                    {relatedArticles.length > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Articles</span>
                                            <span className="font-black">{relatedArticles.length}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact Info */}
                            {(business.phone || business.email || business.website) && (
                                <div className="overflow-hidden rounded-2xl border-none bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 font-display text-lg font-black tracking-tight">Contact</h3>
                                    <div className="space-y-4">
                                        {business.phone && (
                                            <div className="flex items-start gap-3">
                                                <Phone className="mt-0.5 size-4 text-primary" />
                                                <a href={`tel:${business.phone}`} className="text-sm font-medium text-primary hover:underline">
                                                    {business.phone}
                                                </a>
                                            </div>
                                        )}
                                        {business.email && (
                                            <div className="flex items-start gap-3">
                                                <Mail className="mt-0.5 size-4 text-primary" />
                                                <a href={`mailto:${business.email}`} className="text-sm font-medium text-primary hover:underline">
                                                    {business.email}
                                                </a>
                                            </div>
                                        )}
                                        {business.website && (
                                            <div className="flex items-start gap-3">
                                                <Globe className="mt-0.5 size-4 text-primary" />
                                                <a
                                                    href={business.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-medium text-primary hover:underline"
                                                >
                                                    Visit Website
                                                </a>
                                            </div>
                                        )}
                                        {business.address && (
                                            <div className="flex items-start gap-3">
                                                <MapPinIcon className="mt-0.5 size-4 text-primary" />
                                                <span className="text-sm text-muted-foreground">
                                                    {business.address}{business.city ? `, ${business.city}` : ""}{business.state ? `, ${business.state}` : ""}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Opening Hours */}
                            {business.opening_hours && Object.keys(business.opening_hours).length > 0 && (
                                <div className="overflow-hidden rounded-2xl border-none bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 font-display text-lg font-black tracking-tight">
                                        <Clock className="mr-2 inline size-4" />
                                        Hours
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        {Object.entries(business.opening_hours).map(([day, hours]) => (
                                            <div key={day} className="flex items-center justify-between">
                                                <span className="font-medium capitalize">{day}</span>
                                                <span className="text-muted-foreground">{hours}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Share Button */}
                            <Button variant="outline" className="w-full gap-2 rounded-xl font-bold">
                                <Share2 className="size-4" />
                                Share this Business
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
