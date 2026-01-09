import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { Building, Calendar, Percent, Plus, Search, Ticket } from "lucide-react";

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

interface CouponsPageProps {
    auth?: Auth;
    coupons: {
        data: Coupon[];
        links: any;
        meta: any;
    };
    filters: {
        search: string;
        business_id: string | null;
    };
}

export default function CouponsIndex() {
    const { auth, coupons, filters } = usePage<CouponsPageProps>().props;

    const searchForm = useForm({
        search: filters.search || "",
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchForm.get("/coupons", {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatDiscount = (coupon: Coupon) => {
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

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title="Coupons - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Coupons & Deals - Day News",
                        description: "Find great deals and coupons from local businesses",
                        url: "/coupons",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold">Coupons & Deals</h1>
                            <p className="mt-2 text-muted-foreground">Find great deals from local businesses</p>
                        </div>
                        {auth && (
                            <Button onClick={() => router.visit("/coupons/create")}>
                                <Plus className="mr-2 size-4" />
                                Create Coupon
                            </Button>
                        )}
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="relative flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={searchForm.data.search}
                                    onChange={(e) => searchForm.setData("search", e.target.value)}
                                    placeholder="Search coupons..."
                                    className="pl-10"
                                />
                            </div>
                            <Button type="submit" disabled={searchForm.processing}>
                                Search
                            </Button>
                        </div>
                    </form>

                    {/* Coupons Grid */}
                    {coupons.data.length === 0 ? (
                        <div className="py-12 text-center">
                            <Ticket className="mx-auto mb-4 size-12 text-muted-foreground" />
                            <p className="text-muted-foreground">No coupons found.</p>
                            {auth && (
                                <Button className="mt-4" onClick={() => router.visit("/coupons/create")}>
                                    Create First Coupon
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {coupons.data.map((coupon) => (
                                <div
                                    key={coupon.id}
                                    className="cursor-pointer rounded-lg border bg-card transition-shadow hover:shadow-md"
                                    onClick={() => router.visit(`/coupons/${coupon.id}`)}
                                >
                                    {coupon.image && <img src={coupon.image} alt={coupon.title} className="h-48 w-full rounded-t-lg object-cover" />}
                                    <div className="p-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <Badge variant="destructive" className="flex items-center gap-1">
                                                <Percent className="size-3" />
                                                {formatDiscount(coupon)}
                                            </Badge>
                                            {coupon.code && (
                                                <Badge variant="outline" className="font-mono">
                                                    {coupon.code}
                                                </Badge>
                                            )}
                                        </div>
                                        <h3 className="mb-2 text-xl font-semibold">{coupon.title}</h3>
                                        {coupon.description && (
                                            <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{coupon.description}</p>
                                        )}
                                        <div className="mb-4 flex items-center gap-2 text-sm">
                                            <Building className="size-4 text-muted-foreground" />
                                            <span className="font-medium">{coupon.business_name}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="size-3" />
                                                Valid until {new Date(coupon.end_date).toLocaleDateString()}
                                            </div>
                                            {coupon.usage_limit && (
                                                <span>
                                                    {coupon.used_count}/{coupon.usage_limit} used
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {coupons.links && coupons.links.length > 3 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {coupons.links.map((link: any, index: number) => (
                                <Button
                                    key={index}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => link.url && router.visit(link.url)}
                                    disabled={!link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </LocationProvider>
    );
}
