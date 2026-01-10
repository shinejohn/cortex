import { Head, Link } from "@inertiajs/react";
import { StoreIcon, StarIcon, TagIcon, SparklesIcon, TrendingUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DowntownGuideHome() {
    return (
        <>
            <Head title="DowntownsGuide - Your Complete Guide to Local Businesses" />

            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
                {/* Hero Section */}
                <div className="relative overflow-hidden border-b-4 border-purple-600 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-5xl font-bold text-white md:text-6xl">DowntownsGuide</h1>
                            <p className="mt-4 text-2xl text-purple-100 md:text-3xl">Your Complete Guide to Local Businesses</p>
                            <p className="mt-6 text-lg text-purple-200">
                                Discover businesses, deals, reviews, and everything you need to know about your local community
                            </p>
                            <div className="mt-8 flex flex-wrap justify-center gap-4">
                                <Link href={route("downtown-guide.businesses.index")}>
                                    <Button size="lg" className="bg-card text-primary hover:bg-accent/50">
                                        <StoreIcon className="mr-2 h-5 w-5" />
                                        Browse Businesses
                                    </Button>
                                </Link>
                                <Link href={route("downtown-guide.coupons.index")}>
                                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-card/10">
                                        <TagIcon className="mr-2 h-5 w-5" />
                                        View Deals
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-foreground">Everything You Need in One Place</h2>
                        <p className="mt-4 text-lg text-muted-foreground">Discover, review, and engage with local businesses</p>
                    </div>

                    <div className="mt-12 grid gap-8 md:grid-cols-3">
                        {/* Feature 1 */}
                        <div className="rounded-xl border-2 border bg-card p-6 shadow-lg">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                                <StoreIcon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Business Directory</h3>
                            <p className="mt-2 text-muted-foreground">Find local businesses with detailed profiles, hours, contact information, and more.</p>
                            <Link href={route("downtown-guide.businesses.index")} className="mt-4 inline-block text-primary hover:text-primary">
                                Browse Businesses →
                            </Link>
                        </div>

                        {/* Feature 2 */}
                        <div className="rounded-xl border-2 border bg-card p-6 shadow-lg">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100">
                                <StarIcon className="h-6 w-6 text-pink-600" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Reviews & Ratings</h3>
                            <p className="mt-2 text-muted-foreground">Read authentic reviews from real customers and share your own experiences.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="rounded-xl border-2 border bg-card p-6 shadow-lg">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                                <TagIcon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Deals & Coupons</h3>
                            <p className="mt-2 text-muted-foreground">Save money with exclusive deals and digital coupons from local businesses.</p>
                            <Link href={route("downtown-guide.coupons.index")} className="mt-4 inline-block text-primary hover:text-primary">
                                View Deals →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="border-t-4 border bg-gradient-to-r from-purple-600 to-pink-600 py-16">
                    <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                        <SparklesIcon className="mx-auto h-12 w-12 text-white" />
                        <h2 className="mt-4 text-3xl font-bold text-white">Ready to Explore Your Local Community?</h2>
                        <p className="mt-4 text-lg text-purple-100">Join thousands of users discovering the best local businesses</p>
                        <div className="mt-8">
                            <Link href={route("downtown-guide.businesses.index")}>
                                <Button size="lg" className="bg-card text-primary hover:bg-accent/50">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
