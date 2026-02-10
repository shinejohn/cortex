import { Head, Link, router } from "@inertiajs/react";
import { Building2, FilterIcon, List, Map, MapPin, NewspaperIcon, SearchIcon, Star } from "lucide-react";
import { useState } from "react";
import { DayNewsBusinessCard } from "@/components/day-news/businesses/DayNewsBusinessCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    const [viewMode, setViewMode] = useState<"list" | "map">("list");

    const handleSearch = () => {
        router.get(
            route("daynews.businesses.index") as any,
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

            <div className="min-h-screen bg-[#F8F9FB]">
                {/* Hero Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600">
                    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="mb-3 flex items-center justify-center gap-2">
                                <Building2 className="size-5 text-white/80" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Local Directory</span>
                            </div>
                            <h1 className="font-display text-4xl font-black tracking-tight text-white md:text-5xl">
                                Business Directory
                            </h1>
                            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/80">
                                Support local &mdash; discover amazing businesses right in your neighborhood
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-indigo-700 py-6">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto flex max-w-2xl gap-3">
                            <div className="relative flex-1">
                                <SearchIcon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/50" />
                                <Input
                                    type="text"
                                    placeholder="Search businesses..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="h-12 border-none bg-white/10 pl-12 text-white placeholder:text-white/50 ring-1 ring-white/20 focus-visible:ring-2 focus-visible:ring-white"
                                />
                            </div>
                            <Button onClick={handleSearch} className="h-12 bg-white px-6 font-bold text-indigo-700 hover:bg-white/90">
                                Search
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Featured Businesses */}
                    {featuredBusinesses.length > 0 && (
                        <section className="mb-12">
                            <div className="mb-6">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Spotlight</span>
                                <h2 className="font-display text-2xl font-black tracking-tight">Featured Businesses with Recent News</h2>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                    <div className="mb-8 overflow-hidden rounded-2xl border-none bg-white p-6 shadow-sm">
                        <div className="grid gap-4 md:grid-cols-4">
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="h-11 border-none bg-zinc-50 ring-1 ring-zinc-200">
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

                            <div className="flex items-center gap-3 rounded-lg bg-zinc-50 px-4 ring-1 ring-zinc-200">
                                <input
                                    type="checkbox"
                                    id="verified"
                                    checked={verifiedOnly}
                                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                                    className="size-4 rounded border text-primary"
                                />
                                <label htmlFor="verified" className="text-sm font-medium text-foreground">
                                    Verified only
                                </label>
                            </div>

                            <Button onClick={handleSearch} className="h-11 bg-primary font-bold hover:bg-primary/90">
                                <FilterIcon className="mr-2 size-4" />
                                Apply Filters
                            </Button>

                            {/* View Toggle */}
                            <div className="flex items-center justify-end gap-1 rounded-lg bg-zinc-50 p-1 ring-1 ring-zinc-200">
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-all ${viewMode === "list" ? "bg-primary text-white shadow-sm" : "text-zinc-600 hover:text-zinc-900"}`}
                                >
                                    <List className="size-4" />
                                    List
                                </button>
                                <button
                                    onClick={() => setViewMode("map")}
                                    className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-all ${viewMode === "map" ? "bg-primary text-white shadow-sm" : "text-zinc-600 hover:text-zinc-900"}`}
                                >
                                    <Map className="size-4" />
                                    Map
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Business List */}
                    <section>
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="font-display text-xl font-black tracking-tight">
                                {currentRegion ? `Businesses in ${currentRegion.name}` : "All Businesses"}
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sort by</span>
                                <Select
                                    value={`${sort.sort}-${sort.direction}`}
                                    onValueChange={(value) => {
                                        const [sortBy, direction] = value.split("-");
                                        router.get(route("daynews.businesses.index") as any, { ...filters, sort: sortBy, direction }, { preserveState: true });
                                    }}
                                >
                                    <SelectTrigger className="w-44 border-none bg-white shadow-sm ring-1 ring-zinc-200">
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
                            <div className="rounded-3xl border-2 border-dashed p-20 text-center">
                                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
                                    <Building2 className="size-10 text-muted-foreground" />
                                </div>
                                <h3 className="mt-6 font-display text-xl font-black">No businesses found</h3>
                                <p className="mt-2 text-muted-foreground">Try adjusting your search or filters</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {businesses.last_page > 1 && (
                            <div className="mt-12">
                                <Pagination currentPage={businesses.current_page} lastPage={businesses.last_page} links={businesses.links} />
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}
