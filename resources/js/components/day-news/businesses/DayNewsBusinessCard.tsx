import { Link } from "@inertiajs/react";
import { NewspaperIcon, MapPinIcon, StarIcon, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BusinessCard } from "@/components/shared/business/BusinessCard";

interface DayNewsBusinessCardProps {
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
    };
    recentArticlesCount?: number;
    latestArticle?: {
        id: string;
        title: string;
        published_at?: string;
        slug?: string;
    };
    className?: string;
}

/**
 * DayNews-specific Business Card
 * Unique positioning: Shows business news and community engagement
 * Visual: Newspaper-style, editorial feel, blue theme
 */
export function DayNewsBusinessCard({ business, recentArticlesCount = 0, latestArticle, className }: DayNewsBusinessCardProps) {
    const href = business.slug ? `/businesses/${business.slug}` : `/businesses/${business.id}`;

    return (
        <div
            className={cn(
                "group rounded-lg border-2 border-blue-200 bg-white p-4 shadow-sm transition-all hover:border-blue-400 hover:shadow-md",
                className,
            )}
        >
            <div className="flex gap-4">
                {/* Business Image */}
                {business.image && (
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border-2 border-blue-100">
                        <img
                            src={business.image}
                            alt={business.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                    </div>
                )}

                <div className="flex-1 space-y-2">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <Link href={href} className="group/link">
                                <h3 className="text-lg font-bold text-blue-900 group-hover/link:text-blue-700">{business.name}</h3>
                            </Link>
                            {business.is_verified && (
                                <span className="ml-2 text-xs text-blue-600" title="Verified Business">
                                    ✓ Verified
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {business.description && <p className="line-clamp-2 text-sm text-gray-700">{business.description}</p>}

                    {/* News Articles Badge */}
                    {recentArticlesCount > 0 && (
                        <div className="flex items-center gap-2 rounded-md bg-blue-50 px-2 py-1">
                            <NewspaperIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-medium text-blue-900">
                                {recentArticlesCount} recent {recentArticlesCount === 1 ? "article" : "articles"}
                            </span>
                        </div>
                    )}

                    {/* Latest Article Preview */}
                    {latestArticle && (
                        <Link
                            href={`/posts/${latestArticle.slug || latestArticle.id}`}
                            className="block rounded-md border border-blue-100 bg-blue-50/50 p-2 hover:bg-blue-100"
                        >
                            <div className="flex items-center gap-2">
                                <NewspaperIcon className="h-3 w-3 text-blue-600" />
                                <span className="line-clamp-1 text-xs font-medium text-blue-900">{latestArticle.title}</span>
                            </div>
                            {latestArticle.published_at && (
                                <div className="mt-1 flex items-center gap-1 text-xs text-blue-700">
                                    <CalendarIcon className="h-3 w-3" />
                                    <span>{new Date(latestArticle.published_at).toLocaleDateString()}</span>
                                </div>
                            )}
                        </Link>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-blue-100 pt-2">
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                            {business.address && business.city && (
                                <div className="flex items-center gap-1">
                                    <MapPinIcon className="h-3 w-3" />
                                    <span>
                                        {business.city}, {business.state}
                                    </span>
                                </div>
                            )}

                            {business.rating !== undefined && (
                                <div className="flex items-center gap-1">
                                    <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium">{business.rating.toFixed(1)}</span>
                                    {business.reviews_count !== undefined && (
                                        <span className="text-gray-500">({business.reviews_count.toLocaleString()})</span>
                                    )}
                                </div>
                            )}
                        </div>

                        <Link
                            href={href}
                            className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            View Profile
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
