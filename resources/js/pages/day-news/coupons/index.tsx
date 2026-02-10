import { SEO } from "@/components/common/seo";
import { CouponCard } from "@/components/day-news/coupon-card";
import { CouponFilters } from "@/components/day-news/coupon-filters";
import DayNewsHeader from "@/components/day-news/day-news-header";
import LocationPrompt from "@/components/day-news/location-prompt";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import type { CouponsIndexPageProps } from "@/types/coupon";
import { Link } from "@inertiajs/react";
import { Plus, Search, Tag, Ticket } from "lucide-react";
import { route } from "ziggy-js";

interface Props extends CouponsIndexPageProps {
    auth?: Auth;
}

export default function CouponsIndex({ auth, featuredCoupons, coupons, categories, filters, hasRegion }: Props) {
    return (
        <LocationProvider>
            <div className="min-h-screen bg-gray-50">
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Local Coupons & Deals",
                        description:
                            "Discover the best local coupons and deals from businesses in your area. Save money on restaurants, retail, services, and more.",
                        url: "/coupons",
                    }}
                />
                <DayNewsHeader auth={auth} />
                <LocationPrompt />

                <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Page header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="flex items-center gap-3 font-display text-3xl font-black tracking-tight text-gray-900">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-100">
                                    <Ticket className="size-6 text-indigo-600" />
                                </div>
                                Local Coupons & Deals
                            </h1>
                            <p className="mt-2 text-gray-600">Discover savings from businesses in your community</p>
                        </div>
                        {auth?.user && (
                            <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700">
                                <Link href={route("daynews.coupons.create")}>
                                    <Plus className="mr-2 size-4" />
                                    Submit Coupon
                                </Link>
                            </Button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="mb-8">
                        <CouponFilters categories={categories} filters={filters} hasRegion={hasRegion} />
                    </div>

                    {/* Featured coupons */}
                    {featuredCoupons.length > 0 && !filters.search && !filters.category && (
                        <section className="mb-12">
                            <h2 className="mb-4 border-b-2 border-gray-200 pb-2 font-display text-2xl font-bold tracking-tight text-gray-900">
                                Featured Deals
                            </h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {featuredCoupons.slice(0, 6).map((coupon) => (
                                    <CouponCard key={coupon.id} coupon={coupon} featured />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* All coupons */}
                    <section>
                        <h2 className="mb-4 border-b-2 border-gray-200 pb-2 font-display text-2xl font-bold tracking-tight text-gray-900">
                            {filters.search || filters.category ? "Search Results" : "All Coupons"}
                        </h2>

                        {coupons.data.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {coupons.data.map((coupon) => (
                                        <CouponCard key={coupon.id} coupon={coupon} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {coupons.last_page > 1 && (
                                    <div className="mt-8 flex items-center justify-center gap-2">
                                        {coupons.prev_page_url && (
                                            <Button variant="outline" asChild className="border-gray-300">
                                                <Link href={coupons.prev_page_url}>Previous</Link>
                                            </Button>
                                        )}
                                        <span className="px-4 text-sm text-gray-500">
                                            Page {coupons.current_page} of {coupons.last_page}
                                        </span>
                                        {coupons.next_page_url && (
                                            <Button variant="outline" asChild className="border-gray-300">
                                                <Link href={coupons.next_page_url}>Next</Link>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex min-h-[40vh] items-center justify-center">
                                <div className="text-center">
                                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
                                        <Tag className="size-8 text-gray-400" />
                                    </div>
                                    <h3 className="mb-2 font-display text-xl font-bold tracking-tight text-gray-900">No Coupons Found</h3>
                                    <p className="mx-auto max-w-md text-gray-600">
                                        {filters.search || filters.category
                                            ? "Try adjusting your filters or search terms."
                                            : hasRegion
                                              ? "There are no coupons available for your region yet. Be the first to submit one!"
                                              : "Select your location to see coupons relevant to your area."}
                                    </p>
                                    {auth?.user && (
                                        <Button className="mt-4 bg-indigo-600 text-white hover:bg-indigo-700" asChild>
                                            <Link href={route("daynews.coupons.create")}>
                                                <Plus className="mr-2 size-4" />
                                                Submit a Coupon
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* CTA Banner */}
                    <div className="mt-12 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-700 p-6 text-center text-white shadow-sm">
                        <h3 className="mb-2 font-display text-xl font-bold tracking-tight">Are you a local business?</h3>
                        <p className="mb-4 text-indigo-100">
                            Create and publish your own coupons to attract more customers.
                        </p>
                        {auth?.user ? (
                            <Button asChild variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100">
                                <Link href={route("daynews.coupons.create")}>Create a Coupon</Link>
                            </Button>
                        ) : (
                            <span className="inline-block rounded-md bg-white px-5 py-2 text-sm font-medium text-indigo-600">
                                Sign in to create a coupon
                            </span>
                        )}
                    </div>
                </main>
            </div>
        </LocationProvider>
    );
}
