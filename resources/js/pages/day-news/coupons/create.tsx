import { SEO } from "@/components/common/seo";
import { CouponForm } from "@/components/day-news/coupon-form";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import type { CouponCreatePageProps } from "@/types/coupon";
import { Link } from "@inertiajs/react";
import { ArrowLeft, Ticket } from "lucide-react";
import { route } from "ziggy-js";

interface Props extends CouponCreatePageProps {
    auth?: Auth;
}

export default function CouponCreate({ auth, categories }: Props) {
    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Submit a Coupon",
                        description: "Share a coupon code with your community. Help others save money at local businesses.",
                        url: "/coupons/create",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
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
                            <Ticket className="size-8" />
                            Submit a Coupon
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Share a coupon code with your community. Help others save money at local businesses.
                        </p>
                    </div>

                    {/* Form */}
                    <CouponForm categories={categories} mode="create" />
                </main>
            </div>
        </LocationProvider>
    );
}
