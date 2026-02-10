import { Link, router } from "@inertiajs/react";
import { BookmarkIcon, CalendarIcon, ClockIcon, DollarSignIcon, MapPinIcon, Share2Icon, StarIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
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
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isInterested, setIsInterested] = useState(false);

    const handleBookmark = () => {
        router.post(
            route("events.bookmark", { event: event.id }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setIsBookmarked((prev) => !prev),
            },
        );
    };

    const handleInterested = () => {
        router.post(
            route("events.interested", { event: event.id }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setIsInterested((prev) => !prev),
            },
        );
    };

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
        <article className={cn("space-y-8", className)}>
            {/* Hero Image */}
            {event.image && (
                <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl md:aspect-[3/1]">
                    <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                        <div className="container mx-auto">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                {event.category && (
                                    <Badge className="bg-primary/80 text-primary-foreground text-[10px] uppercase tracking-widest font-black backdrop-blur-sm">
                                        {event.category}
                                    </Badge>
                                )}
                            </div>
                            <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-5xl">{event.title}</h1>
                            {dateInfo && (
                                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/90 md:text-base">
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon className="size-4" />
                                        <span>{dateInfo.date}</span>
                                    </div>
                                    {dateInfo.time && (
                                        <div className="flex items-center gap-1">
                                            <ClockIcon className="size-4" />
                                            <span>{dateInfo.time}</span>
                                        </div>
                                    )}
                                    {event.venue && (
                                        <div className="flex items-center gap-1">
                                            <MapPinIcon className="size-4" />
                                            <span>{event.venue.name}{event.venue.city && `, ${event.venue.city}`}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Header - shown when no image */}
            {!event.image && (
                <header className="space-y-4">
                    {event.category && (
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-widest font-black">
                            {event.category}
                        </Badge>
                    )}

                    <div className="flex items-start justify-between gap-4">
                        <h1 className="flex-1 font-display text-3xl font-black tracking-tight text-foreground md:text-4xl">{event.title}</h1>

                        {showShare && (
                            <Button variant="ghost" size="icon" onClick={handleShare} title="Share event" className="rounded-lg">
                                <Share2Icon className="size-5" />
                            </Button>
                        )}
                    </div>

                    {event.description && <p className="text-lg leading-relaxed text-muted-foreground">{event.description}</p>}
                </header>
            )}

            {/* Action Buttons */}
            {showShare && event.image && (
                <div className="flex flex-wrap gap-3">
                    <Button variant="ghost" size="sm" onClick={handleShare} className="rounded-lg">
                        <Share2Icon className="size-4" />
                        Share
                    </Button>
                    <Button
                        variant={isBookmarked ? "default" : "ghost"}
                        size="sm"
                        onClick={handleBookmark}
                        className="rounded-lg"
                    >
                        <BookmarkIcon className={cn("size-4", isBookmarked && "fill-current")} />
                        {isBookmarked ? "Bookmarked" : "Bookmark"}
                    </Button>
                    <Button
                        variant={isInterested ? "default" : "ghost"}
                        size="sm"
                        onClick={handleInterested}
                        className="rounded-lg"
                    >
                        <StarIcon className={cn("size-4", isInterested && "fill-current")} />
                        {isInterested ? "Interested" : "Interested?"}
                    </Button>
                </div>
            )}

            {/* Event Details Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Date & Time */}
                {dateInfo && (
                    <div className="overflow-hidden rounded-xl border-none bg-card p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                                <CalendarIcon className="size-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-display font-black tracking-tight text-foreground">Date & Time</h3>
                                <p className="text-sm text-muted-foreground">{dateInfo.date}</p>
                                {dateInfo.time && (
                                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                                        <ClockIcon className="size-3.5 text-primary" />
                                        <span>{dateInfo.time}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Venue */}
                {event.venue && (
                    <div className="overflow-hidden rounded-xl border-none bg-card p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                                <MapPinIcon className="size-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-display font-black tracking-tight text-foreground">Venue</h3>
                                <Link href={`/venues/${event.venue.id}`} className="text-sm text-muted-foreground hover:text-primary">
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
                    <div className="overflow-hidden rounded-xl border-none bg-card p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                                <UsersIcon className="size-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-display font-black tracking-tight text-foreground">Performer</h3>
                                <Link href={`/performers/${event.performer.id}`} className="text-sm text-muted-foreground hover:text-primary">
                                    {event.performer.name}
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Price */}
                <div className="overflow-hidden rounded-xl border-none bg-card p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
                            <DollarSignIcon className="size-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-display font-black tracking-tight text-foreground">Price</h3>
                            <p className={cn("text-sm", event.is_free ? "font-medium text-green-600" : "text-muted-foreground")}>
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
                    <div className="overflow-hidden rounded-xl border-none bg-card p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            {weather.icon && <img src={weather.icon} alt={weather.condition} className="size-10" />}
                            <div>
                                <h3 className="font-display font-black tracking-tight text-foreground">Weather</h3>
                                {weather.temperature && <p className="text-2xl font-black text-foreground">{weather.temperature}°F</p>}
                                {weather.condition && <p className="text-sm text-muted-foreground">{weather.condition}</p>}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Description */}
            {event.description && event.image && (
                <div className="overflow-hidden rounded-xl border-none bg-card p-6 shadow-sm">
                    <h2 className="mb-3 font-display text-xl font-black tracking-tight text-foreground">About This Event</h2>
                    <p className="leading-relaxed text-muted-foreground">{event.description}</p>
                </div>
            )}

            {/* Content */}
            {event.content && <div className="prose prose-lg max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.content) }} />}

            {/* Ticket Plans */}
            {event.ticket_plans && event.ticket_plans.length > 0 && (
                <div className="overflow-hidden rounded-xl border-none bg-card p-6 shadow-sm">
                    <h3 className="mb-4 font-display text-xl font-black tracking-tight text-foreground">Ticket Options</h3>
                    <div className="space-y-3">
                        {event.ticket_plans.map((plan) => (
                            <div key={plan.id} className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted/50">
                                <div>
                                    <p className="font-medium text-foreground">{plan.name}</p>
                                    {plan.available_quantity !== undefined && (
                                        <p className="text-sm text-muted-foreground">{plan.available_quantity} available</p>
                                    )}
                                </div>
                                <p className="font-display text-lg font-black text-foreground">${plan.price}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </article>
    );
}
