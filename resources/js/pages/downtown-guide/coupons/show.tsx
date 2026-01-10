import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeftIcon, CheckIcon, CopyIcon, SparklesIcon, TagIcon } from "lucide-react";
import { useState } from "react";
import { BusinessCard } from "@/components/shared/business/BusinessCard";
import { Button } from "@/components/ui/button";

interface DowntownGuideCouponsShowProps {
    coupon: {
        id: string;
        title: string;
        description?: string;
        discount_type: string;
        discount_value?: number;
        code?: string;
        image?: string;
        business_name?: string;
        business_location?: string;
        terms?: string;
        start_date?: string;
        end_date?: string;
        usage_limit?: number;
        used_count?: number;
        business?: {
            id: string;
            name: string;
            slug?: string;
        };
    };
    relatedCoupons: Array<{
        id: string;
        title: string;
        discount_type: string;
        slug?: string;
    }>;
}

export default function DowntownGuideCouponsShow({ coupon, relatedCoupons }: DowntownGuideCouponsShowProps) {
    const [copied, setCopied] = useState(false);
    const [applying, setApplying] = useState(false);

    const handleCopyCode = () => {
        if (coupon.code) {
            navigator.clipboard.writeText(coupon.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleApply = async () => {
        setApplying(true);
        try {
            await router.post(route("downtown-guide.coupons.apply", coupon.id));
        } catch (_error) {
            // Error handling
        } finally {
            setApplying(false);
        }
    };

    const isDeal = !["percentage", "fixed"].includes(coupon.discount_type);

    return (
        <>
            <Head title={`${coupon.title} - DowntownsGuide`} />

            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
                {/* Header */}
                <div className="border-b-4 border-purple-600 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <Link
                            href={route("downtown-guide.coupons.index")}
                            className="mb-4 inline-flex items-center gap-2 text-purple-100 hover:text-white"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            <span>Back to Deals & Coupons</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-card/20 p-2 backdrop-blur-sm">
                                {isDeal ? <SparklesIcon className="h-6 w-6 text-white" /> : <TagIcon className="h-6 w-6 text-white" />}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{coupon.title}</h1>
                                {coupon.business_name && <p className="mt-1 text-sm text-purple-100">{coupon.business_name}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Image */}
                            {coupon.image && (
                                <div className="overflow-hidden rounded-xl border-2 border bg-card shadow-lg">
                                    <img src={coupon.image} alt={coupon.title} className="h-full w-full object-cover" />
                                </div>
                            )}

                            {/* Details */}
                            <div className="rounded-xl border-2 border bg-card p-6 shadow-lg">
                                <div className="mb-4 flex items-center gap-2">
                                    {isDeal ? (
                                        <>
                                            <SparklesIcon className="h-5 w-5 text-primary" />
                                            <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary">DEAL</span>
                                        </>
                                    ) : (
                                        <>
                                            <TagIcon className="h-5 w-5 text-primary" />
                                            <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary">COUPON</span>
                                        </>
                                    )}
                                </div>

                                <h2 className="mb-4 text-2xl font-bold text-foreground">{coupon.title}</h2>

                                {coupon.description && <p className="mb-6 text-foreground">{coupon.description}</p>}

                                {/* Discount Info */}
                                <div className="mb-6 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4">
                                    <div className="text-3xl font-bold text-primary">
                                        {coupon.discount_type === "percentage" && `${coupon.discount_value}% OFF`}
                                        {coupon.discount_type === "fixed" && `$${coupon.discount_value} OFF`}
                                        {isDeal && "Special Deal"}
                                    </div>
                                </div>

                                {/* Terms */}
                                {coupon.terms && (
                                    <div className="mb-6">
                                        <h3 className="mb-2 font-semibold text-foreground">Terms & Conditions</h3>
                                        <p className="text-sm text-muted-foreground">{coupon.terms}</p>
                                    </div>
                                )}

                                {/* Dates */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    {coupon.start_date && (
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">Valid From</p>
                                            <p className="text-sm font-semibold text-foreground">
                                                {new Date(coupon.start_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                    {coupon.end_date && (
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">Expires</p>
                                            <p className="text-sm font-semibold text-foreground">{new Date(coupon.end_date).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Usage Info */}
                                {coupon.usage_limit && (
                                    <div className="mt-4 text-sm text-muted-foreground">
                                        {coupon.used_count || 0} of {coupon.usage_limit} uses
                                    </div>
                                )}
                            </div>

                            {/* Related Coupons */}
                            {relatedCoupons.length > 0 && (
                                <div className="rounded-xl border-2 border bg-card p-6 shadow-lg">
                                    <h3 className="mb-4 text-lg font-bold text-foreground">More Deals & Coupons</h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {relatedCoupons.map((related) => (
                                            <Link
                                                key={related.id}
                                                href={route("downtown-guide.coupons.show", related.slug)}
                                                className="rounded-lg border border p-4 hover:bg-accent/50"
                                            >
                                                <h4 className="font-semibold text-foreground">{related.title}</h4>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Code/Action */}
                            <div className="rounded-xl border-2 border bg-card p-6 shadow-lg">
                                {coupon.code ? (
                                    <>
                                        <h3 className="mb-4 text-lg font-bold text-foreground">Coupon Code</h3>
                                        <div className="mb-4 rounded-lg bg-accent p-4 text-center">
                                            <p className="font-mono text-2xl font-bold text-purple-900">{coupon.code}</p>
                                        </div>
                                        <Button onClick={handleCopyCode} className="w-full bg-primary hover:bg-primary">
                                            {copied ? (
                                                <>
                                                    <CheckIcon className="mr-2 h-4 w-4" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <CopyIcon className="mr-2 h-4 w-4" />
                                                    Copy Code
                                                </>
                                            )}
                                        </Button>
                                    </>
                                ) : (
                                    <Button onClick={handleApply} disabled={applying} className="w-full bg-primary hover:bg-primary">
                                        {applying ? "Applying..." : "Get Deal"}
                                    </Button>
                                )}
                            </div>

                            {/* Business Info */}
                            {coupon.business && (
                                <div className="rounded-xl border-2 border bg-card p-6 shadow-lg">
                                    <h3 className="mb-4 text-lg font-bold text-foreground">Business</h3>
                                    <BusinessCard business={coupon.business} theme="downtownsguide" showDescription={false} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
