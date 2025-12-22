import { Link } from "@inertiajs/react";
import { MapPinIcon, StarIcon, TagIcon, CheckCircleIcon, SparklesIcon } from "lucide-react";
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
        <Link
            href={route("downtown-guide.businesses.show", business.slug)}
            className={cn(
                "group relative overflow-hidden rounded-xl border-2 border-purple-200 bg-white shadow-lg transition-all duration-300 hover:border-purple-400 hover:shadow-xl",
                className
            )}
        >
            {/* Featured Badge */}
            {business.featured && (
                <div className="absolute right-2 top-2 z-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    <SparklesIcon className="mr-1 inline h-3 w-3" />
                    Featured
                </div>
            )}

            {/* Image */}
            {business.image && (
                <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                    <img
                        src={business.image}
                        alt={business.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
            )}

            {/* Content */}
            <div className="p-5">
                {/* Header */}
                <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600">
                                {business.name}
                            </h3>
                            {business.is_verified && (
                                <CheckCircleIcon className="h-5 w-5 text-purple-600" title="Verified Business" />
                            )}
                        </div>
                        {(business.city || business.state) && (
                            <div className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                                <MapPinIcon className="h-4 w-4" />
                                <span>
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
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon
                                    key={i}
                                    className={cn(
                                        "h-4 w-4",
                                        i < Math.floor(business.rating ?? 0)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                    )}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                            {business.rating?.toFixed(1)}
                        </span>
                        {business.reviews_count !== undefined && (
                            <span className="text-sm text-gray-600">
                                ({business.reviews_count} reviews)
                            </span>
                        )}
                    </div>
                )}

                {/* Categories */}
                {business.categories && business.categories.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                        {business.categories.slice(0, 2).map((category, index) => (
                            <span
                                key={index}
                                className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800"
                            >
                                {category}
                            </span>
                        ))}
                    </div>
                )}

                {/* Deals & Coupons */}
                {(activeDealsCount > 0 || activeCouponsCount > 0) && (
                    <div className="mt-3 rounded-lg border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TagIcon className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-semibold text-purple-900">
                                    {activeDealsCount > 0 && `${activeDealsCount} Active Deal${activeDealsCount > 1 ? 's' : ''}`}
                                    {activeDealsCount > 0 && activeCouponsCount > 0 && ' • '}
                                    {activeCouponsCount > 0 && `${activeCouponsCount} Coupon${activeCouponsCount > 1 ? 's' : ''}`}
                                </span>
                            </div>
                        </div>
                        {latestDeal && (
                            <p className="mt-1 text-xs text-purple-700">
                                Latest: {latestDeal.title}
                            </p>
                        )}
                    </div>
                )}

                {/* Description */}
                {business.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                        {business.description}
                    </p>
                )}
            </div>
        </Link>
    );
}

