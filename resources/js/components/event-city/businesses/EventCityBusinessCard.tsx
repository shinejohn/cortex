import { Link } from "@inertiajs/react";
import { CalendarIcon, MapPinIcon, StarIcon, TicketIcon, ClockIcon } from "lucide-react";
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
export function EventCityBusinessCard({
    business,
    upcomingEventsCount = 0,
    nextEvent,
    className,
}: EventCityBusinessCardProps) {
    const href = business.slug ? `/venues/${business.slug}` : `/venues/${business.id}`;

    return (
        <div className={cn("group relative overflow-hidden rounded-xl border border-indigo-200 bg-gradient-to-br from-white to-indigo-50/30 p-5 shadow-lg transition-all hover:border-indigo-400 hover:shadow-xl", className)}>
            {/* Decorative gradient overlay */}
            <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-gradient-to-br from-indigo-100/50 to-transparent" />

            <div className="relative space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <Link href={href} className="group/link">
                            <h3 className="text-xl font-bold text-indigo-900 group-hover/link:text-indigo-700">
                                {business.name}
                            </h3>
                        </Link>
                        {business.is_verified && (
                            <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                ✓ Verified Venue
                            </span>
                        )}
                    </div>

                    {/* Business Image */}
                    {business.image && (
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 border-indigo-200 shadow-md">
                            <img
                                src={business.image}
                                alt={business.name}
                                className="h-full w-full object-cover transition-transform group-hover:scale-110"
                            />
                        </div>
                    )}
                </div>

                {/* Description */}
                {business.description && (
                    <p className="line-clamp-2 text-sm text-gray-700">{business.description}</p>
                )}

                {/* Upcoming Events Badge */}
                {upcomingEventsCount > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-indigo-100 px-3 py-2">
                        <CalendarIcon className="h-5 w-5 text-indigo-600" />
                        <div className="flex-1">
                            <span className="text-sm font-semibold text-indigo-900">
                                {upcomingEventsCount} upcoming {upcomingEventsCount === 1 ? 'event' : 'events'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Next Event Preview */}
                {nextEvent && (
                    <Link
                        href={`/events/${nextEvent.slug || nextEvent.id}`}
                        className="block rounded-lg border-2 border-indigo-200 bg-white p-3 shadow-sm transition-all hover:border-indigo-400 hover:shadow-md"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <TicketIcon className="h-4 w-4 text-indigo-600" />
                                    <span className="text-sm font-semibold text-indigo-900">
                                        {nextEvent.title}
                                    </span>
                                </div>
                                {nextEvent.event_date && (
                                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                                        <ClockIcon className="h-3 w-3" />
                                        <span>
                                            {new Date(nextEvent.event_date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                            {nextEvent.time && ` at ${nextEvent.time}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="rounded-md bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-900">
                                {nextEvent.is_free
                                    ? 'FREE'
                                    : nextEvent.price_min
                                      ? `$${nextEvent.price_min}+`
                                      : 'TBA'}
                            </div>
                        </div>
                    </Link>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-indigo-200 pt-3">
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                        {business.address && business.city && (
                            <div className="flex items-center gap-1">
                                <MapPinIcon className="h-3 w-3" />
                                <span>{business.city}, {business.state}</span>
                            </div>
                        )}

                        {business.rating !== undefined && (
                            <div className="flex items-center gap-1">
                                <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{business.rating.toFixed(1)}</span>
                                {business.reviews_count !== undefined && (
                                    <span className="text-gray-500">
                                        ({business.reviews_count.toLocaleString()})
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <Link
                        href={href}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg"
                    >
                        View Venue
                    </Link>
                </div>
            </div>
        </div>
    );
}

