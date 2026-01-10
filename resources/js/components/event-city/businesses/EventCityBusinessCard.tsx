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
                "group relative overflow-hidden bg-gradient-to-br from-background to-accent/30 p-5 transition-all hover:shadow-xl",
                className,
            )}
        >
            {/* Decorative gradient overlay */}
            <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-gradient-to-br from-accent/50 to-transparent" />

            <div className="relative space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <Link href={href} className="group/link">
                            <h3 className="text-xl font-bold text-foreground group-hover/link:text-primary transition-colors">{business.name}</h3>
                        </Link>
                        {business.is_verified && (
                            <Badge variant="secondary" className="ml-2">
                                ✓ Verified Venue
                            </Badge>
                        )}
                    </div>

                    {/* Business Image */}
                    {business.image && (
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 shadow-md">
                            <img
                                src={business.image}
                                alt={business.name}
                                className="h-full w-full object-cover transition-transform group-hover:scale-110"
                            />
                        </div>
                    )}
                </div>

                {/* Description */}
                {business.description && <p className="line-clamp-2 text-sm text-muted-foreground">{business.description}</p>}

                {/* Upcoming Events Badge */}
                {upcomingEventsCount > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                            <span className="text-sm font-semibold">
                                {upcomingEventsCount} upcoming {upcomingEventsCount === 1 ? "event" : "events"}
                            </span>
                        </div>
                    </div>
                )}

                {/* Next Event Preview */}
                {nextEvent && (
                    <Link
                        href={`/events/${nextEvent.slug || nextEvent.id}`}
                        className="block rounded-lg border-2 bg-card p-3 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <TicketIcon className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-semibold">{nextEvent.title}</span>
                                </div>
                                {nextEvent.event_date && (
                                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
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
                            <Badge variant="secondary" className="text-xs font-semibold">
                                {nextEvent.is_free ? "FREE" : nextEvent.price_min ? `$${nextEvent.price_min}+` : "TBA"}
                            </Badge>
                        </div>
                    </Link>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between border-t pt-3">
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
                                <span className="font-semibold">{business.rating.toFixed(1)}</span>
                                {business.reviews_count !== undefined && (
                                    <span className="text-muted-foreground">({business.reviews_count.toLocaleString()})</span>
                                )}
                            </div>
                        )}
                    </div>

                    <Button asChild size="sm">
                        <Link href={href}>View Venue</Link>
                    </Button>
                </div>
            </div>
        </Card>
    );
}
