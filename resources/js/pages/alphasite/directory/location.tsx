import { Head, Link, router } from "@inertiajs/react";
import { MapPin, Building2, Star, Search, ArrowLeft } from "lucide-react";
import Layout from "@/layouts/layout";
import { useState } from "react";

interface Business {
    id: string;
    name: string;
    slug: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
    images?: string[];
    logo?: string;
    rating?: number;
    review_count?: number;
    is_verified?: boolean;
}

interface Advertisement {
    id: string;
    placement: string;
    advertable: {
        id: string;
        title?: string;
        excerpt?: string;
        featured_image?: string;
        slug?: string;
    };
    expires_at: string;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    businesses: {
        data: Business[];
        links: PaginationLinks[];
        meta?: {
            current_page: number;
            last_page: number;
            total: number;
        };
    };
    city: string;
    state: string;
    filters: {
        search?: string;
        sort?: string;
        direction?: string;
    };
    advertisements?: {
        banner?: Advertisement[];
        sidebar?: Advertisement[];
    };
}

export default function DirectoryLocation({ businesses, city, state, filters, advertisements }: Props) {
    const [search, setSearch] = useState(filters.search || "");

    const formattedCity = city
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    const formattedState = state.toUpperCase();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            `/directory/${city}/${state}`,
            { search: search || undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <Layout>
            <Head>
                <title>Businesses in {formattedCity}, {formattedState} - AlphaSite</title>
                <meta
                    name="description"
                    content={`Discover local businesses in ${formattedCity}, ${formattedState}. Browse our directory of verified businesses.`}
                />
            </Head>

            <div className="min-h-screen bg-muted/30">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-16 lg:py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <Link
                            href="/directory"
                            className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Directory
                        </Link>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm">
                                <MapPin className="h-7 w-7" />
                            </div>
                            <div>
                                <h1 className="font-display text-4xl lg:text-5xl font-black tracking-tight">
                                    {formattedCity}, {formattedState}
                                </h1>
                                <p className="text-blue-100/90 mt-1">
                                    {businesses.meta?.total ?? businesses.data.length} businesses found
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search / Filter Bar */}
                <div className="bg-card border-b shadow-sm">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <form onSubmit={handleSearch} className="flex gap-3">
                            <div className="relative flex-1 max-w-lg">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search businesses..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                Search
                            </button>
                        </form>
                    </div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex gap-8">
                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Banner Ad */}
                            {advertisements?.banner && advertisements.banner.length > 0 && (
                                <div className="mb-8">
                                    {advertisements.banner.map((ad) => (
                                        <div key={ad.id} className="bg-card rounded-2xl border-none shadow-sm overflow-hidden">
                                            {ad.advertable.featured_image && (
                                                <img
                                                    src={ad.advertable.featured_image}
                                                    alt={ad.advertable.title || "Advertisement"}
                                                    className="w-full h-32 object-cover"
                                                />
                                            )}
                                            {ad.advertable.title && (
                                                <div className="p-4">
                                                    <p className="text-xs text-muted-foreground mb-1">Sponsored</p>
                                                    <h3 className="font-medium text-foreground">{ad.advertable.title}</h3>
                                                    {ad.advertable.excerpt && (
                                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                                            {ad.advertable.excerpt}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {businesses.data.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {businesses.data.map((business) => (
                                            <Link
                                                key={business.id}
                                                href={`/business/${business.slug}`}
                                                className="group bg-card rounded-2xl overflow-hidden border-none shadow-sm hover:shadow-md transition-all"
                                            >
                                                {business.images && business.images.length > 0 ? (
                                                    <div className="overflow-hidden">
                                                        <img
                                                            src={business.images[0]}
                                                            alt={business.name}
                                                            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-44 bg-muted flex items-center justify-center">
                                                        <Building2 className="h-12 w-12 text-muted-foreground/30" />
                                                    </div>
                                                )}
                                                <div className="p-5">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                            {business.name}
                                                        </h3>
                                                        {business.is_verified && (
                                                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 rounded-full shrink-0">
                                                                Verified
                                                            </span>
                                                        )}
                                                    </div>
                                                    {business.description && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                            {business.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                        {business.rating !== undefined && business.rating > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                                                <span className="font-medium text-foreground">
                                                                    {business.rating.toFixed(1)}
                                                                </span>
                                                                {business.review_count !== undefined && (
                                                                    <span>({business.review_count})</span>
                                                                )}
                                                            </span>
                                                        )}
                                                        {business.address && (
                                                            <span className="flex items-center gap-1 truncate">
                                                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                                <span className="truncate">{business.address}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {businesses.links && businesses.links.length > 3 && (
                                        <div className="mt-10 flex justify-center">
                                            <nav className="flex gap-1.5">
                                                {businesses.links.map((link, index) => (
                                                    <Link
                                                        key={index}
                                                        href={link.url || "#"}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                            link.active
                                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                                : "bg-card text-foreground hover:bg-muted border"
                                                        } ${!link.url ? "opacity-40 pointer-events-none" : ""}`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </nav>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
                                        <Building2 className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No Businesses Found</h3>
                                    <p className="text-muted-foreground">
                                        {filters.search
                                            ? `No businesses match "${filters.search}" in ${formattedCity}, ${formattedState}.`
                                            : `No businesses listed in ${formattedCity}, ${formattedState} yet.`}
                                    </p>
                                    <Link
                                        href="/directory"
                                        className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                                    >
                                        Browse Full Directory
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Sidebar Ads (Desktop) */}
                        {advertisements?.sidebar && advertisements.sidebar.length > 0 && (
                            <div className="hidden lg:block w-72 shrink-0 space-y-4">
                                {advertisements.sidebar.map((ad) => (
                                    <div key={ad.id} className="bg-card rounded-2xl border-none shadow-sm overflow-hidden">
                                        {ad.advertable.featured_image && (
                                            <img
                                                src={ad.advertable.featured_image}
                                                alt={ad.advertable.title || "Advertisement"}
                                                className="w-full h-40 object-cover"
                                            />
                                        )}
                                        <div className="p-4">
                                            <p className="text-xs text-muted-foreground mb-1">Sponsored</p>
                                            {ad.advertable.title && (
                                                <h4 className="text-sm font-medium text-foreground">{ad.advertable.title}</h4>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
