import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, BadgeCheck, CalendarIcon, Globe, MapPin, NewspaperIcon, Phone, Star, StarIcon, StoreIcon, TagIcon } from "lucide-react";
import { BusinessDetail } from "@/components/shared/business/BusinessDetail";
import { BusinessList } from "@/components/shared/business/BusinessList";
import { EventList } from "@/components/shared/events/EventList";
import { NewsList } from "@/components/shared/news/NewsList";
import { ReviewList } from "@/components/shared/reviews/ReviewList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    const fullAddress = [business.address, business.city, business.state, business.postal_code].filter(Boolean).join(", ");

    return (
        <>
            <Head title={`${business.name} - DowntownsGuide`} />

            <div className="min-h-screen bg-background">
                <main className="container mx-auto px-4 py-8">
                    {/* Back link */}
                    <Link
                        href={route("downtown-guide.businesses.index")}
                        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Places
                    </Link>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Business Details */}
                            <Card>
                                <CardContent className="p-6">
                                    {/* Badges */}
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        {business.is_verified && (
                                            <Badge variant="default">
                                                <BadgeCheck className="mr-1 size-3" />
                                                Verified
                                            </Badge>
                                        )}
                                        {business.categories?.map((cat) => (
                                            <Badge key={cat} variant="secondary" className="capitalize">{cat}</Badge>
                                        ))}
                                    </div>
                                    <BusinessDetail business={business} theme="downtownsguide" showMap={true} />
                                </CardContent>
                            </Card>

                            {/* Contact & Location */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact & Location</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {fullAddress && (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">Address</p>
                                                <p className="text-muted-foreground">{fullAddress}</p>
                                            </div>
                                        </div>
                                    )}
                                    {business.phone && (
                                        <div className="flex items-start gap-3">
                                            <Phone className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">Phone</p>
                                                <a href={`tel:${business.phone}`} className="text-primary hover:underline">{business.phone}</a>
                                            </div>
                                        </div>
                                    )}
                                    {business.website && (
                                        <div className="flex items-start gap-3">
                                            <Globe className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">Website</p>
                                                <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                    Visit Website
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Tabs */}
                            <Tabs defaultValue="reviews" className="w-full">
                                <TabsList className="mb-6">
                                    <TabsTrigger value="reviews">
                                        <StarIcon className="mr-2 h-4 w-4" />
                                        Reviews ({reviews.data.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="deals">
                                        <TagIcon className="mr-2 h-4 w-4" />
                                        Deals ({activeCoupons.length + deals.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="events">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        Events ({upcomingEvents.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="news">
                                        <NewspaperIcon className="mr-2 h-4 w-4" />
                                        News ({relatedArticles.length})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="reviews">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="font-display text-xl font-black tracking-tight">Customer Reviews</h2>
                                            {averageRating > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <Star className="size-5 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-lg font-semibold">{averageRating.toFixed(1)} / 5.0</span>
                                                </div>
                                            )}
                                        </div>
                                        <ReviewList reviews={reviews.data} theme="downtownsguide" showHelpful={true} />
                                    </div>
                                </TabsContent>

                                <TabsContent value="deals">
                                    <div className="space-y-4">
                                        <h2 className="font-display text-xl font-black tracking-tight">Active Deals & Coupons</h2>
                                        {deals.length > 0 || activeCoupons.length > 0 ? (
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                {deals.map((deal) => (
                                                    <Card key={deal.id} className="transition-shadow hover:shadow-md">
                                                        <CardContent className="p-4">
                                                            <h3 className="font-semibold">{deal.title}</h3>
                                                            {deal.description && <p className="mt-1 text-sm text-muted-foreground">{deal.description}</p>}
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                                {activeCoupons.map((coupon) => (
                                                    <Card key={coupon.id} className="transition-shadow hover:shadow-md">
                                                        <CardContent className="p-4">
                                                            <h3 className="font-semibold">{coupon.title}</h3>
                                                            {coupon.code && (
                                                                <Badge variant="secondary" className="mt-2 font-mono">Code: {coupon.code}</Badge>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <Card>
                                                <CardContent className="py-8 text-center">
                                                    <TagIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                                    <p className="mt-4 text-lg font-bold">No active deals</p>
                                                    <p className="mt-2 text-sm text-muted-foreground">Check back later for deals and coupons</p>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="events">
                                    <div className="space-y-4">
                                        <h2 className="font-display text-xl font-black tracking-tight">Upcoming Events</h2>
                                        {upcomingEvents.length > 0 ? (
                                            <EventList events={upcomingEvents} theme="downtownsguide" gridCols={2} />
                                        ) : (
                                            <Card>
                                                <CardContent className="py-8 text-center">
                                                    <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                                    <p className="mt-4 text-lg font-bold">No upcoming events</p>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="news">
                                    <div className="space-y-4">
                                        <h2 className="font-display text-xl font-black tracking-tight">News & Articles</h2>
                                        {relatedArticles.length > 0 ? (
                                            <NewsList articles={relatedArticles} theme="downtownsguide" gridCols={2} />
                                        ) : (
                                            <Card>
                                                <CardContent className="py-8 text-center">
                                                    <NewspaperIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                                    <p className="mt-4 text-lg font-bold">No articles found</p>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick actions */}
                            <Card>
                                <CardContent className="space-y-3 pt-6">
                                    {business.phone && (
                                        <Button asChild className="w-full">
                                            <a href={`tel:${business.phone}`}>
                                                <Phone className="mr-2 size-4" />
                                                Call Now
                                            </a>
                                        </Button>
                                    )}
                                    {business.website && (
                                        <Button asChild variant="outline" className="w-full">
                                            <a href={business.website} target="_blank" rel="noopener noreferrer">
                                                <Globe className="mr-2 size-4" />
                                                Visit Website
                                            </a>
                                        </Button>
                                    )}
                                    {fullAddress && (
                                        <Button asChild variant="outline" className="w-full">
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <MapPin className="mr-2 size-4" />
                                                Get Directions
                                            </a>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {business.rating !== undefined && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Rating</span>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-semibold">{Number(business.rating).toFixed(1)}</span>
                                            </div>
                                        </div>
                                    )}
                                    {business.reviews_count !== undefined && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Reviews</span>
                                            <span className="font-semibold">{business.reviews_count}</span>
                                        </div>
                                    )}
                                    {activeCoupons.length + deals.length > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Active Deals</span>
                                            <span className="font-semibold">{activeCoupons.length + deals.length}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Related Businesses */}
                            {relatedBusinesses.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Similar Places</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <BusinessList businesses={relatedBusinesses} theme="downtownsguide" gridCols={1} />
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
