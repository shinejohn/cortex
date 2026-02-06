import { SEO } from "@/components/common/seo";
import { CouponForm } from "@/components/day-news/coupon-form";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import type { CouponEditPageProps } from "@/types/coupon";
import { Link } from "@inertiajs/react";
import { ArrowLeft, Edit } from "lucide-react";
import { route } from "ziggy-js";

interface Props extends CouponEditPageProps {
    auth?: Auth;
}

export default function CouponEdit({ auth, coupon, categories }: Props) {
    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: `Edit: ${coupon.title}`,
                        description: "Update your coupon details.",
                        url: `/coupons/${coupon.id}/edit`,
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
                            <Edit className="size-8" />
                            Edit Coupon
                        </h1>
                        <p className="mt-2 text-muted-foreground">Update your coupon details below.</p>
                    </div>

                    {/* Form */}
                    <CouponForm categories={categories} initialData={coupon} mode="edit" />
                </main>
            </div>
        </LocationProvider>
    );
}
