import { Head, Link } from "@inertiajs/react";
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

            <div className="min-h-screen bg-muted/50">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl font-bold mb-4">Business Directory</h1>
                        <p className="text-xl text-blue-100">Discover and connect with local businesses in your community</p>
                    </div>
                </div>

                {/* Industries Filter */}
                {industries && industries.length > 0 && (
                    <div className="bg-card border-b border">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            <h2 className="text-lg font-semibold mb-4">Browse by Industry</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {industries.map((industry) => (
                                    <Link
                                        key={industry.id}
                                        href={`/industry/${industry.slug}`}
                                        className="flex flex-col items-center p-4 border border rounded-lg hover:bg-muted/50 transition"
                                    >
                                        {industry.icon && <div className="text-3xl mb-2">{industry.icon}</div>}
                                        <span className="text-sm font-medium text-center">{industry.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Featured Businesses */}
                {featured && featured.length > 0 && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <h2 className="text-2xl font-bold mb-6">Featured Businesses</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {featured.map((business) => (
                                <Link
                                    key={business.id}
                                    href={`/business/${business.slug}`}
                                    className="bg-card rounded-lg shadow hover:shadow-lg transition p-6"
                                >
                                    {business.images && business.images.length > 0 && (
                                        <img src={business.images[0]} alt={business.name} className="w-full h-48 object-cover rounded mb-4" />
                                    )}
                                    <h3 className="text-xl font-semibold mb-2">{business.name}</h3>
                                    {business.description && <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{business.description}</p>}
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        {business.address && (
                                            <span>
                                                {business.city}, {business.state}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Businesses */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h2 className="text-2xl font-bold mb-6">All Businesses</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {businesses.data.map((business) => (
                            <Link
                                key={business.id}
                                href={`/business/${business.slug}`}
                                className="bg-card rounded-lg shadow hover:shadow-lg transition p-6"
                            >
                                <div className="flex items-start space-x-4">
                                    {business.images && business.images.length > 0 && (
                                        <img src={business.images[0]} alt={business.name} className="w-24 h-24 object-cover rounded" />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold mb-1">{business.name}</h3>
                                        {business.rating && (
                                            <div className="flex items-center text-sm text-muted-foreground mb-2">
                                                <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                <span>{business.rating}</span>
                                                {business.reviews_count && <span className="ml-1">({business.reviews_count})</span>}
                                            </div>
                                        )}
                                        {business.address && (
                                            <p className="text-sm text-muted-foreground">
                                                {business.address}, {business.city}, {business.state}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {businesses.links && businesses.links.length > 3 && (
                        <div className="mt-8 flex justify-center">
                            <nav className="flex space-x-2">
                                {businesses.links.map((link: any, index: number) => (
                                    <Link
                                        key={index}
                                        href={link.url || "#"}
                                        className={`px-4 py-2 rounded ${
                                            link.active ? "bg-primary text-white" : "bg-card text-foreground hover:bg-muted/50"
                                        } ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
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
