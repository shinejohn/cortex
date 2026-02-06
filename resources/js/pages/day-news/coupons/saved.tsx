import { SEO } from "@/components/common/seo";
import { CouponCard } from "@/components/day-news/coupon-card";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import type { SavedCouponsPageProps } from "@/types/coupon";
import { Link } from "@inertiajs/react";
import { ArrowLeft, Bookmark, Tag } from "lucide-react";
import { route } from "ziggy-js";

interface Props extends SavedCouponsPageProps {
    auth?: Auth;
}

export default function SavedCoupons({ auth, coupons }: Props) {
    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Saved Coupons",
                        description: "Your saved coupons and deals.",
                        url: "/saved-coupons",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back link */}
                    <div className="mb-6">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route("daynews.coupons.index")}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back to Coupons
                            </Link>
                        </Button>
                    </div>

                    {/* Page header */}
                    <div className="mb-8">
                        <h1 className="flex items-center gap-2 font-serif text-3xl font-bold">
                            <Bookmark className="size-8" />
                            Saved Coupons
                        </h1>
                        <p className="mt-1 text-muted-foreground">Coupons you've bookmarked for later</p>
                    </div>

                    {/* Saved coupons grid */}
                    {coupons.data.length > 0 ? (
                        <>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {coupons.data.map((coupon) => (
                                    <CouponCard
                                        key={coupon.id}
                                        coupon={{
                                            id: coupon.id,
                                            title: coupon.title,
                                            slug: coupon.slug,
                                            code: coupon.code,
                                            discount_display: coupon.discount_display,
                                            discount_type: "percentage", // Default, not used for display
                                            valid_from: "",
                                            valid_until: coupon.valid_until,
                                            category: "other",
                                            is_verified: false,
                                            score: 0,
                                            upvotes_count: 0,
                                            downvotes_count: 0,
                                            saves_count: 0,
                                            business: {
                                                id: coupon.business.id,
                                                name: coupon.business.name,
                                                slug: "",
                                                images: coupon.business.images,
                                            },
                                            regions: [],
                                            is_saved: true, // Always true for saved coupons
                                        }}
                                        compact
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {coupons.last_page > 1 && (
                                <div className="mt-8 flex items-center justify-center gap-2">
                                    {coupons.prev_page_url && (
                                        <Button variant="outline" asChild>
                                            <Link href={coupons.prev_page_url}>Previous</Link>
                                        </Button>
                                    )}
                                    <span className="px-4 text-sm text-muted-foreground">
                                        Page {coupons.current_page} of {coupons.last_page}
                                    </span>
                                    {coupons.next_page_url && (
                                        <Button variant="outline" asChild>
                                            <Link href={coupons.next_page_url}>Next</Link>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex min-h-[40vh] items-center justify-center">
                            <div className="text-center">
                                <Tag className="mx-auto mb-4 size-16 text-muted-foreground" />
                                <h3 className="mb-2 text-xl font-bold">No Saved Coupons</h3>
                                <p className="mx-auto max-w-md text-muted-foreground">
                                    You haven't saved any coupons yet. Browse deals and click the bookmark icon to save them for later.
                                </p>
                                <Button className="mt-4" asChild>
                                    <Link href={route("daynews.coupons.index")}>Browse Coupons</Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </LocationProvider>
    );
}
