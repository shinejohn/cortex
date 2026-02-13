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
    };
    category: {
        id: string;
        name: string;
        singular_name?: string;
        slug: string;
        icon?: string;
    };
    content: {
        seo_title?: string;
        seo_description?: string;
        ai_intro?: string;
        ai_hiring_guide?: string;
        ai_local_insights?: string;
        ai_cost_guide?: string;
        ai_faqs?: Array<{ question: string; answer: string }>;
        ai_tips?: string[];
    } | null;
    businesses: {
        data: Array<{
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
        }>;
        links: any[];
        meta: any;
    };
    relatedCategories: Array<{
        id: string;
        name: string;
        slug: string;
        icon?: string;
        business_count: number;
    }>;
    nearbyCities: Array<{
        id: string;
        name: string;
        state: string;
        slug: string;
        distance_miles?: number;
        business_count: number;
    }>;
    otherCategories: Array<{
        id: string;
        name: string;
        slug: string;
        icon?: string;
        business_count: number;
    }>;
    schemas: {
        breadcrumb: object;
        itemList: object;
        faq?: object;
    };
    seo: {
        title: string;
        description: string;
        canonical: string;
        og: object;
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

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={`bg-card rounded-lg shadow p-6 ${className}`}>{children}</div>;
}

function FaqAccordion({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="space-y-3">
            {faqs.map((faq, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                    <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition"
                    >
                        <span className="font-medium text-foreground pr-4">{faq.question}</span>
                        <svg
                            className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${openIndex === index ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {openIndex === index && (
                        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                            {faq.answer}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

/* ──────────────────────────────────────────────
   Main Page Component
   ────────────────────────────────────────────── */

export default function CityCategory({
    city,
    category,
    content,
    businesses,
    relatedCategories,
    nearbyCities,
    otherCategories,
    schemas,
    seo,
}: Props) {
    const categoryLabel = category.singular_name || category.name;
    const stateLabel = city.state_full || city.state;

    return (
        <Layout>
            <Head>
                <title>{seo.title}</title>
                <meta name="description" content={seo.description} />
                <link rel="canonical" href={seo.canonical} />

                {/* Open Graph */}
                {seo.og && Object.entries(seo.og).map(([key, value]) => (
                    <meta key={key} property={`og:${key}`} content={String(value)} />
                ))}

                {/* JSON-LD Schemas */}
                {schemas.breadcrumb && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.breadcrumb) }}
                    />
                )}
                {schemas.itemList && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.itemList) }}
                    />
                )}
                {schemas.faq && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.faq) }}
                    />
                )}
            </Head>

            <div className="min-h-screen bg-muted/50">
                {/* ═══════════════════════════════════
                    BREADCRUMB NAVIGATION
                    ═══════════════════════════════════ */}
                <div className="bg-card border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link href="/" className="hover:text-primary transition">Home</Link>
                            <span>/</span>
                            <Link href={`/state/${city.state.toLowerCase()}`} className="hover:text-primary transition">
                                {stateLabel}
                            </Link>
                            <span>/</span>
                            <Link href={`/city/${city.slug}`} className="hover:text-primary transition">
                                {city.name}
                            </Link>
                            <span>/</span>
                            <span className="text-foreground font-medium">{category.name}</span>
                        </nav>
                    </div>
                </div>

                {/* ═══════════════════════════════════
                    HERO SECTION
                    ═══════════════════════════════════ */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="text-center">
                            {category.icon && (
                                <span className="text-5xl mb-4 block">{category.icon}</span>
                            )}
                            <h1 className="text-4xl font-bold mb-3">
                                {category.name} in {city.name}, {city.state}
                            </h1>
                            <p className="text-xl text-blue-100">
                                Find the best {category.name.toLowerCase()} serving {city.name}, {stateLabel}
                            </p>
                            {businesses.meta?.total !== undefined && (
                                <p className="mt-4 text-blue-200">
                                    {businesses.meta.total} {businesses.meta.total === 1 ? "business" : "businesses"} found
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════
                    MAIN CONTENT + SIDEBAR
                    ═══════════════════════════════════ */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* ─── Main Content Area ─── */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* AI Intro Section */}
                            {content?.ai_intro && (
                                <SectionCard>
                                    <h2 className="text-xl font-bold mb-4">
                                        About {category.name} in {city.name}
                                    </h2>
                                    <div className="text-foreground leading-relaxed whitespace-pre-line">
                                        {content.ai_intro}
                                    </div>
                                </SectionCard>
                            )}

                            {/* Business Listings Grid */}
                            <div>
                                <h2 className="text-2xl font-bold mb-6">
                                    Top {category.name} in {city.name}
                                </h2>
                                {businesses.data.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {businesses.data.map((business) => (
                                            <Link
                                                key={business.id}
                                                href={`/business/${business.slug}`}
                                                className="bg-card rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                                            >
                                                {business.images && business.images.length > 0 ? (
                                                    <img
                                                        src={business.images[0]}
                                                        alt={business.name}
                                                        className="w-full h-44 object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-44 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                                        <span className="text-4xl text-muted-foreground">
                                                            {category.icon || business.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="p-4">
                                                    <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                                                        {business.name}
                                                    </h3>
                                                    {business.rating != null && (
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <StarRating rating={business.rating} />
                                                            <span className="text-sm font-medium text-foreground">
                                                                {business.rating.toFixed(1)}
                                                            </span>
                                                            {business.reviews_count != null && (
                                                                <span className="text-sm text-muted-foreground">
                                                                    ({business.reviews_count})
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {business.address && (
                                                        <p className="text-sm text-muted-foreground line-clamp-1">
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
                                ) : (
                                    <SectionCard>
                                        <div className="text-center py-12">
                                            <span className="text-4xl mb-4 block">
                                                {category.icon || "🔍"}
                                            </span>
                                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                                No {category.name} Found
                                            </h3>
                                            <p className="text-muted-foreground">
                                                We haven't found any {category.name.toLowerCase()} in {city.name} yet.
                                                Check back soon!
                                            </p>
                                        </div>
                                    </SectionCard>
                                )}

                                {/* Pagination */}
                                {businesses.links && businesses.links.length > 3 && (
                                    <div className="mt-8 flex justify-center">
                                        <nav className="flex space-x-2">
                                            {businesses.links.map((link: any, index: number) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || "#"}
                                                    className={`px-4 py-2 rounded ${
                                                        link.active
                                                            ? "bg-primary text-white"
                                                            : "bg-card text-foreground hover:bg-muted/50"
                                                    } ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                )}
                            </div>

                            {/* AI Hiring Guide */}
                            {content?.ai_hiring_guide && (
                                <SectionCard>
                                    <h2 className="text-xl font-bold mb-4">
                                        How to Hire {categoryLabel === category.name ? `a ${categoryLabel}` : categoryLabel} in {city.name}
                                    </h2>
                                    <div className="text-foreground leading-relaxed whitespace-pre-line">
                                        {content.ai_hiring_guide}
                                    </div>
                                </SectionCard>
                            )}

                            {/* AI Local Insights */}
                            {content?.ai_local_insights && (
                                <SectionCard>
                                    <h2 className="text-xl font-bold mb-4">
                                        Local Insights: {category.name} in {city.name}
                                    </h2>
                                    <div className="text-foreground leading-relaxed whitespace-pre-line">
                                        {content.ai_local_insights}
                                    </div>
                                </SectionCard>
                            )}

                            {/* AI Cost Guide */}
                            {content?.ai_cost_guide && (
                                <SectionCard>
                                    <h2 className="text-xl font-bold mb-4">
                                        {category.name} Cost Guide for {city.name}
                                    </h2>
                                    <div className="text-foreground leading-relaxed whitespace-pre-line">
                                        {content.ai_cost_guide}
                                    </div>
                                </SectionCard>
                            )}

                            {/* FAQ Accordion */}
                            {content?.ai_faqs && content.ai_faqs.length > 0 && (
                                <SectionCard>
                                    <h2 className="text-xl font-bold mb-4">
                                        Frequently Asked Questions
                                    </h2>
                                    <FaqAccordion faqs={content.ai_faqs} />
                                </SectionCard>
                            )}

                            {/* Tips List */}
                            {content?.ai_tips && content.ai_tips.length > 0 && (
                                <SectionCard>
                                    <h2 className="text-xl font-bold mb-4">
                                        Tips for Choosing {category.name} in {city.name}
                                    </h2>
                                    <ul className="space-y-3">
                                        {content.ai_tips.map((tip, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                                                    {index + 1}
                                                </span>
                                                <span className="text-foreground leading-relaxed">{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </SectionCard>
                            )}
                        </div>

                        {/* ─── Sidebar ─── */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* Related Categories */}
                            {relatedCategories.length > 0 && (
                                <SectionCard>
                                    <h3 className="text-lg font-semibold mb-4">Related Categories</h3>
                                    <div className="space-y-2">
                                        {relatedCategories.map((cat) => (
                                            <Link
                                                key={cat.id}
                                                href={`/city/${city.slug}/${cat.slug}`}
                                                className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition"
                                            >
                                                <span className="flex items-center gap-2 text-sm text-foreground">
                                                    {cat.icon && <span>{cat.icon}</span>}
                                                    {cat.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {cat.business_count}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </SectionCard>
                            )}

                            {/* Same Category in Nearby Cities */}
                            {nearbyCities.length > 0 && (
                                <SectionCard>
                                    <h3 className="text-lg font-semibold mb-4">
                                        {category.name} in Nearby Cities
                                    </h3>
                                    <div className="space-y-2">
                                        {nearbyCities.map((nearbyCity) => (
                                            <Link
                                                key={nearbyCity.id}
                                                href={`/city/${nearbyCity.slug}/${category.slug}`}
                                                className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition"
                                            >
                                                <div className="min-w-0">
                                                    <span className="text-sm text-foreground block truncate">
                                                        {nearbyCity.name}, {nearbyCity.state}
                                                    </span>
                                                    {nearbyCity.distance_miles != null && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {nearbyCity.distance_miles.toFixed(1)} mi away
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                                    {nearbyCity.business_count}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </SectionCard>
                            )}

                            {/* Other Categories in This City */}
                            {otherCategories.length > 0 && (
                                <SectionCard>
                                    <h3 className="text-lg font-semibold mb-4">
                                        More in {city.name}
                                    </h3>
                                    <div className="space-y-2">
                                        {otherCategories.map((cat) => (
                                            <Link
                                                key={cat.id}
                                                href={`/city/${city.slug}/${cat.slug}`}
                                                className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition"
                                            >
                                                <span className="flex items-center gap-2 text-sm text-foreground">
                                                    {cat.icon && <span>{cat.icon}</span>}
                                                    {cat.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {cat.business_count}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </SectionCard>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
