import { Head, Link } from "@inertiajs/react";
import { Building2, Crown, LayoutGrid, Star, MapPin } from "lucide-react";
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

export default function CommunityShow({ community, businesses, categories, activeCategory }: Props) {
    return (
        <Layout>
            <Head>
                <title>{community.name} - AlphaSite</title>
                <meta name="description" content={community.description || `Businesses in ${community.name}`} />
            </Head>

            <div className="min-h-screen bg-muted/30">
                {/* Hero Section */}
                <div className="relative h-72 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 overflow-hidden">
                    {community.hero_image_url && (
                        <img src={community.hero_image_url} alt={community.name} className="w-full h-full object-cover opacity-40" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                        <div className="text-center px-4">
                            <h1 className="font-display text-4xl lg:text-5xl font-black tracking-tight mb-3">{community.name}</h1>
                            {community.description && <p className="text-xl text-blue-100/90 max-w-2xl mx-auto">{community.description}</p>}
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="bg-card border-b shadow-sm">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            {community.total_businesses !== undefined && (
                                <div className="flex flex-col items-center gap-2">
                                    <Building2 className="h-6 w-6 text-primary" />
                                    <div className="text-3xl font-black text-primary">{community.total_businesses}</div>
                                    <div className="text-sm text-muted-foreground font-medium">Total Businesses</div>
                                </div>
                            )}
                            {community.premium_businesses !== undefined && (
                                <div className="flex flex-col items-center gap-2">
                                    <Crown className="h-6 w-6 text-primary" />
                                    <div className="text-3xl font-black text-primary">{community.premium_businesses}</div>
                                    <div className="text-sm text-muted-foreground font-medium">Premium Businesses</div>
                                </div>
                            )}
                            {community.total_categories !== undefined && (
                                <div className="flex flex-col items-center gap-2">
                                    <LayoutGrid className="h-6 w-6 text-primary" />
                                    <div className="text-3xl font-black text-primary">{community.total_categories}</div>
                                    <div className="text-sm text-muted-foreground font-medium">Categories</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Categories Filter */}
                {categories && categories.length > 0 && (
                    <div className="bg-card border-b">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                <Link
                                    href={`/community/${community.slug}`}
                                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                                        !activeCategory
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "bg-muted text-foreground hover:bg-muted/80"
                                    }`}
                                >
                                    All
                                </Link>
                                {categories.map((category) => (
                                    <Link
                                        key={category.id}
                                        href={`/community/${community.slug}/${category.slug}`}
                                        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                                            activeCategory === category.slug
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "bg-muted text-foreground hover:bg-muted/80"
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
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {businesses.data.map((business) => (
                            <Link
                                key={business.id}
                                href={`/business/${business.slug}`}
                                className="group bg-card rounded-2xl overflow-hidden border-none shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        {business.images && business.images.length > 0 && (
                                            <img
                                                src={business.images[0]}
                                                alt={business.name}
                                                className="w-20 h-20 object-cover rounded-xl shrink-0"
                                            />
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
                                                    <span className="truncate">{business.address}</span>
                                                </p>
                                            )}
                                        </div>
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
