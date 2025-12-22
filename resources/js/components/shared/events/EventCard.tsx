import { Link } from "@inertiajs/react";
import { CalendarIcon, MapPinIcon, DollarSignIcon, Share2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface EventCardProps {
    event: {
        id: string;
        title: string;
        description?: string;
        image?: string;
        event_date?: string;
        time?: string;
        venue?: {
            id: string;
            name: string;
            city?: string;
        };
        category?: string;
        is_free?: boolean;
        price_min?: number;
        price_max?: number;
        slug?: string;
    };
    theme?: "daynews" | "downtownsguide" | "eventcity";
    className?: string;
    showDescription?: boolean;
    showVenue?: boolean;
    showPrice?: boolean;
    showShare?: boolean;
}

export function EventCard({
    event,
    theme = "eventcity",
    className,
    showDescription = true,
    showVenue = true,
    showPrice = true,
    showShare = false,
}: EventCardProps) {
    const [shareSuccess, setShareSuccess] = useState(false);

    const themeClasses = {
        daynews: "border-blue-200 hover:border-blue-300",
        downtownsguide: "border-purple-200 hover:border-purple-300",
        eventcity: "border-indigo-200 hover:border-indigo-300",
    };

    const categoryColors = {
        daynews: "bg-blue-100 text-blue-800",
        downtownsguide: "bg-purple-100 text-purple-800",
        eventcity: "bg-indigo-100 text-indigo-800",
    };

    const href = event.slug ? `/events/${event.slug}` : `/events/${event.id}`;

    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            time: event.time || date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        };
    };

    const dateInfo = formatDate(event.event_date);

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (navigator.share) {
            try {
                await navigator.share({
                    title: event.title,
                    text: `Check out this event: ${event.title}`,
                    url: window.location.origin + href,
                });
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 2000);
            } catch (error) {
                // User cancelled
            }
        } else {
            navigator.clipboard.writeText(window.location.origin + href);
            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 2000);
        }
    };

    return (
        <Link
            href={href}
            className={cn(
                "group block rounded-lg border bg-card p-4 transition-all hover:shadow-md",
                themeClasses[theme],
                className
            )}
        >
            {event.image && (
                <div className="mb-4 aspect-video w-full overflow-hidden rounded-md">
                    <img
                        src={event.image}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                </div>
            )}

            <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                    {event.category && (
                        <span
                            className={cn(
                                "inline-block rounded-full px-2 py-1 text-xs font-medium",
                                categoryColors[theme]
                            )}
                        >
                            {event.category}
                        </span>
                    )}

                    {showShare && (
                        <button
                            onClick={handleShare}
                            className="rounded-md p-1 hover:bg-muted"
                            title="Share event"
                        >
                            <Share2Icon className="h-4 w-4 text-muted-foreground" />
                        </button>
                    )}
                </div>

                <h3 className="line-clamp-2 text-lg font-semibold text-foreground">{event.title}</h3>

                {showDescription && event.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
                )}

                <div className="space-y-1 text-sm text-muted-foreground">
                    {dateInfo && (
                        <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>
                                {dateInfo.date} {dateInfo.time && `at ${dateInfo.time}`}
                            </span>
                        </div>
                    )}

                    {showVenue && event.venue && (
                        <div className="flex items-center gap-1">
                            <MapPinIcon className="h-4 w-4" />
                            <span>
                                {event.venue.name}
                                {event.venue.city && `, ${event.venue.city}`}
                            </span>
                        </div>
                    )}

                    {showPrice && (
                        <div className="flex items-center gap-1">
                            <DollarSignIcon className="h-4 w-4" />
                            <span>
                                {event.is_free
                                    ? "Free"
                                    : event.price_min
                                      ? `$${event.price_min}${event.price_max ? ` - $${event.price_max}` : "+"}`
                                      : "Price TBA"}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

