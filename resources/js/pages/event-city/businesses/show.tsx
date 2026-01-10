import { Head, Link } from "@inertiajs/react";
import { BusinessDetail } from "@/components/shared/business/BusinessDetail";
import { ReviewList } from "@/components/shared/reviews/ReviewList";
import { EventList } from "@/components/shared/events/EventList";
import { BusinessList } from "@/components/shared/business/BusinessList";
import { CalendarIcon, MapPinIcon, StarIcon, ArrowLeftIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EventCityBusinessShowProps {
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
    upcomingEvents: Array<{
        id: string;
        title: string;
        description?: string;
        image?: string;
        event_date?: string;
        time?: string;
        venue?: {
            id: string;
            name: string;
        };
        category?: string;
        is_free?: boolean;
        price_min?: number;
        price_max?: number;
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
        events?: Array<{
            id: string;
            title: string;
            event_date?: string;
            slug?: string;
        }>;
        articles?: Array<{
            id: string;
            title: string;
            published_at?: string;
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

export default function EventCityBusinessShow({
    business,
    upcomingEvents,
    reviews,
    averageRating,
    organizationContent,
    relatedBusinesses,
}: EventCityBusinessShowProps) {
    const allEvents = [...upcomingEvents, ...(organizationContent?.events || [])];

    return (
        <>
            <Head title={`${business.name} - GoEventCity`} />

            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                {/* Header */}
                <div className="relative overflow-hidden border-b-4 border-indigo-600 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <Link
                            href={route("event-city.businesses.index")}
                            className="mb-4 inline-flex items-center gap-2 text-indigo-100 hover:text-white"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            <span>Back to Venue Directory</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-card/20 p-2 backdrop-blur-sm">
                                <CalendarIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Venue & Performer Profile</h1>
                                <p className="mt-1 text-sm text-indigo-100">Event venue information and upcoming shows</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Business Details */}
                            <div className="rounded-xl border-2 border bg-card p-6 shadow-lg">
                                <BusinessDetail business={business} theme="eventcity" showMap={true} />
                            </div>

                            {/* Tabs */}
                            <Tabs defaultValue="events" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 bg-accent/50">
                                    <TabsTrigger value="events" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        Upcoming Events ({allEvents.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="reviews" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                        <StarIcon className="mr-2 h-4 w-4" />
                                        Reviews ({reviews.data.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="related" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                        <MapPinIcon className="mr-2 h-4 w-4" />
                                        Related Venues
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="events" className="mt-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <SparklesIcon className="h-5 w-5 text-primary" />
                                            <h2 className="text-xl font-bold text-foreground">Upcoming Events at {business.name}</h2>
                                        </div>
                                        {allEvents.length > 0 ? (
                                            <EventList
                                                events={allEvents}
                                                theme="eventcity"
                                                gridCols={2}
                                                showDescription={true}
                                                showVenue={false}
                                                showPrice={true}
                                            />
                                        ) : (
                                            <div className="rounded-xl border-2 border-dashed border bg-gradient-to-br from-indigo-50 to-purple-50 p-8 text-center">
                                                <CalendarIcon className="mx-auto h-12 w-12 text-indigo-400" />
                                                <p className="mt-4 text-lg font-bold text-foreground">No upcoming events</p>
                                                <p className="mt-2 text-sm text-muted-foreground">Check back later for events at this venue</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="reviews" className="mt-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-bold text-foreground">Venue Reviews</h2>
                                            {averageRating > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <StarIcon className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-lg font-semibold">{averageRating.toFixed(1)} / 5.0</span>
                                                </div>
                                            )}
                                        </div>
                                        <ReviewList reviews={reviews.data} theme="eventcity" showHelpful={true} />
                                    </div>
                                </TabsContent>

                                <TabsContent value="related" className="mt-6">
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold text-foreground">Related Venues & Performers</h2>
                                        {relatedBusinesses.length > 0 ? (
                                            <BusinessList businesses={relatedBusinesses} theme="eventcity" gridCols={2} />
                                        ) : (
                                            <div className="rounded-xl border-2 border-dashed border bg-gradient-to-br from-indigo-50 to-purple-50 p-8 text-center">
                                                <MapPinIcon className="mx-auto h-12 w-12 text-indigo-400" />
                                                <p className="mt-4 text-lg font-bold text-foreground">No related venues</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <div className="rounded-xl border-2 border bg-card p-6 shadow-lg">
                                <h3 className="mb-4 text-lg font-bold text-foreground">Quick Stats</h3>
                                <div className="space-y-3">
                                    {business.rating !== undefined && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Rating</span>
                                            <div className="flex items-center gap-1">
                                                <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-semibold">{business.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    )}
                                    {business.reviews_count !== undefined && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Reviews</span>
                                            <span className="font-semibold">{business.reviews_count}</span>
                                        </div>
                                    )}
                                    {allEvents.length > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Upcoming Events</span>
                                            <span className="font-semibold">{allEvents.length}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact Info */}
                            {(business.phone || business.email || business.website) && (
                                <div className="rounded-xl border-2 border bg-card p-6 shadow-lg">
                                    <h3 className="mb-4 text-lg font-bold text-foreground">Contact</h3>
                                    <div className="space-y-2 text-sm">
                                        {business.phone && (
                                            <div>
                                                <span className="text-muted-foreground">Phone: </span>
                                                <a href={`tel:${business.phone}`} className="text-primary hover:underline">
                                                    {business.phone}
                                                </a>
                                            </div>
                                        )}
                                        {business.email && (
                                            <div>
                                                <span className="text-muted-foreground">Email: </span>
                                                <a href={`mailto:${business.email}`} className="text-primary hover:underline">
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
                                                    className="text-primary hover:underline"
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
