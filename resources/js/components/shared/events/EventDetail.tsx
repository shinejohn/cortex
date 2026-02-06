import { Link } from "@inertiajs/react";
import { CalendarIcon, ClockIcon, DollarSignIcon, MapPinIcon, Share2Icon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sanitizeHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

interface EventDetailProps {
    event: {
        id: string;
        title: string;
        description?: string;
        content?: string;
        image?: string;
        event_date?: string;
        time?: string;
        venue?: {
            id: string;
            name: string;
            address?: string;
            city?: string;
            latitude?: number;
            longitude?: number;
        };
        performer?: {
            id: string;
            name: string;
        };
        category?: string;
        is_free?: boolean;
        price_min?: number;
        price_max?: number;
        slug?: string;
        ticket_plans?: Array<{
            id: string;
            name: string;
            price: number;
            available_quantity?: number;
        }>;
    };
    theme?: "daynews" | "downtownsguide" | "eventcity";
    className?: string;
    showShare?: boolean;
    weather?: {
        temperature?: number;
        condition?: string;
        icon?: string;
    };
}

export function EventDetail({ event, theme = "eventcity", className, showShare = true, weather }: EventDetailProps) {
    const [_shareSuccess, setShareSuccess] = useState(false);

    // Use semantic tokens - consistent across themes

    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
            time: event.time || date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        };
    };

    const dateInfo = formatDate(event.event_date);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: event.title,
                    text: `Check out this event: ${event.title}`,
                    url: window.location.href,
                });
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 2000);
            } catch (_error) {
                // User cancelled
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 2000);
        }
    };

    return (
        <article className={cn("space-y-6", className)}>
            {/* Header */}
            <header className="space-y-4">
                {event.category && <Badge variant="secondary">{event.category}</Badge>}

                <div className="flex items-start justify-between gap-4">
                    <h1 className="flex-1 text-3xl font-bold text-foreground md:text-4xl">{event.title}</h1>

                    {showShare && (
                        <Button variant="ghost" size="icon" onClick={handleShare} title="Share event">
                            <Share2Icon className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                {event.description && <p className="text-lg text-muted-foreground">{event.description}</p>}
            </header>

            {/* Featured Image */}
            {event.image && (
                <div className="aspect-video w-full overflow-hidden rounded-lg">
                    <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
                </div>
            )}

            {/* Event Details */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Date & Time */}
                {dateInfo && (
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-start gap-3">
                            <CalendarIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                            <div>
                                <h3 className="font-semibold text-foreground">Date & Time</h3>
                                <p className="text-sm text-muted-foreground">{dateInfo.date}</p>
                                {dateInfo.time && (
                                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                                        <ClockIcon className="h-4 w-4" />
                                        <span>{dateInfo.time}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Venue */}
                {event.venue && (
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-start gap-3">
                            <MapPinIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                            <div>
                                <h3 className="font-semibold text-foreground">Venue</h3>
                                <Link href={`/venues/${event.venue.id}`} className="text-sm text-muted-foreground hover:text-foreground">
                                    {event.venue.name}
                                </Link>
                                {event.venue.address && <p className="text-sm text-muted-foreground">{event.venue.address}</p>}
                                {event.venue.city && <p className="text-sm text-muted-foreground">{event.venue.city}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Performer */}
                {event.performer && (
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 h-5 w-5 rounded-full bg-muted" />
                            <div>
                                <h3 className="font-semibold text-foreground">Performer</h3>
                                <Link href={`/performers/${event.performer.id}`} className="text-sm text-muted-foreground hover:text-foreground">
                                    {event.performer.name}
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Price */}
                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-start gap-3">
                        <DollarSignIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                        <div>
                            <h3 className="font-semibold text-foreground">Price</h3>
                            <p className="text-sm text-muted-foreground">
                                {event.is_free
                                    ? "Free"
                                    : event.price_min
                                      ? `$${event.price_min}${event.price_max ? ` - $${event.price_max}` : "+"}`
                                      : "Price TBA"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Weather */}
                {weather && (
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-start gap-3">
                            {weather.icon && <img src={weather.icon} alt={weather.condition} className="h-8 w-8" />}
                            <div>
                                <h3 className="font-semibold text-foreground">Weather</h3>
                                {weather.temperature && <p className="text-sm text-muted-foreground">{weather.temperature}°F</p>}
                                {weather.condition && <p className="text-sm text-muted-foreground">{weather.condition}</p>}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            {event.content && <div className="prose prose-lg max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.content) }} />}

            {/* Ticket Plans */}
            {event.ticket_plans && event.ticket_plans.length > 0 && (
                <div className="rounded-lg border bg-card p-4">
                    <h3 className="mb-4 font-semibold text-foreground">Ticket Options</h3>
                    <div className="space-y-2">
                        {event.ticket_plans.map((plan) => (
                            <div key={plan.id} className="flex items-center justify-between rounded-md border p-3">
                                <div>
                                    <p className="font-medium text-foreground">{plan.name}</p>
                                    {plan.available_quantity !== undefined && (
                                        <p className="text-sm text-muted-foreground">{plan.available_quantity} available</p>
                                    )}
                                </div>
                                <p className="font-semibold text-foreground">${plan.price}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </article>
    );
}
