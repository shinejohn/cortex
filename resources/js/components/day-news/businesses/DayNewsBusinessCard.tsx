import { Link } from "@inertiajs/react";
import { CalendarIcon, Check, ExternalLink, MapPinIcon, NewspaperIcon, StarIcon, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
        active_coupons_count?: number;
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
    const href = route("daynews.businesses.show", business.slug || business.id);

    return (
        <Card className={cn("group overflow-hidden border-none shadow-sm transition-all hover:shadow-md", className)}>
            <div className="flex flex-col md:flex-row">
                {/* Business Image */}
                {business.image && (
                    <div className="relative h-48 overflow-hidden md:h-auto md:w-1/3">
                        <img
                            src={business.image}
                            alt={business.name}
                            className="size-full object-cover transition-transform group-hover:scale-105"
                        />
                        {(business.active_coupons_count ?? 0) > 0 && (
                            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-green-600 px-2 py-1 text-xs font-medium text-white">
                                <Tag className="size-3.5" />
                                Special Offer
                            </div>
                        )}
                    </div>
                )}

                {/* Business Info */}
                <div className="flex flex-1 flex-col p-4 md:p-6">
                    <div className="flex-1">
                        {/* Header with rating */}
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <Link href={href} className="group/link">
                                    <h3 className="font-display text-xl font-black tracking-tight transition-colors group-hover/link:text-primary">
                                        {business.name}
                                    </h3>
                                </Link>
                                {business.is_verified && (
                                    <Badge
                                        variant="secondary"
                                        className="ml-2 text-[10px] font-black uppercase tracking-widest"
                                        title="Verified Business"
                                    >
                                        <Check className="mr-1 size-3" />
                                        Verified
                                    </Badge>
                                )}
                            </div>
                            {business.rating !== undefined && (
                                <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                                    <StarIcon className="size-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-medium">{business.rating.toFixed(1)}</span>
                                    {business.reviews_count !== undefined && (
                                        <span className="text-xs text-muted-foreground">({business.reviews_count.toLocaleString()})</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Categories */}
                        {business.categories && business.categories.length > 0 && (
                            <div className="mt-1 text-sm text-muted-foreground">{business.categories.join(" \u2022 ")}</div>
                        )}

                        {/* Description */}
                        {business.description && (
                            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{business.description}</p>
                        )}

                        {/* Location */}
                        {business.address && business.city && (
                            <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPinIcon className="size-3.5 text-primary" />
                                <span>
                                    {business.city}, {business.state}
                                </span>
                            </div>
                        )}

                        {/* News Articles Badge */}
                        {recentArticlesCount > 0 && (
                            <Badge variant="secondary" className="mt-2 flex w-fit items-center gap-2">
                                <NewspaperIcon className="size-4" />
                                <span className="text-xs font-medium">
                                    {recentArticlesCount} recent {recentArticlesCount === 1 ? "article" : "articles"}
                                </span>
                            </Badge>
                        )}

                        {/* Latest Article */}
                        {latestArticle && (
                            <Link
                                href={route("daynews.posts.show", latestArticle.slug || latestArticle.id) as any}
                                className="mt-2 block rounded-md border bg-accent/50 p-2 transition-colors hover:bg-accent"
                            >
                                <div className="flex items-center gap-2">
                                    <NewspaperIcon className="size-3 text-primary" />
                                    <span className="line-clamp-1 text-xs font-medium">{latestArticle.title}</span>
                                </div>
                                {latestArticle.published_at && (
                                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                        <CalendarIcon className="size-3" />
                                        <span>{new Date(latestArticle.published_at).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </Link>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {business.address && business.city && (
                                <div className="flex items-center gap-1">
                                    <MapPinIcon className="size-3" />
                                    <span>
                                        {business.city}, {business.state}
                                    </span>
                                </div>
                            )}
                        </div>

                        <Button asChild size="sm">
                            <Link href={href} className="flex items-center gap-1">
                                View Profile
                                <ExternalLink className="size-3.5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
