import { Head, Link } from "@inertiajs/react";
import Layout from "@/layouts/layout";
import { Business } from "@/types";

interface Props {
    community: {
        id: string;
        city: string;
        state: string;
        slug: string;
        name: string;
        description?: string;
        hero_image_url?: string;
        total_businesses?: number;
        premium_businesses?: number;
        total_categories?: number;
    };
    businesses: {
        data: Business[];
        links: any;
        meta: any;
    };
    categories?: Array<{
        id: string;
        name: string;
        slug: string;
    }>;
    activeCategory?: string;
}

export default function CommunityShow({
    community,
    businesses,
    categories,
    activeCategory,
}: Props) {
    return (
        <Layout>
            <Head>
                <title>{community.name} - AlphaSite</title>
                <meta name="description" content={community.description || `Businesses in ${community.name}`} />
            </Head>

            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
                    {community.hero_image_url && (
                        <img
                            src={community.hero_image_url}
                            alt={community.name}
                            className="w-full h-full object-cover opacity-50"
                        />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold mb-2">{community.name}</h1>
                            {community.description && (
                                <p className="text-xl text-blue-100">{community.description}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            {community.total_businesses !== undefined && (
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {community.total_businesses}
                                    </div>
                                    <div className="text-gray-600">Total Businesses</div>
                                </div>
                            )}
                            {community.premium_businesses !== undefined && (
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {community.premium_businesses}
                                    </div>
                                    <div className="text-gray-600">Premium Businesses</div>
                                </div>
                            )}
                            {community.total_categories !== undefined && (
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {community.total_categories}
                                    </div>
                                    <div className="text-gray-600">Categories</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Categories Filter */}
                {categories && categories.length > 0 && (
                    <div className="bg-white border-b border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <div className="flex space-x-4 overflow-x-auto">
                                <Link
                                    href={`/community/${community.slug}`}
                                    className={`px-4 py-2 rounded whitespace-nowrap ${
                                        !activeCategory
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    All
                                </Link>
                                {categories.map((category) => (
                                    <Link
                                        key={category.id}
                                        href={`/community/${community.slug}/${category.slug}`}
                                        className={`px-4 py-2 rounded whitespace-nowrap ${
                                            activeCategory === category.slug
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                    >
                                        {category.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Businesses Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {businesses.data.map((business) => (
                            <Link
                                key={business.id}
                                href={`/business/${business.slug}`}
                                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
                            >
                                <div className="flex items-start space-x-4">
                                    {business.images && business.images.length > 0 && (
                                        <img
                                            src={business.images[0]}
                                            alt={business.name}
                                            className="w-24 h-24 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold mb-1">{business.name}</h3>
                                        {business.rating && (
                                            <div className="flex items-center text-sm text-gray-600 mb-2">
                                                <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                <span>{business.rating}</span>
                                                {business.reviews_count && (
                                                    <span className="ml-1">({business.reviews_count})</span>
                                                )}
                                            </div>
                                        )}
                                        {business.address && (
                                            <p className="text-sm text-gray-500">
                                                {business.address}
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
                                            link.active
                                                ? "bg-blue-600 text-white"
                                                : "bg-white text-gray-700 hover:bg-gray-50"
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

