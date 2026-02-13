import { Head, Link } from "@inertiajs/react";
import { useState } from "react";
import Layout from "@/layouts/layout";

/* ──────────────────────────────────────────────
   Type Definitions
   ────────────────────────────────────────────── */

interface Props {
    city: {
        id: string;
        name: string;
        state: string;
        state_full?: string;
        slug: string;
        population?: number;
        seo_description?: string;
        ai_overview?: string;
        ai_business_climate?: string;
        ai_community_highlights?: string;
        ai_faqs?: Array<{ question: string; answer: string }>;
    };
    categories: Array<{
        id: string;
        name: string;
        slug: string;
        icon?: string;
        business_count: number;
    }>;
    featuredBusinesses: Array<{
        id: string;
        name: string;
        slug: string;
        city?: string;
        state?: string;
        rating?: number;
        reviews_count?: number;
        images?: string[];
        address?: string;
        phone?: string;
        alphasite_category?: { name: string; slug: string };
    }>;
    neighbors: Array<{
        id: string;
        name: string;
        state: string;
        slug: string;
        businesses_count?: number;
    }>;
    totalBusinessCount: number;
    schemas: {
        city: object;
        breadcrumb: object;
        itemList: object;
        faq?: object;
    };
    seo: {
        title: string;
        description: string;
        canonical: string;
        og: { title: string; description: string; type: string; url: string; site_name: string };
    };
}

/* ──────────────────────────────────────────────
   Helper Components
   ────────────────────────────────────────────── */

