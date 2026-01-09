import { Head, Link, router } from "@inertiajs/react";
import { EventCityBusinessCard } from "@/components/event-city/businesses/EventCityBusinessCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SearchIcon, FilterIcon, CalendarIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import { Pagination } from "@/components/ui/pagination";

interface EventCityBusinessesIndexProps {
    businesses: {
        data: Array<{
            id: string;
            name: string;
            description?: string;
            image?: string;
            address?: string;
            city?: string;
            state?: string;
            rating?: number;
            reviews_count?: number;
            categories?: string[];
            slug?: string;
            is_verified?: boolean;
        }>;
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
    };
    featuredBusinesses: Array<{
        business: {
            id: string;
            name: string;
            description?: string;
            image?: string;
            address?: string;
            city?: string;
            state?: string;
            rating?: number;
            reviews_count?: number;
            categories?: string[];
            slug?: string;
            is_verified?: boolean;
        };
        upcoming_events_count: number;
        next_event?: {
            id: string;
            title: string;
            event_date?: string;
            time?: string;
            is_free?: boolean;
            price_min?: number;
            slug?: string;
        };
    }>;
    filters: {
        search?: string;
        category?: string;
        verified_only?: boolean;
    };
    sort: {
        sort: string;
        direction: string;
    };
}

export default function EventCityBusinessesIndex({ businesses, featuredBusinesses, filters, sort }: EventCityBusinessesIndexProps) {
    const [search, setSearch] = useState(filters.search || "");
    const [category, setCategory] = useState(filters.category || "");
    const [verifiedOnly, setVerifiedOnly] = useState(filters.verified_only || false);

    const handleSearch = () => {
        router.get(
            route("event-city.businesses.index"),
            {
                search: search || undefined,
                category: category || undefined,
                verified_only: verifiedOnly || undefined,
                sort: sort.sort,
                direction: sort.direction,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Event Venues & Performer Directory - GoEventCity" />

            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                {/* Header */}
                <div className="relative overflow-hidden border-b-4 border-indigo-600 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                                <CalendarIcon className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white">Event Venues & Performer Directory</h1>
                                <p className="mt-2 text-xl text-indigo-100">Find venues and performers for your next event</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Featured Businesses */}
                    {featuredBusinesses.length > 0 && (
                        <section className="mb-12">
                            <div className="mb-6 flex items-center gap-2">
                                <SparklesIcon className="h-6 w-6 text-indigo-600" />
                                <h2 className="text-3xl font-bold text-gray-900">Featured Venues with Upcoming Events</h2>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {featuredBusinesses.map((item) => (
                                    <EventCityBusinessCard
                                        key={item.business.id}
                                        business={item.business}
                                        upcomingEventsCount={item.upcoming_events_count}
                                        nextEvent={item.next_event}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Filters */}
                    <div className="mb-6 rounded-xl border-2 border-indigo-200 bg-white p-6 shadow-lg">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search venues & performers..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="pl-10"
                                />
                            </div>

                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Categories</SelectItem>
                                    <SelectItem value="venue">Venues</SelectItem>
                                    <SelectItem value="performer">Performers</SelectItem>
                                    <SelectItem value="catering">Catering</SelectItem>
                                    <SelectItem value="photography">Photography</SelectItem>
                                    <SelectItem value="entertainment">Entertainment</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="verified"
                                    checked={verifiedOnly}
                                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                                />
                                <label htmlFor="verified" className="text-sm font-medium text-gray-700">
                                    Verified only
                                </label>
                            </div>

                            <Button onClick={handleSearch} className="w-full bg-indigo-600 hover:bg-indigo-700">
                                <FilterIcon className="mr-2 h-4 w-4" />
                                Apply Filters
                            </Button>
                        </div>
                    </div>

                    {/* Business List */}
                    <section>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">All Venues & Performers</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Sort by:</span>
                                <Select
                                    value={`${sort.sort}-${sort.direction}`}
                                    onValueChange={(value) => {
                                        const [sortBy, direction] = value.split("-");
                                        router.get(
                                            route("event-city.businesses.index"),
                                            { ...filters, sort: sortBy, direction },
                                            { preserveState: true },
                                        );
                                    }}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                                        <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                                        <SelectItem value="rating-desc">Highest Rated</SelectItem>
                                        <SelectItem value="reviews-desc">Most Reviews</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {businesses.data.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {businesses.data.map((business) => (
                                    <EventCityBusinessCard key={business.id} business={business} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-12 text-center">
                                <CalendarIcon className="mx-auto h-16 w-16 text-indigo-400" />
                                <p className="mt-4 text-xl font-bold text-gray-900">No venues found</p>
                                <p className="mt-2 text-sm text-gray-600">Try adjusting your search or filters</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {businesses.last_page > 1 && (
                            <div className="mt-8">
                                <Pagination currentPage={businesses.current_page} lastPage={businesses.last_page} links={businesses.links} />
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}
