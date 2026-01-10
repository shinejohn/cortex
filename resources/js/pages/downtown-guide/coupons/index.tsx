import { Head, Link } from "@inertiajs/react";
import { TagIcon, SearchIcon, FilterIcon, SparklesIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { router } from "@inertiajs/react";
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

            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
                {/* Header */}
                <div className="relative overflow-hidden border-b-4 border-purple-600 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 shadow-xl">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-card/20 p-3 backdrop-blur-sm">
                                <TagIcon className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white">Deals & Coupons</h1>
                                <p className="mt-2 text-xl text-purple-100">Save money with exclusive deals from local businesses</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Search & Filters */}
                    <div className="mb-6 rounded-xl border-2 border bg-card p-6 shadow-lg">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search deals and coupons..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="pl-10"
                                />
                            </div>
                            <Button onClick={handleSearch} className="bg-primary hover:bg-primary">
                                <FilterIcon className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-accent/50">
                            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                All ({coupons.length + deals.length})
                            </TabsTrigger>
                            <TabsTrigger value="deals" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                <SparklesIcon className="mr-2 h-4 w-4" />
                                Deals ({deals.length})
                            </TabsTrigger>
                            <TabsTrigger value="coupons" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                <TagIcon className="mr-2 h-4 w-4" />
                                Coupons ({coupons.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="mt-6">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {/* Deals */}
                                {deals.map((deal) => (
                                    <Link
                                        key={deal.id}
                                        href={route("downtown-guide.coupons.show", deal.slug)}
                                        className="group rounded-xl border-2 border bg-gradient-to-r from-purple-50 to-pink-50 p-6 shadow-lg transition-all hover:border-purple-400 hover:shadow-xl"
                                    >
                                        {deal.image && (
                                            <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg">
                                                <img
                                                    src={deal.image}
                                                    alt={deal.title}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            </div>
                                        )}
                                        <div className="mb-2 flex items-center gap-2">
                                            <SparklesIcon className="h-5 w-5 text-primary" />
                                            <span className="text-xs font-bold text-primary">DEAL</span>
                                        </div>
                                        <h3 className="mb-2 text-lg font-bold text-foreground">{deal.title}</h3>
                                        {deal.description && <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{deal.description}</p>}
                                        {deal.business_name && <p className="text-sm font-medium text-primary">{deal.business_name}</p>}
                                    </Link>
                                ))}

                                {/* Coupons */}
                                {coupons.map((coupon) => (
                                    <Link
                                        key={coupon.id}
                                        href={route("downtown-guide.coupons.show", coupon.slug)}
                                        className="group rounded-xl border-2 border bg-card p-6 shadow-lg transition-all hover:border-purple-400 hover:shadow-xl"
                                    >
                                        {coupon.image && (
                                            <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg">
                                                <img
                                                    src={coupon.image}
                                                    alt={coupon.title}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            </div>
                                        )}
                                        <div className="mb-2 flex items-center gap-2">
                                            <TagIcon className="h-5 w-5 text-primary" />
                                            <span className="text-xs font-bold text-primary">COUPON</span>
                                        </div>
                                        <h3 className="mb-2 text-lg font-bold text-foreground">{coupon.title}</h3>
                                        {coupon.description && <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{coupon.description}</p>}
                                        {coupon.code && (
                                            <div className="mb-2 rounded-lg bg-accent p-2 text-center">
                                                <p className="font-mono text-lg font-bold text-purple-900">{coupon.code}</p>
                                            </div>
                                        )}
                                        {coupon.business_name && <p className="text-sm font-medium text-primary">{coupon.business_name}</p>}
                                    </Link>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="deals" className="mt-6">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {deals.length > 0 ? (
                                    deals.map((deal) => (
                                        <Link
                                            key={deal.id}
                                            href={route("downtown-guide.coupons.show", deal.slug)}
                                            className="group rounded-xl border-2 border bg-gradient-to-r from-purple-50 to-pink-50 p-6 shadow-lg transition-all hover:border-purple-400 hover:shadow-xl"
                                        >
                                            {deal.image && (
                                                <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg">
                                                    <img
                                                        src={deal.image}
                                                        alt={deal.title}
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                </div>
                                            )}
                                            <div className="mb-2 flex items-center gap-2">
                                                <SparklesIcon className="h-5 w-5 text-primary" />
                                                <span className="text-xs font-bold text-primary">DEAL</span>
                                            </div>
                                            <h3 className="mb-2 text-lg font-bold text-foreground">{deal.title}</h3>
                                            {deal.description && <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{deal.description}</p>}
                                            {deal.business_name && <p className="text-sm font-medium text-primary">{deal.business_name}</p>}
                                        </Link>
                                    ))
                                ) : (
                                    <div className="col-span-full rounded-xl border-2 border-dashed border bg-gradient-to-br from-purple-50 to-pink-50 p-12 text-center">
                                        <SparklesIcon className="mx-auto h-12 w-12 text-purple-400" />
                                        <p className="mt-4 text-lg font-bold text-foreground">No deals available</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="coupons" className="mt-6">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {coupons.length > 0 ? (
                                    coupons.map((coupon) => (
                                        <Link
                                            key={coupon.id}
                                            href={route("downtown-guide.coupons.show", coupon.slug)}
                                            className="group rounded-xl border-2 border bg-card p-6 shadow-lg transition-all hover:border-purple-400 hover:shadow-xl"
                                        >
                                            {coupon.image && (
                                                <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg">
                                                    <img
                                                        src={coupon.image}
                                                        alt={coupon.title}
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                </div>
                                            )}
                                            <div className="mb-2 flex items-center gap-2">
                                                <TagIcon className="h-5 w-5 text-primary" />
                                                <span className="text-xs font-bold text-primary">COUPON</span>
                                            </div>
                                            <h3 className="mb-2 text-lg font-bold text-foreground">{coupon.title}</h3>
                                            {coupon.description && <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{coupon.description}</p>}
                                            {coupon.code && (
                                                <div className="mb-2 rounded-lg bg-accent p-2 text-center">
                                                    <p className="font-mono text-lg font-bold text-purple-900">{coupon.code}</p>
                                                </div>
                                            )}
                                            {coupon.business_name && <p className="text-sm font-medium text-primary">{coupon.business_name}</p>}
                                        </Link>
                                    ))
                                ) : (
                                    <div className="col-span-full rounded-xl border-2 border-dashed border bg-gradient-to-br from-purple-50 to-pink-50 p-12 text-center">
                                        <TagIcon className="mx-auto h-12 w-12 text-purple-400" />
                                        <p className="mt-4 text-lg font-bold text-foreground">No coupons available</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
}
