import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeftIcon, CopyIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/layouts/app-layout";

interface PromoCode {
    id: string;
    code: string;
    description: string | null;
    type: "percentage" | "fixed";
    value: number;
    min_purchase: number | null;
    max_discount: number | null;
    usage_limit: number | null;
    usages_count: number;
    is_active: boolean;
    starts_at: string | null;
    expires_at: string | null;
    applicable_to: string[] | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    promoCode: PromoCode;
}

export default function PromoCodeShow({ promoCode }: Props) {
    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this promo code?")) {
            router.delete(route("promo-codes.destroy", promoCode.id) as string);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(promoCode.code);
    };

    const isExpired = promoCode.expires_at && new Date(promoCode.expires_at) < new Date();
    const usagePercentage = promoCode.usage_limit
        ? Math.round((promoCode.usages_count / promoCode.usage_limit) * 100)
        : null;

    return (
        <AppLayout>
            <Head title={`Promo Code: ${promoCode.code}`} />
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-4xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route("promo-codes.index") as string}>
                                <ArrowLeftIcon className="mr-2 size-4" />
                                Back to Promo Codes
                            </Link>
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route("promo-codes.edit", promoCode.id) as string}>
                                    <PencilIcon className="mr-2 size-3" />
                                    Edit
                                </Link>
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleDelete}>
                                <Trash2Icon className="mr-2 size-3" />
                                Delete
                            </Button>
                        </div>
                    </div>

                    {/* Code Display */}
                    <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm mb-6">
                        <CardContent className="p-8 text-center">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <span className="font-mono text-4xl font-black tracking-wider">{promoCode.code}</span>
                                <Button variant="outline" size="icon" onClick={handleCopy} title="Copy code">
                                    <CopyIcon className="size-4" />
                                </Button>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <Badge variant={promoCode.is_active && !isExpired ? "default" : "secondary"}>
                                    {isExpired ? "Expired" : promoCode.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant="outline">
                                    {promoCode.type === "percentage"
                                        ? `${promoCode.value}% Off`
                                        : `$${Number(promoCode.value).toFixed(2)} Off`}
                                </Badge>
                            </div>
                            {promoCode.description && (
                                <p className="mt-4 text-muted-foreground">{promoCode.description}</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Details */}
                        <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Type</span>
                                    <span className="capitalize">{promoCode.type}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Value</span>
                                    <span>
                                        {promoCode.type === "percentage"
                                            ? `${promoCode.value}%`
                                            : `$${Number(promoCode.value).toFixed(2)}`}
                                    </span>
                                </div>
                                {promoCode.min_purchase && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Min. Purchase</span>
                                        <span>${Number(promoCode.min_purchase).toFixed(2)}</span>
                                    </div>
                                )}
                                {promoCode.max_discount && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Max Discount</span>
                                        <span>${Number(promoCode.max_discount).toFixed(2)}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Created</span>
                                    <span>{new Date(promoCode.created_at).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Usage */}
                        <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Usage</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Times Used</span>
                                    <span className="font-medium">{promoCode.usages_count || 0}</span>
                                </div>
                                {promoCode.usage_limit && (
                                    <>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Usage Limit</span>
                                            <span>{promoCode.usage_limit}</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-primary transition-all"
                                                style={{ width: `${Math.min(usagePercentage || 0, 100)}%` }}
                                            />
                                        </div>
                                    </>
                                )}
                                <Separator />
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Starts</span>
                                    <span>{promoCode.starts_at ? new Date(promoCode.starts_at).toLocaleDateString() : "Immediately"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Expires</span>
                                    <span>{promoCode.expires_at ? new Date(promoCode.expires_at).toLocaleDateString() : "Never"}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
