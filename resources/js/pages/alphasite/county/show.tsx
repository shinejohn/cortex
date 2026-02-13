import { Head, Link } from "@inertiajs/react";
import Layout from "@/layouts/layout";

interface Props {
    county: {
        id: string;
        name: string;
        state: string;
        state_full?: string;
        slug: string;
        population?: number;
        seo_description?: string;
    };
    cities: Array<{
        id: string;
        name: string;
        state: string;
        slug: string;
        businesses_count: number;
        population?: number;
    }>;
    categories: Array<{
        id: string;
        name: string;
        slug: string;
        icon?: string;
        business_count: number;
    }>;
    totalBusinessCount: number;
    schemas: {
        breadcrumb: object;
    };
    seo: {
        title: string;
        description: string;
        canonical: string;
        og: object;
    };
}

export default function CountyShow({ county, cities, categories, totalBusinessCount, schemas, seo }: Props) {
    return (
        <Layout>
            <Head>
                <title>{seo.title}</title>
                <meta name="description" content={seo.description} />
                {seo.canonical && <link rel="canonical" href={seo.canonical} />}
                {seo.og && (
                    <>
                        {Object.entries(seo.og).map(([key, value]) => (
                            <meta key={key} property={`og:${key}`} content={String(value)} />
                        ))}
                    </>
                )}
                {schemas.breadcrumb && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.breadcrumb) }}
                    />
                )}
            </Head>

            <div className="min-h-screen bg-muted/50">
                {/* Breadcrumb Navigation */}
                <div className="bg-card border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <nav className="flex items-center text-sm text-muted-foreground">
                            <Link href="/" className="hover:text-primary transition">
                                Home
                            </Link>
                            <span className="mx-2">/</span>
                            <Link
                                href={`/state/${county.state.toLowerCase()}`}
                                className="hover:text-primary transition"
                            >
                                {county.state_full || county.state}
                            </Link>
                            <span className="mx-2">/</span>
                            <span className="text-foreground font-medium">{county.name}</span>
                        </nav>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <h1 className="text-4xl font-bold mb-3">{county.name}</h1>
                        <p className="text-xl text-blue-100 mb-6">
                            {county.state_full || county.state}
                        </p>
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-bold">
                                    {totalBusinessCount.toLocaleString()}
                                </span>
                                <span className="text-blue-100">Businesses</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-bold">
                                    {cities.length.toLocaleString()}
                                </span>
                                <span className="text-blue-100">Cities</span>
                            </div>
                            {county.population && (
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-bold">
                                        {county.population.toLocaleString()}
                                    </span>
                                    <span className="text-blue-100">Population</span>
                                </div>
                            )}
                        </div>
                        {county.seo_description && (
                            <p className="text-blue-100 mt-4 max-w-3xl">{county.seo_description}</p>
                        )}
                    </div>
                </div>

                {/* Cities in County */}
                {cities.length > 0 && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <h2 className="text-2xl font-bold mb-6">
                            Cities in {county.name}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cities.map((city) => (
                                <Link
                                    key={city.id}
                                    href={`/city/${city.slug}`}
                                    className="bg-card rounded-lg shadow hover:shadow-lg transition p-6"
                                >
                                    <h3 className="text-lg font-semibold mb-2">{city.name}</h3>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>{city.businesses_count} businesses</span>
                                        {city.population && (
                                            <>
                                                <span className="text-muted-foreground/50">|</span>
                                                <span>
                                                    Pop. {city.population.toLocaleString()}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Categories */}
                {categories.length > 0 && (
                    <div className="bg-card border-t">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            <h2 className="text-2xl font-bold mb-6">
                                Browse by Category in {county.name}
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {categories.map((category) => (
                                    <Link
                                        key={category.id}
                                        href={`/county/${county.slug}/${category.slug}`}
                                        className="flex flex-col items-center p-4 border rounded-lg hover:bg-muted/50 transition"
                                    >
                                        {category.icon && (
                                            <div className="text-3xl mb-2">{category.icon}</div>
                                        )}
                                        <span className="text-sm font-medium text-center">
                                            {category.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground mt-1">
                                            {category.business_count} businesses
                                        </span>
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
