import { Head, Link } from "@inertiajs/react";
import Layout from "@/layouts/layout";

interface Props {
    county: {
        id: string;
        name: string;
        state: string;
        state_full?: string;
        slug: string;
    };
    category: {
        id: string;
        name: string;
        slug: string;
        icon?: string;
    };
    businesses: Array<{
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
        city_record?: { name: string; slug: string };
    }>;
    businessesByCity: Record<string, Array<{
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
        city_record?: { name: string; slug: string };
    }>>;
    cities: Array<{
        id: string;
        name: string;
        slug: string;
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

export default function CountyCategory({
    county,
    category,
    businesses,
    businessesByCity,
    cities,
    totalBusinessCount,
    schemas,
    seo,
}: Props) {
    const cityNames = Object.keys(businessesByCity);

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
                            <Link
                                href={`/county/${county.slug}`}
                                className="hover:text-primary transition"
                            >
                                {county.name}
                            </Link>
                            <span className="mx-2">/</span>
                            <span className="text-foreground font-medium">{category.name}</span>
                        </nav>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="flex items-center gap-3 mb-3">
                            {category.icon && <span className="text-4xl">{category.icon}</span>}
                            <h1 className="text-4xl font-bold">{category.name}</h1>
                        </div>
                        <p className="text-xl text-blue-100">
                            in {county.name}, {county.state_full || county.state}
                        </p>
                        <div className="mt-4">
                            <span className="text-3xl font-bold">
                                {totalBusinessCount.toLocaleString()}
                            </span>
                            <span className="text-blue-100 ml-2">
                                {totalBusinessCount === 1 ? "business" : "businesses"} found
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content + Sidebar */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar: Cities Navigation */}
                        <div className="lg:col-span-1 order-2 lg:order-1">
                            <div className="bg-card rounded-lg shadow p-6 sticky top-4">
                                <h3 className="text-lg font-semibold mb-4">Cities</h3>
                                <div className="space-y-1">
                                    {cities.map((city) => {
                                        const cityBusinesses = businessesByCity[city.name];
                                        const count = cityBusinesses ? cityBusinesses.length : 0;
                                        return (
                                            <a
                                                key={city.id}
                                                href={`#city-${city.slug}`}
                                                className="flex items-center justify-between px-3 py-2 rounded text-sm hover:bg-muted/50 transition"
                                            >
                                                <span className="text-foreground">{city.name}</span>
                                                {count > 0 && (
                                                    <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                                                        {count}
                                                    </span>
                                                )}
                                            </a>
                                        );
                                    })}
                                </div>
                                <div className="mt-6 pt-4 border-t">
                                    <Link
                                        href={`/county/${county.slug}`}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        All categories in {county.name}
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Business Listings Grouped by City */}
                        <div className="lg:col-span-3 order-1 lg:order-2 space-y-8">
                            {cityNames.length > 0 ? (
                                cityNames.map((cityName) => {
                                    const cityBusinesses = businessesByCity[cityName];
                                    if (!cityBusinesses || cityBusinesses.length === 0) {
                                        return null;
                                    }
                                    const citySlug =
                                        cityBusinesses[0]?.city_record?.slug ||
                                        cityName.toLowerCase().replace(/\s+/g, "-");

                                    return (
                                        <div key={cityName} id={`city-${citySlug}`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-xl font-bold">{cityName}</h2>
                                                <span className="text-sm text-muted-foreground">
                                                    {cityBusinesses.length}{" "}
                                                    {cityBusinesses.length === 1
                                                        ? "business"
                                                        : "businesses"}
                                                </span>
                                            </div>
                                            <div className="space-y-4">
                                                {cityBusinesses.map((business) => (
                                                    <Link
                                                        key={business.id}
                                                        href={`/business/${business.slug}`}
                                                        className="bg-card rounded-lg shadow hover:shadow-lg transition p-6 flex gap-4 block"
                                                    >
                                                        {business.images &&
                                                            business.images.length > 0 && (
                                                                <img
                                                                    src={business.images[0]}
                                                                    alt={business.name}
                                                                    className="w-24 h-24 object-cover rounded flex-shrink-0"
                                                                />
                                                            )}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-lg font-semibold mb-1">
                                                                {business.name}
                                                            </h3>
                                                            {business.rating && (
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <StarRating
                                                                        rating={business.rating}
                                                                    />
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {business.rating}
                                                                    </span>
                                                                    {business.reviews_count != null && (
                                                                        <span className="text-sm text-muted-foreground">
                                                                            ({business.reviews_count}{" "}
                                                                            {business.reviews_count ===
                                                                            1
                                                                                ? "review"
                                                                                : "reviews"}
                                                                            )
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {business.address && (
                                                                <p className="text-sm text-muted-foreground">
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
                                    );
                                })
                            ) : (
                                <div className="bg-card rounded-lg shadow p-12 text-center">
                                    <span className="text-4xl mb-4 block">
                                        {category.icon || "🔍"}
                                    </span>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        No Businesses Found
                                    </h3>
                                    <p className="text-muted-foreground">
                                        No {category.name} businesses found in {county.name} yet.
                                    </p>
                                    <Link
                                        href={`/county/${county.slug}`}
                                        className="inline-block mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
                                    >
                                        Browse All Categories
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
