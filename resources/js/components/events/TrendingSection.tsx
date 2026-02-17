import { Link } from "@inertiajs/react";
import { CalendarIcon, MapPinIcon } from "lucide-react";

interface TrendingEvent {
    id: string;
    title: string;
    date?: string;
    event_date?: string;
    venue?: { name: string; city?: string } | null;
    price?: string;
    category?: string;
    image?: string;
}

interface TrendingSectionProps {
    events: TrendingEvent[];
}

export function TrendingSection({ events }: TrendingSectionProps) {
    if (events.length === 0) return null;

    return (
        <div className="py-4 overflow-hidden">
            <h2 className="text-xl font-bold text-foreground mb-4 px-3 sm:px-4">Trending Now</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 px-3 sm:px-4 scrollbar-hide">
                {events.map((event) => (
                    <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        className="flex-shrink-0 w-64 rounded-lg overflow-hidden border bg-card hover:shadow-lg transition-shadow"
                    >
                        <div className="h-32">
                            <img
                                src={event.image ?? "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop"}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-3">
                            <h3 className="font-semibold text-foreground line-clamp-2">{event.title}</h3>
                            {(event.date || event.event_date) && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                    <CalendarIcon className="h-4 w-4 shrink-0" />
                                    {new Date(event.date || event.event_date!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </div>
                            )}
                            {event.venue?.name && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPinIcon className="h-4 w-4 shrink-0" />
                                    {event.venue.name}
                                </div>
                            )}
                            {event.price && (
                                <span className="text-sm font-medium text-primary mt-1 block">{event.price}</span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
