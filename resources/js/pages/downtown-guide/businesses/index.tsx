import { Head, Link, router } from "@inertiajs/react";
import { ChevronLeft, Filter, MapPin, Search, SparklesIcon, StoreIcon } from "lucide-react";
import { useState } from "react";
import { DowntownGuideBusinessCard } from "@/components/downtown-guide/businesses/DowntownGuideBusinessCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

            <div className="min-h-screen bg-background">
                <main className="container mx-auto px-4 py-8">
                    {/* Breadcrumb */}
                    <nav className="mb-6">
                        <Link href={route("downtown-guide.home")} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                            <ChevronLeft className="size-4" />
                            Back to Home
                        </Link>
                    </nav>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                                <MapPin className="size-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="font-display text-3xl font-black tracking-tight">All Places</h1>
                                <p className="text-muted-foreground">Discover local businesses, restaurants, entertainment, and more.</p>
                            </div>
                        </div>
                    </div>

                    {/* Featured Businesses */}
                    {featuredBusinesses.length > 0 && (
                        <section className="mb-12">
                            <div className="mb-6 flex items-center gap-2">
                                <SparklesIcon className="h-5 w-5 text-primary" />
                                <h2 className="font-display text-2xl font-black tracking-tight">Featured Businesses with Active Deals</h2>
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

                    <div className="grid gap-8 lg:grid-cols-4">
                        {/* Desktop Filters Sidebar */}
                        <aside className="hidden lg:block">
                            <div className="sticky top-24 rounded-lg border bg-card p-4">
                                <h3 className="mb-4 font-semibold">Filters</h3>
                                <div className="space-y-4">
                                    {/* Search */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Search places..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                            className="pl-9"
                                        />
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Category</label>
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
                                    </div>

                                    {/* Sort */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Sort by</label>
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
                                            <SelectTrigger>
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

                                    {/* Checkboxes */}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="verified"
                                            checked={verifiedOnly}
                                            onChange={(e) => setVerifiedOnly(e.target.checked)}
                                            className="h-4 w-4 rounded border text-primary"
                                        />
                                        <label htmlFor="verified" className="text-sm font-medium">Verified only</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="featured"
                                            checked={featuredOnly}
                                            onChange={(e) => setFeaturedOnly(e.target.checked)}
                                            className="h-4 w-4 rounded border text-primary"
                                        />
                                        <label htmlFor="featured" className="text-sm font-medium">Featured only</label>
                                    </div>

                                    <Button onClick={handleSearch} className="w-full">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            {/* Result count */}
                            <div className="mb-6 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {businesses.data.length} places found
                                </p>
                            </div>

                            {/* Results Grid */}
                            {businesses.data.length > 0 ? (
                                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                    {businesses.data.map((business) => (
                                        <DowntownGuideBusinessCard key={business.id} business={business} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex min-h-[40vh] items-center justify-center">
                                    <div className="text-center">
                                        <MapPin className="mx-auto mb-4 size-16 text-muted-foreground" />
                                        <h3 className="mb-2 text-xl font-bold">No Places Found</h3>
                                        <p className="mx-auto max-w-md text-muted-foreground">Try adjusting your search or filters</p>
                                    </div>
                                </div>
                            )}

                            {/* Pagination */}
                            {businesses.last_page > 1 && (
                                <div className="mt-8">
                                    <Pagination currentPage={businesses.current_page} lastPage={businesses.last_page} links={businesses.links} />
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
