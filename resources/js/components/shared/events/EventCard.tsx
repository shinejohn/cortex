import { Link } from "@inertiajs/react";
import { CalendarIcon, DollarSignIcon, MapPinIcon, Share2Icon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
    const [_shareSuccess, setShareSuccess] = useState(false);

    const themeClasses = {
        daynews: "border-border hover:border-primary/50",
        downtownsguide: "border-border hover:border-primary/50",
        eventcity: "border-border hover:border-primary/50",
    };

    const _categoryColors = {
        daynews: "bg-accent text-accent-foreground",
        downtownsguide: "bg-accent text-accent-foreground",
        eventcity: "bg-accent text-accent-foreground",
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
            } catch (_error) {
                // User cancelled
            }
        } else {
            navigator.clipboard.writeText(window.location.origin + href);
            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 2000);
        }
    };

    return (
        <Link href={href} className={cn("group block rounded-lg border bg-card p-4 transition-all hover:shadow-md", themeClasses[theme], className)}>
            {event.image && (
                <div className="mb-4 aspect-video w-full overflow-hidden rounded-md">
                    <img src={event.image} alt={event.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                </div>
            )}

            <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                    {event.category && (
                        <Badge variant="secondary" className="text-xs">
                            {event.category}
                        </Badge>
                    )}

                    {showShare && (
                        <button onClick={handleShare} className="rounded-md p-1 hover:bg-muted" title="Share event">
                            <Share2Icon className="h-4 w-4 text-muted-foreground" />
                        </button>
                    )}
                </div>

                <h3 className="line-clamp-2 text-lg font-semibold text-foreground">{event.title}</h3>

                {showDescription && event.description && <p className="line-clamp-2 text-sm text-muted-foreground">{event.description}</p>}

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
