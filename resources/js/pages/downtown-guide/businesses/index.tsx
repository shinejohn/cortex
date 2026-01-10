import { Head, router } from "@inertiajs/react";
import { DowntownGuideBusinessCard } from "@/components/downtown-guide/businesses/DowntownGuideBusinessCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SearchIcon, FilterIcon, StoreIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import { Pagination } from "@/components/ui/pagination";

interface DowntownGuideBusinessesIndexProps {
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
            featured?: boolean;
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
            featured?: boolean;
        };
        active_deals_count: number;
        active_coupons_count: number;
        latest_deal?: {
            id: string;
            title: string;
            discount_value?: number;
        };
    }>;
    filters: {
        search?: string;
        category?: string;
        verified_only?: boolean;
        featured_only?: boolean;
    };
    sort: {
        sort: string;
        direction: string;
    };
}

export default function DowntownGuideBusinessesIndex({ businesses, featuredBusinesses, filters, sort }: DowntownGuideBusinessesIndexProps) {
    const [search, setSearch] = useState(filters.search || "");
    const [category, setCategory] = useState(filters.category || "");
    const [verifiedOnly, setVerifiedOnly] = useState(filters.verified_only || false);
    const [featuredOnly, setFeaturedOnly] = useState(filters.featured_only || false);

    const handleSearch = () => {
        router.get(
            route("downtown-guide.businesses.index"),
            {
                search: search || undefined,
                category: category || undefined,
                verified_only: verifiedOnly || undefined,
                featured_only: featuredOnly || undefined,
                sort: sort.sort,
                direction: sort.direction,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Business Directory - DowntownsGuide" />

            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
                {/* Header */}
                <div className="relative overflow-hidden border-b-4 border-purple-600 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 shadow-xl">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-card/20 p-3 backdrop-blur-sm">
                                <StoreIcon className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white">Your Complete Guide to Local Businesses</h1>
                                <p className="mt-2 text-xl text-purple-100">Discover businesses, deals, reviews, and more in your area</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Featured Businesses */}
                    {featuredBusinesses.length > 0 && (
                        <section className="mb-12">
                            <div className="mb-6 flex items-center gap-2">
                                <SparklesIcon className="h-6 w-6 text-primary" />
                                <h2 className="text-3xl font-bold text-foreground">Featured Businesses with Active Deals</h2>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {featuredBusinesses.map((item) => (
                                    <DowntownGuideBusinessCard
                                        key={item.business.id}
                                        business={item.business}
                                        activeDealsCount={item.active_deals_count}
                                        activeCouponsCount={item.active_coupons_count}
                                        latestDeal={item.latest_deal}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Filters */}
                    <div className="mb-6 rounded-xl border-2 border bg-card p-6 shadow-lg">
                        <div className="grid gap-4 md:grid-cols-5">
                            <div className="relative md:col-span-2">
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
                                    <SelectItem value="health">Health & Wellness</SelectItem>
                                    <SelectItem value="beauty">Beauty & Spa</SelectItem>
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
                                <label htmlFor="verified" className="text-sm font-medium text-foreground">
                                    Verified only
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="featured"
                                    checked={featuredOnly}
                                    onChange={(e) => setFeaturedOnly(e.target.checked)}
                                    className="h-4 w-4 rounded border text-primary"
                                />
                                <label htmlFor="featured" className="text-sm font-medium text-foreground">
                                    Featured only
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
                            <h2 className="text-2xl font-bold text-foreground">All Businesses</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Sort by:</span>
                                <Select
                                    value={`${sort.sort}-${sort.direction}`}
                                    onValueChange={(value) => {
                                        const [sortBy, direction] = value.split("-");
                                        router.get(
                                            route("downtown-guide.businesses.index"),
                                            { ...filters, sort: sortBy, direction },
                                            { preserveState: true },
                                        );
                                    }}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rating-desc">Highest Rated</SelectItem>
                                        <SelectItem value="reviews_count-desc">Most Reviews</SelectItem>
                                        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                                        <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {businesses.data.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {businesses.data.map((business) => (
                                    <DowntownGuideBusinessCard key={business.id} business={business} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border-2 border-dashed border bg-gradient-to-br from-purple-50 to-pink-50 p-12 text-center">
                                <StoreIcon className="mx-auto h-16 w-16 text-purple-400" />
                                <p className="mt-4 text-xl font-bold text-foreground">No businesses found</p>
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
