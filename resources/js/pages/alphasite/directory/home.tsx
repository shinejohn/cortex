import { Head, Link } from "@inertiajs/react";
import { Building2, Globe, Layers, MapPin, ArrowRight, Sparkles } from "lucide-react";
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

            <div className="min-h-screen bg-muted/30">
                {/* Hero Section */}
                <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                        <div className="text-center max-w-3xl mx-auto">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm mb-6">
                                <Sparkles className="h-4 w-4" />
                                AI-Powered Business Pages
                            </div>
                            <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tight mb-6">AlphaSite</h1>
                            <p className="text-xl lg:text-2xl text-blue-100/90 mb-10">AI-Powered Business Pages for Local Communities</p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link
                                    href="/directory"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-primary rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg"
                                >
                                    Browse Directory
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="/get-started"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                {stats && (
                    <div className="bg-card border-b shadow-sm">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <Building2 className="h-7 w-7 text-primary" />
                                    <div className="text-4xl font-black text-primary">{stats.total_businesses?.toLocaleString() ?? 0}</div>
                                    <div className="text-sm text-muted-foreground font-medium">Businesses</div>
                                </div>
                                <div className="flex flex-col items-center gap-3">
                                    <Globe className="h-7 w-7 text-primary" />
                                    <div className="text-4xl font-black text-primary">{stats.total_communities?.toLocaleString() ?? 0}</div>
                                    <div className="text-sm text-muted-foreground font-medium">Communities</div>
                                </div>
                                <div className="flex flex-col items-center gap-3">
                                    <Layers className="h-7 w-7 text-primary" />
                                    <div className="text-4xl font-black text-primary">{stats.total_industries?.toLocaleString() ?? 0}</div>
                                    <div className="text-sm text-muted-foreground font-medium">Industries</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Featured Communities */}
                {featuredCommunities && featuredCommunities.length > 0 && (
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <h2 className="font-display text-3xl font-black tracking-tight text-center mb-10">Featured Communities</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredCommunities.map((community) => (
                                <Link
                                    key={community.id}
                                    href={`/community/${community.slug}`}
                                    className="group bg-card rounded-2xl overflow-hidden border-none shadow-sm hover:shadow-md transition-all"
                                >
                                    {community.hero_image_url && (
                                        <div className="overflow-hidden">
                                            <img
                                                src={community.hero_image_url}
                                                alt={community.name}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{community.name}</h3>
                                        {community.total_businesses && (
                                            <p className="text-muted-foreground flex items-center gap-1.5">
                                                <Building2 className="h-4 w-4" />
                                                {community.total_businesses} businesses
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Featured Businesses */}
                {featuredBusinesses && featuredBusinesses.length > 0 && (
                    <div className="bg-muted/50">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                            <h2 className="font-display text-3xl font-black tracking-tight text-center mb-10">Featured Businesses</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {featuredBusinesses.map((business) => (
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
                                        <div className="p-4">
                                            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{business.name}</h3>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5" />
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
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
                        <h2 className="font-display text-3xl lg:text-4xl font-black tracking-tight mb-4">Ready to Get Started?</h2>
                        <p className="text-xl text-blue-100/90 mb-8 max-w-xl mx-auto">Claim your business and get a free AI-powered business page</p>
                        <Link
                            href="/get-started"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg"
                        >
                            Claim Your Business
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
