import { Head, Link } from "@inertiajs/react";
import Layout from "@/layouts/layout";

interface Props {
    featuredCommunities?: Array<{
        id: string;
        city: string;
        state: string;
        slug: string;
        name: string;
        total_businesses?: number;
        hero_image_url?: string;
    }>;
    featuredBusinesses?: Array<{
        id: string;
        name: string;
        slug: string;
        city: string;
        state: string;
        images?: string[];
    }>;
    stats?: {
        total_businesses: number;
        total_communities: number;
        total_industries: number;
    };
}

export default function Home({ featuredCommunities, featuredBusinesses, stats }: Props) {
    return (
        <Layout>
            <Head>
                <title>AlphaSite - AI-Powered Business Pages</title>
                <meta name="description" content="Discover local businesses with AI-powered business pages" />
            </Head>

            <div className="min-h-screen bg-muted/50">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                        <div className="text-center">
                            <h1 className="text-5xl font-bold mb-6">AlphaSite</h1>
                            <p className="text-2xl text-blue-100 mb-8">AI-Powered Business Pages for Local Communities</p>
                            <div className="flex justify-center space-x-4">
                                <Link
                                    href="/directory"
                                    className="px-6 py-3 bg-card text-primary rounded-lg font-semibold hover:bg-accent/50 transition"
                                >
                                    Browse Directory
                                </Link>
                                <Link
                                    href="/get-started"
                                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                {stats && (
                    <div className="bg-card border-b border">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                                <div>
                                    <div className="text-4xl font-bold text-primary mb-2">{stats.total_businesses.toLocaleString()}</div>
                                    <div className="text-muted-foreground">Businesses</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-primary mb-2">{stats.total_communities.toLocaleString()}</div>
                                    <div className="text-muted-foreground">Communities</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-primary mb-2">{stats.total_industries.toLocaleString()}</div>
                                    <div className="text-muted-foreground">Industries</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Featured Communities */}
                {featuredCommunities && featuredCommunities.length > 0 && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <h2 className="text-3xl font-bold mb-8 text-center">Featured Communities</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredCommunities.map((community) => (
                                <Link
                                    key={community.id}
                                    href={`/community/${community.slug}`}
                                    className="bg-card rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                                >
                                    {community.hero_image_url && (
                                        <img src={community.hero_image_url} alt={community.name} className="w-full h-48 object-cover" />
                                    )}
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold mb-2">{community.name}</h3>
                                        {community.total_businesses && (
                                            <p className="text-muted-foreground">{community.total_businesses} businesses</p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Featured Businesses */}
                {featuredBusinesses && featuredBusinesses.length > 0 && (
                    <div className="bg-muted">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                            <h2 className="text-3xl font-bold mb-8 text-center">Featured Businesses</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {featuredBusinesses.map((business) => (
                                    <Link
                                        key={business.id}
                                        href={`/business/${business.slug}`}
                                        className="bg-card rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                                    >
                                        {business.images && business.images.length > 0 && (
                                            <img src={business.images[0]} alt={business.name} className="w-full h-48 object-cover" />
                                        )}
                                        <div className="p-4">
                                            <h3 className="font-semibold mb-1">{business.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {business.city}, {business.state}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* CTA Section */}
                <div className="bg-primary text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                        <p className="text-xl text-blue-100 mb-8">Claim your business and get a free AI-powered business page</p>
                        <Link
                            href="/get-started"
                            className="px-8 py-3 bg-card text-primary rounded-lg font-semibold hover:bg-accent/50 transition inline-block"
                        >
                            Claim Your Business
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
