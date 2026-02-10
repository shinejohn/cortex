import { Link } from "@inertiajs/react";
import { BadgeCheck, CheckCircleIcon, MapPinIcon, SparklesIcon, StarIcon, TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DowntownGuideBusinessCardProps {
    business: {
        id: string;
        name: string;
        description?: string;
        image?: string;
        address?: string;
        city?: string;
        state?: string;
        rating?: number;
        reviews_count?: number;
        categories?: string[];
        slug?: string;
        is_verified?: boolean;
        featured?: boolean;
    };
    activeDealsCount?: number;
    activeCouponsCount?: number;
    latestDeal?: {
        id: string;
        title: string;
        discount_value?: number;
    };
    className?: string;
}

export function DowntownGuideBusinessCard({
    business,
    activeDealsCount = 0,
    activeCouponsCount = 0,
    latestDeal,
    className,
}: DowntownGuideBusinessCardProps) {
    return (
        <Link href={route("downtown-guide.businesses.show", business.slug)} className={cn("group relative block", className)}>
            <Card className="overflow-hidden border-none shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                {/* Featured Badge */}
                {business.featured && (
                    <Badge className="absolute right-3 top-3 z-10 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg border-none">
                        <SparklesIcon className="mr-1 inline h-3 w-3" />
                        Featured
                    </Badge>
                )}

                {/* Image */}
                {business.image && (
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-indigo-100/50 to-blue-100/30 dark:from-indigo-950/30 dark:to-blue-950/20">
                        <img
                            src={business.image}
                            alt={business.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                        {/* Verified Badge Overlay */}
                        {business.is_verified && (
                            <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2 py-1 text-xs font-medium text-indigo-700 shadow-sm">
                                <BadgeCheck className="size-3.5" />
                                Verified
                            </div>
                        )}
                    </div>
                )}

                {/* Content */}
                <CardContent className="p-5">
                    {/* Header */}
                    <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-display text-lg font-black tracking-tight truncate group-hover:text-indigo-600 transition-colors">
                                    {business.name}
                                </h3>
                                {business.is_verified && !business.image && (
                                    <CheckCircleIcon className="h-5 w-5 shrink-0 text-indigo-600" title="Verified Business" />
                                )}
                            </div>
                            {(business.city || business.state) && (
                                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">
                                        {business.city}
                                        {business.state && `, ${business.state}`}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rating */}
                    {business.rating !== undefined && (
                        <div className="mb-3 flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        className={cn(
                                            "h-4 w-4",
                                            i < Math.floor(business.rating ?? 0) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted",
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-semibold">{business.rating?.toFixed(1)}</span>
                            {business.reviews_count !== undefined && (
                                <span className="text-sm text-muted-foreground">({business.reviews_count} reviews)</span>
                            )}
                        </div>
                    )}

                    {/* Categories */}
                    {business.categories && business.categories.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1.5">
                            {business.categories.slice(0, 2).map((category, index) => (
                                <Badge key={index} variant="secondary" className="text-xs bg-muted/80">
                                    {category}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Deals & Coupons */}
                    {(activeDealsCount > 0 || activeCouponsCount > 0) && (
                        <div className="mt-3 rounded-lg border border-indigo-200/50 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-800/30 p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TagIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                                        {activeDealsCount > 0 && `${activeDealsCount} Active Deal${activeDealsCount > 1 ? "s" : ""}`}
                                        {activeDealsCount > 0 && activeCouponsCount > 0 && " · "}
                                        {activeCouponsCount > 0 && `${activeCouponsCount} Coupon${activeCouponsCount > 1 ? "s" : ""}`}
                                    </span>
                                </div>
                            </div>
                            {latestDeal && (
                                <p className="mt-1 text-xs text-muted-foreground">Latest: {latestDeal.title}</p>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    {business.description && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{business.description}</p>}
                </CardContent>
            </Card>
        </Link>
    );
}
