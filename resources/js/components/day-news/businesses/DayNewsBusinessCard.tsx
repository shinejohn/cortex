import { Link } from "@inertiajs/react";
import { CalendarIcon, MapPinIcon, NewspaperIcon, StarIcon } from "lucide-react";
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
        <Card className={cn("group p-4 transition-all hover:shadow-md", className)}>
            <div className="flex gap-4">
                {/* Business Image */}
                {business.image && (
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border-2">
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
                                <h3 className="text-lg font-bold group-hover/link:text-primary transition-colors">{business.name}</h3>
                            </Link>
                            {business.is_verified && (
                                <Badge variant="secondary" className="ml-2 text-xs" title="Verified Business">
                                    ✓ Verified
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {business.description && <p className="line-clamp-2 text-sm text-muted-foreground">{business.description}</p>}

                    {/* News Articles Badge */}
                    {recentArticlesCount > 0 && (
                        <Badge variant="secondary" className="flex w-fit items-center gap-2">
                            <NewspaperIcon className="h-4 w-4" />
                            <span className="text-xs font-medium">
                                {recentArticlesCount} recent {recentArticlesCount === 1 ? "article" : "articles"}
                            </span>
                        </Badge>
                    )}

                    {latestArticle && (
                        <Link
                            href={route("daynews.posts.show", latestArticle.slug || latestArticle.id) as any}
                            className="block rounded-md border bg-accent/50 p-2 hover:bg-accent transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <NewspaperIcon className="h-3 w-3 text-primary" />
                                <span className="line-clamp-1 text-xs font-medium">{latestArticle.title}</span>
                            </div>
                            {latestArticle.published_at && (
                                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                    <CalendarIcon className="h-3 w-3" />
                                    <span>{new Date(latestArticle.published_at).toLocaleDateString()}</span>
                                </div>
                            )}
                        </Link>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t pt-2">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                                        <span className="text-muted-foreground">({business.reviews_count.toLocaleString()})</span>
                                    )}
                                </div>
                            )}
                        </div>

                        <Button asChild size="sm">
                            <Link href={href}>View Profile</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
