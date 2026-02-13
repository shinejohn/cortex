import { Head, Link } from "@inertiajs/react";
import Layout from "@/layouts/layout";

/* ──────────────────────────────────────────────
   Type Definitions
   ────────────────────────────────────────────── */

interface Props {
    state: string;
    stateFullName: string;
    cities: Array<{
        id: string;
        name: string;
        state: string;
        slug: string;
        businesses_count: number;
        population?: number;
    }>;
    seo: {
        title: string;
        description: string;
        canonical: string;
        og: object;
    };
}

/* ──────────────────────────────────────────────
   Main Page Component
   ────────────────────────────────────────────── */

export default function StateShow({ state, stateFullName, cities, seo }: Props) {
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
                            <span className="text-foreground font-medium">{stateFullName}</span>
                        </nav>
                    </div>
                </div>

                {/* ═══════════════════════════════════
                    HERO SECTION
                    ═══════════════════════════════════ */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            {stateFullName}
                        </h1>
                        <p className="text-xl text-blue-100">
                            Browse businesses across {cities.length.toLocaleString()} {cities.length === 1 ? "city" : "cities"} in {stateFullName}
                        </p>
                    </div>
                </div>

                {/* ═══════════════════════════════════
                    CITIES GRID
                    ═══════════════════════════════════ */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <h2 className="text-2xl font-bold text-foreground mb-6">
                        Cities in {stateFullName}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {cities.map((cityItem) => (
                            <Link
                                key={cityItem.id}
                                href={`/city/${cityItem.slug}`}
                                className="bg-card rounded-lg shadow hover:shadow-md transition p-5 group"
                            >
                                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition">
                                    {cityItem.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                                    <span>
                                        {cityItem.businesses_count.toLocaleString()} {cityItem.businesses_count === 1 ? "business" : "businesses"}
                                    </span>
                                    {cityItem.population != null && (
                                        <>
                                            <span className="text-muted-foreground/50">|</span>
                                            <span>Pop. {cityItem.population.toLocaleString()}</span>
                                        </>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ═══════════════════════════════════
                    CTA SECTION
                    ═══════════════════════════════════ */}
                <div className="bg-primary text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                        <h2 className="text-3xl font-bold mb-4">Explore the Full Directory</h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Discover local businesses across all communities
                        </p>
                        <Link
                            href="/directory"
                            className="px-8 py-3 bg-card text-primary rounded-lg font-semibold hover:bg-accent/50 transition inline-block"
                        >
                            Browse Directory
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
