import { Head, Link, router } from "@inertiajs/react";
import { DayNewsBusinessCard } from "@/components/day-news/businesses/DayNewsBusinessCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SearchIcon, FilterIcon, NewspaperIcon } from "lucide-react";
import { useState } from "react";
import { Pagination } from "@/components/ui/pagination";

interface DayNewsBusinessesIndexProps {
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
        recent_articles_count: number;
        latest_article?: {
            id: string;
            title: string;
            published_at?: string;
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
    currentRegion?: {
        id: number;
        name: string;
    };
}

export default function DayNewsBusinessesIndex({ businesses, featuredBusinesses, filters, sort, currentRegion }: DayNewsBusinessesIndexProps) {
    const [search, setSearch] = useState(filters.search || "");
    const [category, setCategory] = useState(filters.category || "");
    const [verifiedOnly, setVerifiedOnly] = useState(filters.verified_only || false);

    const handleSearch = () => {
        router.get(
            route("businesses.index"),
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
            <Head title="Local Business Directory - Day News" />

            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
                {/* Header */}
                <div className="border-b-4 border-blue-600 bg-card shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <NewspaperIcon className="h-10 w-10 text-primary" />
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Local Business Directory</h1>
                                <p className="mt-1 text-lg text-muted-foreground">Discover local businesses and see what's happening in your community</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Featured Businesses */}
                    {featuredBusinesses.length > 0 && (
                        <section className="mb-12">
                            <h2 className="mb-4 text-2xl font-bold text-foreground">Featured Businesses with Recent News</h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {featuredBusinesses.map((item) => (
                                    <DayNewsBusinessCard
                                        key={item.business.id}
                                        business={item.business}
                                        recentArticlesCount={item.recent_articles_count}
                                        latestArticle={item.latest_article}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Filters */}
                    <div className="mb-6 rounded-lg border-2 border-primary/20 bg-card p-4 shadow-sm">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search businesses..."
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
                                    <SelectItem value="restaurant">Restaurants</SelectItem>
                                    <SelectItem value="retail">Retail</SelectItem>
                                    <SelectItem value="service">Services</SelectItem>
                                    <SelectItem value="entertainment">Entertainment</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="verified"
                                    checked={verifiedOnly}
                                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                                    className="h-4 w-4 rounded border text-primary"
                                />
                                <label htmlFor="verified" className="text-sm text-foreground">
                                    Verified only
                                </label>
                            </div>

                            <Button onClick={handleSearch} className="w-full bg-primary hover:bg-primary">
                                <FilterIcon className="mr-2 h-4 w-4" />
                                Apply Filters
                            </Button>
                        </div>
                    </div>

                    {/* Business List */}
                    <section>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-foreground">
                                {currentRegion ? `Businesses in ${currentRegion.name}` : "All Businesses"}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Sort by:</span>
                                <Select
                                    value={`${sort.sort}-${sort.direction}`}
                                    onValueChange={(value) => {
                                        const [sortBy, direction] = value.split("-");
                                        router.get(route("businesses.index"), { ...filters, sort: sortBy, direction }, { preserveState: true });
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
                            <div className="space-y-4">
                                {businesses.data.map((business) => (
                                    <DayNewsBusinessCard key={business.id} business={business} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border-2 border-dashed border-primary/20 bg-accent/50 p-12 text-center">
                                <NewspaperIcon className="mx-auto h-12 w-12 text-blue-400" />
                                <p className="mt-4 text-lg font-medium text-foreground">No businesses found</p>
                                <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filters</p>
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
