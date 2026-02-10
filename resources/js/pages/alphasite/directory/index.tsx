import { Head, Link } from "@inertiajs/react";
import { Star, MapPin, Building2 } from "lucide-react";
import Layout from "@/layouts/layout";
import { Business } from "@/types";

interface Props {
    businesses: {
        data: Business[];
        links: any;
        meta: any;
    };
    featured?: Business[];
    industries?: Array<{
        id: string;
        name: string;
        slug: string;
        icon?: string;
    }>;
}

export default function DirectoryIndex({ businesses, featured, industries }: Props) {
    return (
        <Layout>
            <Head>
                <title>Business Directory - AlphaSite</title>
                <meta name="description" content="Discover local businesses in your community" />
            </Head>

            <div className="min-h-screen bg-muted/30">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-16 lg:py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="font-display text-4xl lg:text-5xl font-black tracking-tight mb-4">Business Directory</h1>
                        <p className="text-xl text-blue-100/90 max-w-2xl">Discover and connect with local businesses in your community</p>
                    </div>
                </div>

                {/* Industries Filter */}
                {industries && industries.length > 0 && (
                    <div className="bg-card border-b shadow-sm">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            <h2 className="font-display text-lg font-bold tracking-tight mb-5">Browse by Industry</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {industries.map((industry) => (
                                    <Link
                                        key={industry.id}
                                        href={`/industry/${industry.slug}`}
                                        className="group flex flex-col items-center p-4 rounded-xl border bg-card hover:shadow-md hover:border-primary/30 transition-all"
                                    >
                                        {industry.icon && <div className="text-3xl mb-2">{industry.icon}</div>}
                                        <span className="text-sm font-medium text-center group-hover:text-primary transition-colors">
                                            {industry.name}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Featured Businesses */}
                {featured && featured.length > 0 && (
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
                        <h2 className="font-display text-2xl font-black tracking-tight mb-6">Featured Businesses</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {featured.map((business) => (
                                <Link
                                    key={business.id}
                                    href={`/business/${business.slug}`}
                                    className="group bg-card rounded-2xl overflow-hidden border-none shadow-sm hover:shadow-md transition-all"
                                >
                                    {business.images && business.images.length > 0 && (
                                        <div className="overflow-hidden">
                                            <img
                                                src={business.images[0]}
                                                alt={business.name}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{business.name}</h3>
                                        {business.description && (
                                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{business.description}</p>
                                        )}
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            {business.address && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {business.city}, {business.state}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Businesses */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <h2 className="font-display text-2xl font-black tracking-tight mb-6">All Businesses</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {businesses.data.map((business) => (
                            <Link
                                key={business.id}
                                href={`/business/${business.slug}`}
                                className="group bg-card rounded-2xl overflow-hidden border-none shadow-sm hover:shadow-md transition-all p-6"
                            >
                                <div className="flex items-start gap-4">
                                    {business.images && business.images.length > 0 && (
                                        <img src={business.images[0]} alt={business.name} className="w-20 h-20 object-cover rounded-xl shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors truncate">
                                            {business.name}
                                        </h3>
                                        {business.rating && (
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                                <span className="font-medium">{business.rating}</span>
                                                {business.reviews_count && <span>({business.reviews_count})</span>}
                                            </div>
                                        )}
                                        {business.address && (
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate">{business.address}, {business.city}, {business.state}</span>
                                            </p>
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
                                {businesses.links.map((link: any, index: number) => (
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
                </div>
            </div>
        </Layout>
    );
}
