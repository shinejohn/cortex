import { Head, Link, router } from "@inertiajs/react";
import { ChevronLeft, Filter, Search, SparklesIcon, TagIcon, Ticket } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DowntownGuideCouponsIndexProps {
    coupons: Array<{
        id: string;
        title: string;
        description?: string;
        discount_type: string;
        discount_value?: number;
        code?: string;
        image?: string;
        business_name?: string;
        slug?: string;
        start_date?: string;
        end_date?: string;
    }>;
    deals: Array<{
        id: string;
        title: string;
        description?: string;
        discount_type: string;
        discount_value?: number;
        image?: string;
        business_name?: string;
        slug?: string;
        start_date?: string;
        end_date?: string;
    }>;
    filters: {
        business_id?: string;
        category?: string;
    };
}

export default function DowntownGuideCouponsIndex({ coupons, deals, filters }: DowntownGuideCouponsIndexProps) {
    const [search, setSearch] = useState("");

    const handleSearch = () => {
        router.get(route("downtown-guide.coupons.index"), { search: search || undefined, ...filters }, { preserveState: true });
    };

    return (
        <>
            <Head title="Deals & Coupons - DowntownsGuide" />

            <div className="min-h-screen bg-background">
                <main className="container mx-auto px-4 py-8">
                    {/* Breadcrumb */}
                    <nav className="mb-6">
                        <Link href={route("downtown-guide.home")} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                            <ChevronLeft className="size-4" />
                            Back to Home
                        </Link>
                    </nav>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                                <Ticket className="size-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="font-display text-3xl font-black tracking-tight">Coupons & Deals</h1>
                                <p className="text-muted-foreground">Find the best coupons and deals from local businesses.</p>
                            </div>
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="mb-6 rounded-lg border bg-card p-4">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search deals and coupons..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="pl-9"
                                />
                            </div>
                            <Button onClick={handleSearch}>
                                <Filter className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="mb-6">
                            <TabsTrigger value="all">
                                All ({coupons.length + deals.length})
                            </TabsTrigger>
                            <TabsTrigger value="deals">
                                <SparklesIcon className="mr-2 h-4 w-4" />
                                Deals ({deals.length})
                            </TabsTrigger>
                            <TabsTrigger value="coupons">
                                <TagIcon className="mr-2 h-4 w-4" />
                                Coupons ({coupons.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Deals */}
                                {deals.map((deal) => (
                                    <Link key={deal.id} href={route("downtown-guide.coupons.show", deal.slug)}>
                                        <Card className="group overflow-hidden border-none shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                                            <CardContent className="p-0">
                                                <div className="flex items-stretch">
                                                    <div className="flex min-w-24 items-center justify-center bg-primary p-4">
                                                        <SparklesIcon className="size-6 text-primary-foreground" />
                                                    </div>
                                                    <div className="flex-1 p-4">
                                                        <div className="mb-1 flex items-start gap-2">
                                                            <h3 className="flex-1 font-semibold leading-tight group-hover:text-primary">{deal.title}</h3>
                                                            <Badge variant="secondary" className="text-xs">DEAL</Badge>
                                                        </div>
                                                        {deal.description && <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{deal.description}</p>}
                                                        {deal.business_name && <p className="text-sm font-medium text-primary">{deal.business_name}</p>}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                                {/* Coupons */}
                                {coupons.map((coupon) => (
                                    <Link key={coupon.id} href={route("downtown-guide.coupons.show", coupon.slug)}>
                                        <Card className="group overflow-hidden border-none shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                                            <CardContent className="p-0">
                                                <div className="flex items-stretch">
                                                    <div className="flex min-w-24 items-center justify-center bg-primary p-4">
                                                        <TagIcon className="size-6 text-primary-foreground" />
                                                    </div>
                                                    <div className="flex-1 p-4">
                                                        <div className="mb-1 flex items-start gap-2">
                                                            <h3 className="flex-1 font-semibold leading-tight group-hover:text-primary">{coupon.title}</h3>
                                                            <Badge variant="secondary" className="text-xs">COUPON</Badge>
                                                        </div>
                                                        {coupon.description && <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{coupon.description}</p>}
                                                        {coupon.code && (
                                                            <Badge variant="secondary" className="mb-2 font-mono">Code: {coupon.code}</Badge>
                                                        )}
                                                        {coupon.business_name && <p className="text-sm font-medium text-primary">{coupon.business_name}</p>}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="deals">
                            {deals.length > 0 ? (
                                <div className="grid gap-6 md:grid-cols-2">
                                    {deals.map((deal) => (
                                        <Link key={deal.id} href={route("downtown-guide.coupons.show", deal.slug)}>
                                            <Card className="group overflow-hidden border-none shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                                                <CardContent className="p-0">
                                                    <div className="flex items-stretch">
                                                        <div className="flex min-w-24 items-center justify-center bg-primary p-4">
                                                            <SparklesIcon className="size-6 text-primary-foreground" />
                                                        </div>
                                                        <div className="flex-1 p-4">
                                                            <h3 className="mb-1 font-semibold leading-tight group-hover:text-primary">{deal.title}</h3>
                                                            {deal.description && <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{deal.description}</p>}
                                                            {deal.business_name && <p className="text-sm font-medium text-primary">{deal.business_name}</p>}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex min-h-[40vh] items-center justify-center">
                                    <div className="text-center">
                                        <SparklesIcon className="mx-auto mb-4 size-16 text-muted-foreground" />
                                        <h3 className="mb-2 text-xl font-bold">No deals available</h3>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="coupons">
                            {coupons.length > 0 ? (
                                <div className="grid gap-6 md:grid-cols-2">
                                    {coupons.map((coupon) => (
                                        <Link key={coupon.id} href={route("downtown-guide.coupons.show", coupon.slug)}>
                                            <Card className="group overflow-hidden border-none shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                                                <CardContent className="p-0">
                                                    <div className="flex items-stretch">
                                                        <div className="flex min-w-24 items-center justify-center bg-primary p-4">
                                                            <TagIcon className="size-6 text-primary-foreground" />
                                                        </div>
                                                        <div className="flex-1 p-4">
                                                            <h3 className="mb-1 font-semibold leading-tight group-hover:text-primary">{coupon.title}</h3>
                                                            {coupon.description && <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{coupon.description}</p>}
                                                            {coupon.code && (
                                                                <Badge variant="secondary" className="mb-2 font-mono">Code: {coupon.code}</Badge>
                                                            )}
                                                            {coupon.business_name && <p className="text-sm font-medium text-primary">{coupon.business_name}</p>}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex min-h-[40vh] items-center justify-center">
                                    <div className="text-center">
                                        <TagIcon className="mx-auto mb-4 size-16 text-muted-foreground" />
                                        <h3 className="mb-2 text-xl font-bold">No coupons available</h3>
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </>
    );
}
