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
        <Link
            href={href}
            className={cn(
                "group block overflow-hidden rounded-xl border-none bg-card shadow-sm transition-all hover:shadow-md",
                className,
            )}
        >
            {/* Image */}
            {event.image && (
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <img
                        src={event.image}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {event.category && (
                        <div className="absolute left-3 top-3">
                            <Badge className="bg-primary text-primary-foreground text-[10px] uppercase tracking-widest font-black">
                                {event.category}
                            </Badge>
                        </div>
                    )}
                </div>
            )}

            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    {!event.image && event.category && (
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-widest font-black">
                            {event.category}
                        </Badge>
                    )}

                    {showShare && (
                        <button onClick={handleShare} className="rounded-lg p-1.5 transition-colors hover:bg-muted" title="Share event">
                            <Share2Icon className="size-4 text-muted-foreground" />
                        </button>
                    )}
                </div>

                <h3 className="mt-1 line-clamp-2 font-display text-lg font-black tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {event.title}
                </h3>

                {showDescription && event.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
                )}

                <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    {dateInfo && (
                        <div className="flex items-center gap-1">
                            <CalendarIcon className="size-3.5 text-primary" />
                            <span>
                                {dateInfo.date} {dateInfo.time && `at ${dateInfo.time}`}
                            </span>
                        </div>
                    )}

                    {showVenue && event.venue && (
                        <div className="flex items-center gap-1">
                            <MapPinIcon className="size-3.5 text-primary" />
                            <span>
                                {event.venue.name}
                                {event.venue.city && `, ${event.venue.city}`}
                            </span>
                        </div>
                    )}

                    {showPrice && (
                        <div className="flex items-center gap-1">
                            <DollarSignIcon className="size-3.5 text-primary" />
                            <span className={event.is_free ? "font-medium text-green-600" : ""}>
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