function StarRating({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) {
    return (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`${size} ${star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

/* ──────────────────────────────────────────────
   Main Page Component
   ────────────────────────────────────────────── */

export default function CityShow({
    city,
    categories,
    featuredBusinesses,
    neighbors,
    totalBusinessCount,
    schemas,
    seo,
}: Props) {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <Layout>
            <Head>
                <title>{seo.title}</title>
                <meta name="description" content={seo.description} />
                <link rel="canonical" href={seo.canonical} />

                {/* Open Graph */}
                <meta property="og:title" content={seo.og.title} />
                <meta property="og:description" content={seo.og.description} />
                <meta property="og:type" content={seo.og.type} />
                <meta property="og:url" content={seo.og.url} />
                <meta property="og:site_name" content={seo.og.site_name} />

                {/* JSON-LD Schemas */}
                {schemas.city && (
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.city) }} />
                )}
                {schemas.breadcrumb && (
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.breadcrumb) }} />
                )}
                {schemas.itemList && (
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.itemList) }} />
                )}
                {schemas.faq && (
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.faq) }} />
                )}
            </Head>

            <div className="min-h-screen bg-muted/50">
                {/* ═══════════════════════════════════
                    BREADCRUMB
                    ═══════════════════════════════════ */}
                <div className="bg-card border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link href="/directory" className="hover:text-primary transition">
                                Home
                            </Link>
                            <span>/</span>
                            <Link href={`/state/${city.state.toLowerCase()}`} className="hover:text-primary transition">
                                {city.state_full || city.state}
                            </Link>
                            <span>/</span>
                            <span className="text-foreground font-medium">{city.name}</span>
                        </nav>
                    </div>
                </div>

                {/* ═══════════════════════════════════
                    HERO SECTION
                    ═══════════════════════════════════ */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            {city.name}, {city.state_full || city.state}
                        </h1>
                        {city.seo_description && (
                            <p className="text-xl text-blue-100 mb-6 max-w-3xl">{city.seo_description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-6 text-sm">
                            {city.population != null && (
                                <div className="flex items-center gap-2">
                                    <span className="bg-white/20 rounded-full px-3 py-1">
                                        Population: {city.population.toLocaleString()}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="bg-white/20 rounded-full px-3 py-1">
                                    {totalBusinessCount.toLocaleString()} {totalBusinessCount === 1 ? "Business" : "Businesses"}
                                </span>
                            </div>
                            {categories.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="bg-white/20 rounded-full px-3 py-1">
                                        {categories.length} {categories.length === 1 ? "Category" : "Categories"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════
                    AI OVERVIEW
                    ═══════════════════════════════════ */}
                {city.ai_overview && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                        <div className="bg-card rounded-lg shadow p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xl">&#x2728;</span>
                                <h2 className="text-2xl font-bold text-foreground">About {city.name}</h2>
                            </div>
                            <p className="text-foreground leading-relaxed whitespace-pre-line">{city.ai_overview}</p>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════
                    CATEGORIES GRID
                    ═══════════════════════════════════ */}
                {categories.length > 0 && (
                    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${city.ai_overview ? "pb-10" : "py-10"}`}>
                        <h2 className="text-2xl font-bold text-foreground mb-6">
                            Browse by Category
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/city/${city.slug}/${category.slug}`}
                                    className="bg-card rounded-lg shadow hover:shadow-md transition p-4 text-center group"
                                >
                                    {category.icon && (
                                        <span className="text-2xl block mb-2 group-hover:scale-110 transition">
                                            {category.icon}
                                        </span>
                                    )}
                                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition">
                                        {category.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {category.business_count} {category.business_count === 1 ? "business" : "businesses"}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════
                    FEATURED BUSINESSES GRID
                    ═══════════════════════════════════ */}
                {featuredBusinesses.length > 0 && (
                    <div className="bg-muted/30">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                            <h2 className="text-2xl font-bold text-foreground mb-6">
                                Featured Businesses in {city.name}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featuredBusinesses.map((business) => (
                                    <Link
                                        key={business.id}
                                        href={`/business/${business.slug}`}
                                        className="bg-card rounded-lg shadow hover:shadow-lg transition overflow-hidden group"
                                    >
                                        {business.images && business.images.length > 0 ? (
                                            <img
                                                src={business.images[0]}
                                                alt={business.name}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                                <span className="text-4xl text-muted-foreground">
                                                    {business.name.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="p-5">
                                            <h3 className="text-lg font-semibold text-foreground mb-1">
                                                {business.name}
                                            </h3>
                                            {business.alphasite_category && (
                                                <span className="text-xs font-medium text-primary">
                                                    {business.alphasite_category.name}
                                                </span>
                                            )}
                                            {business.rating != null && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <StarRating rating={business.rating} />
                                                    <span className="text-sm font-medium text-foreground">
                                                        {business.rating.toFixed(1)}
                                                    </span>
                                                    {business.reviews_count != null && (
                                                        <span className="text-xs text-muted-foreground">
                                                            ({business.reviews_count} {business.reviews_count === 1 ? "review" : "reviews"})
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {business.address && (
                                                <p className="text-sm text-muted-foreground mt-2 truncate">
                                                    {business.address}
                                                </p>
                                            )}
                                            {business.phone && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {business.phone}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════
                    AI BUSINESS CLIMATE
                    ═══════════════════════════════════ */}
                {city.ai_business_climate && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                        <div className="bg-card rounded-lg shadow p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xl">&#x1F4C8;</span>
                                <h2 className="text-2xl font-bold text-foreground">Business Climate</h2>
                            </div>
                            <p className="text-foreground leading-relaxed whitespace-pre-line">
                                {city.ai_business_climate}
                            </p>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════
                    AI COMMUNITY HIGHLIGHTS
                    ═══════════════════════════════════ */}
                {city.ai_community_highlights && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                        <div className="bg-card rounded-lg shadow p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xl">&#x1F3D8;</span>
                                <h2 className="text-2xl font-bold text-foreground">Community Highlights</h2>
                            </div>
                            <p className="text-foreground leading-relaxed whitespace-pre-line">
                                {city.ai_community_highlights}
                            </p>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════
                    FAQ ACCORDION
                    ═══════════════════════════════════ */}
                {city.ai_faqs && city.ai_faqs.length > 0 && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                        <div className="bg-card rounded-lg shadow p-6">
                            <h2 className="text-2xl font-bold text-foreground mb-6">
                                Frequently Asked Questions
                            </h2>
                            <div className="divide-y">
                                {city.ai_faqs.map((faq, index) => (
                                    <div key={index} className="py-4">
                                        <button
                                            onClick={() => toggleFaq(index)}
                                            className="flex items-center justify-between w-full text-left"
                                        >
                                            <h3 className="text-base font-semibold text-foreground pr-4">
                                                {faq.question}
                                            </h3>
                                            <svg
                                                className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                                                    openFaq === index ? "rotate-180" : ""
                                                }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {openFaq === index && (
                                            <p className="text-muted-foreground mt-3 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════
                    NEARBY CITIES
                    ═══════════════════════════════════ */}
                {neighbors.length > 0 && (
                    <div className="bg-card border-t">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                            <h2 className="text-2xl font-bold text-foreground mb-6">
                                Nearby Cities
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {neighbors.map((neighbor) => (
                                    <Link
                                        key={neighbor.id}
                                        href={`/city/${neighbor.slug}`}
                                        className="bg-muted/50 rounded-lg p-4 hover:bg-muted transition text-center group"
                                    >
                                        <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition">
                                            {neighbor.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {neighbor.state}
                                        </p>
                                        {neighbor.businesses_count != null && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {neighbor.businesses_count} {neighbor.businesses_count === 1 ? "business" : "businesses"}
                                            </p>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
