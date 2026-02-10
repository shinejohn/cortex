import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, BadgeCheck, Calendar, CheckIcon, Clock, Copy, SparklesIcon, Star, TagIcon } from "lucide-react";
import { useState } from "react";
import { BusinessCard } from "@/components/shared/business/BusinessCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
    const isExpired = coupon.end_date && new Date(coupon.end_date) < new Date();
    const isExpiringSoon = coupon.end_date && !isExpired && new Date(coupon.end_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return (
        <>
            <Head title={`${coupon.title} - DowntownsGuide`} />

            <div className="min-h-screen bg-background">
                <main className="container mx-auto px-4 py-8">
                    {/* Back link */}
                    <Link
                        href={route("downtown-guide.coupons.index")}
                        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Coupons
                    </Link>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Coupon Card */}
                            <Card className={isExpired ? "opacity-60" : ""}>
                                <CardContent className="p-0">
                                    {/* Header with discount */}
                                    <div className="flex items-stretch">
                                        <div className="flex min-w-32 items-center justify-center bg-primary p-6">
                                            <span className="text-center text-2xl font-bold text-primary-foreground">
                                                {coupon.discount_type === "percentage" && `${coupon.discount_value}% OFF`}
                                                {coupon.discount_type === "fixed" && `$${coupon.discount_value} OFF`}
                                                {isDeal && "Special Deal"}
                                            </span>
                                        </div>
                                        <div className="flex-1 p-6">
                                            <div className="mb-2 flex items-start gap-2">
                                                <h1 className="flex-1 text-2xl font-bold">{coupon.title}</h1>
                                            </div>
                                            {coupon.business_name && (
                                                <p className="text-lg text-muted-foreground">{coupon.business_name}</p>
                                            )}
                                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                                {isExpired && <Badge variant="destructive">Expired</Badge>}
                                                {isExpiringSoon && (
                                                    <Badge variant="outline" className="border-amber-500 text-amber-600">Expiring Soon</Badge>
                                                )}
                                                <Badge variant="secondary">{isDeal ? "DEAL" : "COUPON"}</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Code section */}
                                    {coupon.code && (
                                        <>
                                            <div className="flex items-center justify-between bg-muted/50 p-4">
                                                <div>
                                                    <p className="mb-1 text-sm font-medium text-muted-foreground">Coupon Code</p>
                                                    <p className="font-mono text-xl font-bold">{coupon.code}</p>
                                                </div>
                                                <Button onClick={handleCopyCode} disabled={!!isExpired}>
                                                    {copied ? (
                                                        <>
                                                            <CheckIcon className="mr-2 h-4 w-4" />
                                                            Copied!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            Copy Code
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                            <Separator />
                                        </>
                                    )}

                                    {/* Validity dates */}
                                    <div className="flex flex-wrap gap-6 p-4">
                                        {coupon.start_date && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="size-4" />
                                                <span>Valid from {new Date(coupon.start_date).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        {coupon.end_date && (
                                            <div className={`flex items-center gap-2 text-sm ${isExpired ? "text-destructive" : isExpiringSoon ? "text-amber-600" : "text-muted-foreground"}`}>
                                                <Clock className="size-4" />
                                                <span>
                                                    {isExpired ? "Expired on" : "Valid until"} {new Date(coupon.end_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Usage Info */}
                                    {coupon.usage_limit && (
                                        <div className="px-4 pb-4 text-sm text-muted-foreground">
                                            {coupon.used_count || 0} of {coupon.usage_limit} uses
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Description */}
                            {coupon.description && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Description</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="whitespace-pre-wrap text-muted-foreground">{coupon.description}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Terms */}
                            {coupon.terms && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Terms & Conditions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{coupon.terms}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Related Coupons */}
                            {relatedCoupons.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">More from {coupon.business?.name ?? "this business"}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {relatedCoupons.map((related) => (
                                            <Link
                                                key={related.id}
                                                href={route("downtown-guide.coupons.show", related.slug)}
                                                className="block rounded-lg border p-3 transition-colors hover:bg-muted"
                                            >
                                                <p className="font-medium">{related.title}</p>
                                            </Link>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Code/Action */}
                            <Card>
                                <CardContent className="pt-6">
                                    {coupon.code ? (
                                        <Button onClick={handleCopyCode} className="w-full" disabled={!!isExpired}>
                                            {copied ? (
                                                <>
                                                    <CheckIcon className="mr-2 h-4 w-4" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Copy Code
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button onClick={handleApply} disabled={applying} className="w-full">
                                            {applying ? "Applying..." : "Get Deal"}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Business Info */}
                            {coupon.business && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">About the Business</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <BusinessCard business={coupon.business} theme="downtownsguide" showDescription={false} />
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
