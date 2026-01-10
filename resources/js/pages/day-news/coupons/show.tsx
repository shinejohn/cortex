import { Head, router, usePage } from "@inertiajs/react";
import { Building, Calendar, Copy, Percent, Ticket } from "lucide-react";
import { useState } from "react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface Coupon {
    id: string;
    title: string;
    description: string | null;
    discount_type: string;
    discount_value: number | null;
    terms: string | null;
    code: string | null;
    image: string | null;
    business_name: string;
    business_location: string | null;
    start_date: string;
    end_date: string;
    usage_limit: number | null;
    used_count: number;
    views_count: number;
    clicks_count: number;
    business: {
        id: string;
        name: string;
    } | null;
    regions: Array<{
        id: string;
        name: string;
    }>;
}

interface ShowCouponProps {
    auth?: Auth;
    coupon: Coupon;
    related: Coupon[];
}

export default function ShowCoupon() {
    const { auth, coupon, related } = usePage<ShowCouponProps>().props;
    const [copied, setCopied] = useState(false);

    const formatDiscount = () => {
        switch (coupon.discount_type) {
            case "percentage":
                return `${coupon.discount_value}% OFF`;
            case "fixed_amount":
                return `$${coupon.discount_value} OFF`;
            case "buy_one_get_one":
                return "Buy One Get One";
            case "free_item":
                return "Free Item";
            default:
                return "Special Offer";
        }
    };

    const handleUseCoupon = async () => {
        try {
            const response = await fetch(`/coupons/${coupon.id}/use`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                },
            });
            const data = await response.json();
            if (data.coupon?.code) {
                navigator.clipboard.writeText(data.coupon.code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (error) {
            console.error("Error using coupon:", error);
        }
    };

    const copyCode = () => {
        if (coupon.code) {
            navigator.clipboard.writeText(coupon.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title={`${coupon.title} - Day News`} />
                <SEO
                    type="article"
                    site="day-news"
                    data={{
                        title: coupon.title,
                        description: coupon.description || "",
                        image: coupon.image,
                        url: `/coupons/${coupon.id}`,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-8 rounded-lg border bg-card p-8">
                        {coupon.image && <img src={coupon.image} alt={coupon.title} className="mb-6 h-64 w-full rounded-lg object-cover" />}

                        <div className="mb-6 flex items-center justify-between">
                            <Badge variant="destructive" className="flex items-center gap-2 px-4 py-2 text-lg">
                                <Percent className="size-5" />
                                {formatDiscount()}
                            </Badge>
                            {coupon.code && (
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-mono text-lg">
                                        {coupon.code}
                                    </Badge>
                                    <Button variant="outline" size="sm" onClick={copyCode}>
                                        <Copy className={`mr-2 size-4 ${copied ? "text-green-500" : ""}`} />
                                        {copied ? "Copied!" : "Copy"}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <h1 className="mb-4 text-4xl font-bold">{coupon.title}</h1>

                        {coupon.description && <p className="mb-6 text-lg text-muted-foreground">{coupon.description}</p>}

                        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Building className="size-4 text-muted-foreground" />
                                <span className="font-medium">{coupon.business_name}</span>
                            </div>
                            {coupon.business_location && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <span>•</span>
                                    <span>{coupon.business_location}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="size-4" />
                                <span>
                                    Valid {new Date(coupon.start_date).toLocaleDateString()} - {new Date(coupon.end_date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {coupon.terms && (
                            <div className="mb-6 rounded-lg bg-muted p-4">
                                <h3 className="mb-2 font-semibold">Terms & Conditions</h3>
                                <p className="text-sm text-muted-foreground">{coupon.terms}</p>
                            </div>
                        )}

                        <Button onClick={handleUseCoupon} size="lg" className="w-full">
                            <Ticket className="mr-2 size-5" />
                            Use This Coupon
                        </Button>

                        {coupon.usage_limit && (
                            <p className="mt-4 text-center text-sm text-muted-foreground">
                                {coupon.used_count} of {coupon.usage_limit} uses remaining
                            </p>
                        )}
                    </div>

                    {/* Related Coupons */}
                    {related.length > 0 && (
                        <div>
                            <h2 className="mb-4 text-2xl font-bold">More Coupons</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {related.map((item) => (
                                    <div
                                        key={item.id}
                                        className="cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md"
                                        onClick={() => router.visit(`/coupons/${item.id}`)}
                                    >
                                        <h3 className="mb-2 font-semibold">{item.title}</h3>
                                        <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </LocationProvider>
    );
}
