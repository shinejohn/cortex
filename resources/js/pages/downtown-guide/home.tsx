import { Head, Link } from "@inertiajs/react";
import { SparklesIcon, StoreIcon, TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { route } from "ziggy-js";
import { GridSection } from "@/components/common/grid-section";
import { GridCard } from "@/components/common/grid-card";
import { Footer } from "@/components/common/footer";

interface HomePageProps {
    featuredBusinesses: Array<{
        id: string;
        name: string;
        slug: string;
        category: string;
        rating: number;
        review_count: number;
        image: string;
        description: string;
        address: string;
        city: string;
        state: string;
    }>;
    recentCoupons: Array<{
        id: string;
        title: string;
        discount: string;
        type: string;
        business: {
            name: string;
            slug: string;
        };
        expires_at: string;
    }>;
}

export default function DowntownGuideHome({ featuredBusinesses, recentCoupons }: HomePageProps) {
    return (
        <div className="min-h-screen bg-background">
            <Head title="DowntownsGuide - Your Complete Guide to Local Businesses" />

            {/* Hero Section */}
            <div className="relative overflow-hidden border-b-4 border-primary bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl font-bold md:text-6xl mb-4">DowntownsGuide</h1>
                    <p className="text-2xl text-purple-100 md:text-3xl mb-8">Discover the Heart of Your City</p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href={route("downtown-guide.businesses.index")}>
                            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold">
                                <StoreIcon className="mr-2 h-5 w-5" />
                                Browse Directory
                            </Button>
                        </Link>
                        <Link href={route("downtown-guide.coupons.index")}>
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold">
                                <TagIcon className="mr-2 h-5 w-5" />
                                View Deals
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Featured Businesses Section using shared Grid components */}
            {featuredBusinesses && featuredBusinesses.length > 0 ? (
                <GridSection
                    title="Featured Local Businesses"
                    description="Top-rated spots recommended by locals"
                    viewAllHref={route('downtown-guide.businesses.index')}
                    viewAllText="View Directory"
                    promoteHref="#"
                    promoteText="List Your Business"
                    className="bg-background py-16"
                >
                    {featuredBusinesses.map((business) => (
                        <GridCard
                            key={business.id}
                            id={business.id}
                            href={route('downtown-guide.businesses.show', business.slug)}
                            image={business.image || "/images/business-placeholder.jpg"}
                            imageAlt={business.name}
                            badge={business.category}
                            title={business.name}
                            actions={
                                <div className="flex items-center text-sm text-yellow-600 font-medium">
                                    ★ {Number(business.rating).toFixed(1)} ({business.review_count})
                                </div>
                            }
                        >
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{business.description}</p>
                            <div className="text-xs text-muted-foreground mt-auto">
                                {business.city}, {business.state}
                            </div>
                        </GridCard>
                    ))}
                </GridSection>
            ) : (
                <div className="py-20 text-center bg-muted/30">
                    <h3 className="text-xl font-medium text-muted-foreground">No featured businesses found. Check back soon!</h3>
                </div>
            )}

            {/* Coupons Section */}
            {recentCoupons && recentCoupons.length > 0 && (
                <div className="bg-muted/50 py-16 border-t border-b">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight">Latest Deals & Coupons</h2>
                                <p className="text-muted-foreground mt-2">Exclusive savings from local merchants</p>
                            </div>
                            <Link href={route('downtown-guide.coupons.index')} className="text-primary hover:underline font-semibold hidden sm:block">
                                View All Deals →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentCoupons.map((coupon) => (
                                <div key={coupon.id} className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-primary/10 text-primary p-3 rounded-full">
                                            <TagIcon className="h-6 w-6" />
                                        </div>
                                        <span className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                                            Exp: {coupon.expires_at}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{coupon.title}</h3>
                                    <div className="mt-auto pt-4 border-t flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">at {coupon.business.name}</span>
                                        <Button size="sm">Get Deal</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* CTA Section */}
            <div className="bg-background py-20 text-center">
                <div className="mx-auto max-w-4xl px-4">
                    <SparklesIcon className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h2 className="text-3xl font-bold mb-4">Own a Business Downtown?</h2>
                    <p className="text-lg text-muted-foreground mb-8">Join thousands of businesses connecting with local customers every day.</p>
                    <Button size="lg" className="px-8">Get Listed Today</Button>
                </div>
            </div>

            <Footer />
        </div>
    );
}
