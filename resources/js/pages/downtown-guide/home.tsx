import { Head, Link } from "@inertiajs/react";
import { ChevronRight, MapPin, MessageSquare, Search, SparklesIcon, Star, StoreIcon, TagIcon, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { route } from "ziggy-js";
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
    categories?: Array<{
        slug: string;
        title: string;
        count: number;
    }>;
    trending?: Array<{
        id: string;
        name: string;
        slug: string;
        category: string;
        rating: number;
        review_count: number;
        image: string;
        city: string;
        state: string;
    }>;
    communityActivity?: Array<{
        id: string;
        rating: number;
        content: string;
        created_at: string;
        user: {
            name: string;
            avatar?: string | null;
        };
        business: {
            name: string;
            slug: string;
        };
    }>;
    regionName?: string | null;
    hasRegion?: boolean;
}

export default function DowntownGuideHome({ featuredBusinesses, recentCoupons, categories, trending, communityActivity, regionName, hasRegion }: HomePageProps) {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="min-h-screen bg-background">
            <Head title="DowntownsGuide - Your Complete Guide to Local Businesses" />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 md:py-24">
                <div className="absolute inset-0 opacity-5">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />
                </div>
                <div className="container relative mx-auto px-4 text-center">
                    <h1 className="mb-4 font-display text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
                        Discover <span className="text-primary">{regionName ? `${regionName}'s Downtown` : "Your Downtown"}</span>
                    </h1>
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
                        {hasRegion
                            ? `Your ultimate guide to local food, fun, and nightlife in ${regionName ?? "your area"}.`
                            : "Your ultimate guide to local food, fun, and nightlife. Find the best spots in your area."}
                    </p>

                    {/* Search Bar */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (searchQuery.trim()) {
                                window.location.href = route("downtown-guide.search.index") + "?q=" + encodeURIComponent(searchQuery.trim());
                            }
                        }}
                        className="mx-auto mb-6 max-w-xl"
                    >
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for restaurants, bars, activities..."
                                className="w-full rounded-full border-2 border-primary/20 bg-background py-4 pl-12 pr-32 text-lg shadow-lg transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                            />
                            <Button type="submit" size="lg" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full">
                                Search
                            </Button>
                        </div>
                    </form>

                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href={route("downtown-guide.businesses.index")}>
                            <Button size="lg" className="font-bold">
                                <StoreIcon className="mr-2 h-5 w-5" />
                                Browse Directory
                            </Button>
                        </Link>
                        <Link href={route("downtown-guide.coupons.index")}>
                            <Button size="lg" variant="outline" className="font-bold">
                                <TagIcon className="mr-2 h-5 w-5" />
                                View Deals
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Businesses Section */}
            {featuredBusinesses && featuredBusinesses.length > 0 ? (
                <section className="bg-muted/50 py-12">
                    <div className="container mx-auto px-4">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="font-display text-2xl font-black tracking-tight">Popular Places</h2>
                            <Button variant="ghost" asChild>
                                <Link href={route("downtown-guide.businesses.index")}>
                                    View all <ChevronRight className="ml-1 size-4" />
                                </Link>
                            </Button>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {featuredBusinesses.map((business) => (
                                <Link key={business.id} href={route("downtown-guide.businesses.show", business.slug)}>
                                    <Card className="group overflow-hidden border-none shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                                        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                                            {business.image ? (
                                                <img
                                                    src={business.image || "/images/business-placeholder.jpg"}
                                                    alt={business.name}
                                                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex size-full items-center justify-center text-muted-foreground">
                                                    <MapPin className="size-12" />
                                                </div>
                                            )}
                                            {business.category && (
                                                <span className="absolute left-3 top-3 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium capitalize">
                                                    {business.category}
                                                </span>
                                            )}
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="mb-1 truncate text-lg font-semibold">{business.name}</h3>
                                            <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{business.description}</p>
                                            <div className="flex items-center gap-1.5 text-sm text-yellow-600 font-medium">
                                                <span>★ {Number(business.rating).toFixed(1)}</span>
                                                <span className="text-muted-foreground">({business.review_count})</span>
                                            </div>
                                            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                                                <MapPin className="size-3.5 shrink-0" />
                                                <span className="truncate">{business.city}, {business.state}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            ) : (
                <div className="flex min-h-[30vh] items-center justify-center bg-muted/30">
                    <div className="text-center">
                        <MapPin className="mx-auto mb-4 size-16 text-muted-foreground" />
                        <h3 className="mb-2 text-xl font-bold">No featured businesses found</h3>
                        <p className="text-muted-foreground">Check back soon!</p>
                    </div>
                </div>
            )}

            {/* Coupons Section */}
            {recentCoupons && recentCoupons.length > 0 && (
                <section className="bg-primary/5 py-12">
                    <div className="container mx-auto px-4">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="font-display text-2xl font-black tracking-tight">Hot Deals</h2>
                            <Button variant="ghost" asChild>
                                <Link href={route("downtown-guide.coupons.index")}>
                                    View all coupons <ChevronRight className="ml-1 size-4" />
                                </Link>
                            </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {recentCoupons.map((coupon) => (
                                <Card key={coupon.id} className="group overflow-hidden border-none shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                                    <CardContent className="p-0">
                                        <div className="flex items-stretch">
                                            <div className="flex min-w-24 items-center justify-center bg-primary p-4">
                                                <span className="text-center text-xl font-bold text-primary-foreground">{coupon.discount}</span>
                                            </div>
                                            <div className="flex-1 p-4">
                                                <h3 className="mb-1 font-semibold leading-tight">{coupon.title}</h3>
                                                <p className="mb-2 text-sm text-muted-foreground">at {coupon.business.name}</p>
                                                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    Exp: {coupon.expires_at}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Categories Section */}
            {categories && categories.length > 0 && (
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="font-display text-2xl font-black tracking-tight">Browse by Category</h2>
                            <Button variant="ghost" asChild>
                                <Link href={route("downtown-guide.businesses.index")}>
                                    All categories <ChevronRight className="ml-1 size-4" />
                                </Link>
                            </Button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                            {categories.map((cat) => (
                                <Link key={cat.slug} href={route("downtown-guide.businesses.index") + `?category=${encodeURIComponent(cat.title)}`}>
                                    <Card className="group overflow-hidden border-none shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                                        <CardContent className="flex items-center gap-4 p-4">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                <StoreIcon className="size-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="truncate font-semibold capitalize">{cat.title}</h3>
                                                <p className="text-sm text-muted-foreground">{cat.count} {cat.count === 1 ? "business" : "businesses"}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Trending Businesses Section */}
            {trending && trending.length > 0 && (
                <section className="bg-muted/30 py-12">
                    <div className="container mx-auto px-4">
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="size-5 text-primary" />
                                <h2 className="font-display text-2xl font-black tracking-tight">Trending Now</h2>
                            </div>
                            <Button variant="ghost" asChild>
                                <Link href={route("downtown-guide.businesses.index")}>
                                    View all <ChevronRight className="ml-1 size-4" />
                                </Link>
                            </Button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {trending.map((biz) => (
                                <Link key={biz.id} href={route("downtown-guide.businesses.show", biz.slug)}>
                                    <Card className="group overflow-hidden border-none shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                                        <CardContent className="flex items-center gap-4 p-4">
                                            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                                                {biz.image ? (
                                                    <img src={biz.image} alt={biz.name} className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                                ) : (
                                                    <div className="flex size-full items-center justify-center text-muted-foreground">
                                                        <MapPin className="size-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate font-semibold">{biz.name}</h3>
                                                <p className="text-sm capitalize text-muted-foreground">{biz.category}</p>
                                                <div className="mt-1 flex items-center gap-2 text-sm">
                                                    <span className="flex items-center gap-1 font-medium text-yellow-600">
                                                        <Star className="size-3.5 fill-yellow-500 text-yellow-500" />
                                                        {Number(biz.rating).toFixed(1)}
                                                    </span>
                                                    <span className="text-muted-foreground">({biz.review_count})</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Community Activity Section */}
            {communityActivity && communityActivity.length > 0 && (
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        <div className="mb-8 flex items-center gap-2">
                            <MessageSquare className="size-5 text-primary" />
                            <h2 className="font-display text-2xl font-black tracking-tight">Community Activity</h2>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {communityActivity.map((activity) => (
                                <Card key={activity.id} className="overflow-hidden border-none shadow-sm">
                                    <CardContent className="p-4">
                                        <div className="mb-3 flex items-center gap-3">
                                            <Avatar className="size-8">
                                                <AvatarImage src={activity.user?.avatar ?? undefined} />
                                                <AvatarFallback className="text-xs font-bold">
                                                    {activity.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{activity.user?.name ?? "Anonymous"}</p>
                                                <p className="text-xs text-muted-foreground">reviewed <Link href={route("downtown-guide.businesses.show", activity.business?.slug ?? "")} className="font-medium text-primary hover:underline">{activity.business?.name ?? "a business"}</Link></p>
                                            </div>
                                            <div className="flex items-center gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`size-3 ${i < (activity.rating ?? 0) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="line-clamp-2 text-sm text-muted-foreground">{activity.content ?? ""}</p>
                                        <p className="mt-2 text-xs text-muted-foreground">{activity.created_at ?? ""}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-16">
                <div className="container mx-auto px-4 text-center">
                    <SparklesIcon className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h2 className="font-display text-3xl font-black tracking-tight mb-4">Own a Business Downtown?</h2>
                    <p className="text-lg text-muted-foreground mb-8 mx-auto max-w-2xl">
                        Join thousands of businesses connecting with local customers every day.
                    </p>
                    <Button size="lg" className="px-8">Get Listed Today</Button>
                </div>
            </section>

            <Footer />
        </div>
    );
}
