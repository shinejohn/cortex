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
            <div className="min-h-screen bg-gray-50">
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

                <main className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back link */}
                    <div className="mb-6">
                        <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700">
                            <Link href={route("daynews.coupons.index")}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back to Coupons
                            </Link>
                        </Button>
                    </div>

                    {/* Page header */}
                    <div className="mb-8 flex items-center">
                        <div className="mr-4 rounded-lg bg-indigo-100 p-3">
                            <Edit className="size-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="font-display text-3xl font-black tracking-tight text-gray-900">
                                Edit Coupon
                            </h1>
                            <p className="mt-1 text-gray-600">Update your coupon details below.</p>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="overflow-hidden rounded-xl border-none bg-white shadow-sm">
                        <div className="p-6">
                            <CouponForm categories={categories} initialData={coupon} mode="edit" />
                        </div>
                    </div>
                </main>
            </div>
        </LocationProvider>
    );
}
