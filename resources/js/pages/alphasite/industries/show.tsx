import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, Building2, MapPin, Star, Search, Filter, Layers } from "lucide-react";
import Layout from "@/layouts/layout";
import { useState } from "react";

interface Industry {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    seo_title?: string;
    seo_description?: string;
    available_features?: string[];
    schema_type?: string;
}

interface Business {
    id: string;
    name: string;
    slug: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
    email?: string;
    website?: string;
    images?: string[];
    logo?: string;
    rating?: number;
    review_count?: number;
    is_verified?: boolean;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    industry: Industry;
    businesses: {
        data: Business[];
        links: PaginationLinks[];
        meta?: {
            current_page: number;
            last_page: number;
            total: number;
        };
    };
    filters: {
        city?: string;
        state?: string;
    };
}

export default function IndustryShow({ industry, businesses, filters }: Props) {
    const [city, setCity] = useState(filters.city || "");
    const [state, setState] = useState(filters.state || "");

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            `/industry/${industry.slug}`,
            { city: city || undefined, state: state || undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <Layout>
            <Head>
                <title>{industry.seo_title || `${industry.name} Businesses`} - AlphaSite</title>
                {industry.seo_description && <meta name="description" content={industry.seo_description} />}
            </Head>

            <div className="min-h-screen bg-muted/30">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-16 lg:py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <Link
                            href="/industries"
                            className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            All Industries
                        </Link>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 text-3xl backdrop-blur-sm">
                                {industry.icon || <Layers className="h-8 w-8" />}
                            </div>
                            <div>
                                <h1 className="font-display text-4xl lg:text-5xl font-black tracking-tight">{industry.name}</h1>
                                {businesses.meta?.total !== undefined && (
                                    <p className="text-blue-100/90 mt-2">
                                        {businesses.meta.total} {businesses.meta.total === 1 ? "business" : "businesses"} found
                                        {filters.city && ` in ${filters.city}`}
                                        {filters.state && `, ${filters.state}`}
                                    </p>
                                )}
                            </div>
                        </div>
                        {industry.description && (
                            <p className="text-lg text-blue-100/80 max-w-3xl">{industry.description}</p>
                        )}
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-card border-b shadow-sm">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1 max-w-xs">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                />
                            </div>
                            <div className="relative flex-1 max-w-xs">
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                <Filter className="h-4 w-4" />
                                Filter
                            </button>
                            {(filters.city || filters.state) && (
                                <Link
                                    href={`/industry/${industry.slug}`}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-muted text-muted-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors"
                                >
                                    Clear Filters
                                </Link>
                            )}
                        </form>
                    </div>
                </div>

                {/* Business Grid */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
                                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-48 bg-muted flex items-center justify-center">
                                                <Building2 className="h-12 w-12 text-muted-foreground/30" />
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                                    {business.name}
                                                </h3>
                                                {business.is_verified && (
                                                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 rounded-full shrink-0">
                                                        Verified
                                                    </span>
                                                )}
                                            </div>
                                            {business.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{business.description}</p>
                                            )}
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                {business.rating !== undefined && business.rating > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                                        <span className="font-medium text-foreground">{business.rating.toFixed(1)}</span>
                                                        {business.review_count !== undefined && (
                                                            <span>({business.review_count})</span>
                                                        )}
                                                    </span>
                                                )}
                                                {business.city && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        {business.city}{business.state && `, ${business.state}`}
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
                            <p className="text-muted-foreground max-w-md mx-auto">
                                {filters.city || filters.state
                                    ? `No ${industry.name} businesses found in this location. Try broadening your search.`
                                    : `No ${industry.name} businesses have been listed yet. Check back soon.`}
                            </p>
                            {(filters.city || filters.state) && (
                                <Link
                                    href={`/industry/${industry.slug}`}
                                    className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                                >
                                    Clear Filters
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
