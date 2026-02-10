import { Link } from "@inertiajs/react";
import { CalendarIcon, ClockIcon, MapPinIcon, StarIcon, TicketIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EventCityBusinessCardProps {
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
    upcomingEventsCount?: number;
    nextEvent?: {
        id: string;
        title: string;
        event_date?: string;
        time?: string;
        is_free?: boolean;
        price_min?: number;
        slug?: string;
    };
    className?: string;
}

/**
 * EventCity-specific Business Card
 * Unique positioning: Shows upcoming events and booking availability
 * Visual: Modern, event-focused, indigo theme
 */
export function EventCityBusinessCard({ business, upcomingEventsCount = 0, nextEvent, className }: EventCityBusinessCardProps) {
    const href = business.slug ? `/venues/${business.slug}` : `/venues/${business.id}`;

    return (
        <Card
            className={cn(
                "group relative overflow-hidden border-none bg-gradient-to-br from-background to-indigo-50/30 dark:to-indigo-950/10 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5",
                className,
            )}
        >
            {/* Decorative gradient overlay */}
            <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-gradient-to-br from-indigo-100/50 to-transparent dark:from-indigo-900/20" />

            <div className="relative space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <Link href={href} className="group/link">
                            <h3 className="font-display text-xl font-black tracking-tight text-foreground group-hover/link:text-indigo-600 transition-colors">
                                {business.name}
                            </h3>
                        </Link>
                        {business.is_verified && (
                            <Badge variant="secondary" className="mt-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300 border-none">
                                ✓ Verified Venue
                            </Badge>
                        )}
                    </div>

                    {/* Business Image */}
                    {business.image && (
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-background shadow-md">
                            <img
                                src={business.image}
                                alt={business.name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                        </div>
                    )}
                </div>

                {/* Description */}
                {business.description && <p className="line-clamp-2 text-sm text-muted-foreground">{business.description}</p>}

                {/* Upcoming Events Badge */}
                {upcomingEventsCount > 0 && (
                    <div className="flex items-center gap-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 px-3 py-2.5">
                        <CalendarIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                            {upcomingEventsCount} upcoming {upcomingEventsCount === 1 ? "event" : "events"}
                        </span>
                    </div>
                )}

                {/* Next Event Preview */}
                {nextEvent && (
                    <Link
                        href={`/events/${nextEvent.slug || nextEvent.id}`}
                        className="block rounded-lg border border-border/50 bg-card p-3 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <TicketIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                    <span className="text-sm font-semibold truncate">{nextEvent.title}</span>
                                </div>
                                {nextEvent.event_date && (
                                    <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                                        <ClockIcon className="h-3 w-3" />
                                        <span>
                                            {new Date(nextEvent.event_date).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                            {nextEvent.time && ` at ${nextEvent.time}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "shrink-0 text-xs font-semibold",
                                    nextEvent.is_free
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                                        : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300",
                                )}
                            >
                                {nextEvent.is_free ? "FREE" : nextEvent.price_min ? `$${nextEvent.price_min}+` : "TBA"}
                            </Badge>
                        </div>
                    </Link>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {business.address && business.city && (
                            <div className="flex items-center gap-1">
                                <MapPinIcon className="h-3.5 w-3.5" />
                                <span>
                                    {business.city}, {business.state}
                                </span>
                            </div>
                        )}

                        {business.rating !== undefined && (
                            <div className="flex items-center gap-1">
                                <StarIcon className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span className="font-semibold text-foreground">{business.rating.toFixed(1)}</span>
                                {business.reviews_count !== undefined && (
                                    <span>({business.reviews_count.toLocaleString()})</span>
                                )}
                            </div>
                        )}
                    </div>

                    <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                        <Link href={href}>View Venue</Link>
                    </Button>
                </div>
            </div>
        </Card>
    );
}
