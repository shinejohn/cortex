import { Link } from "@inertiajs/react";
import { Calendar, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PerformerEvent } from "@/types/performer-profile";

interface PerformerPastShowsProps {
    events: PerformerEvent[];
}

export function PerformerPastShows({ events }: PerformerPastShowsProps) {
    const [expanded, setExpanded] = useState(false);
    const displayEvents = expanded ? events : events.slice(0, 5);
    const hasMore = events.length > 5;

    if (events.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Past Shows</h3>
                    <p className="text-muted-foreground">Past performance history will appear here.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {displayEvents.map((event) => (
                <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block"
                >
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="font-medium text-foreground mb-2">{event.title}</div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {new Date(event.event_date).toLocaleDateString("en-US", {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </span>
                                        {event.time && <span>at {event.time}</span>}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{event.venue.name}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
            {hasMore && (
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? (
                        <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Show Less
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Show {events.length - 5} More
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}
