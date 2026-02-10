import { router } from "@inertiajs/react";
import { formatDistanceToNow } from "date-fns";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlannedEvent {
    id: string;
    event: {
        id: string;
        title: string;
        event_date: string;
        time: string;
        venue: {
            name: string;
            neighborhood: string;
        };
        image: string;
    };
    status: string;
    planned_at: string;
}

interface PlannedEventsWidgetProps {
    events?: PlannedEvent[];
    limit?: number;
}

export function PlannedEventsWidget({ events = [], limit = 5 }: PlannedEventsWidgetProps) {
    if (events.length === 0) {
        return (
            <Card className="group overflow-hidden border-none shadow-sm">
                <CardContent className="p-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/30">
                        <Calendar className="h-7 w-7 text-indigo-400" />
                    </div>
                    <p className="font-medium text-muted-foreground">No planned events</p>
                    <p className="mt-1 text-sm text-muted-foreground/70">Browse upcoming events to add to your plan.</p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                        onClick={() => router.visit("/events")}
                    >
                        Browse Events
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="group overflow-hidden border-none shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg font-black tracking-tight">Planned Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
                {events.slice(0, limit).map((plannedEvent) => (
                    <div
                        key={plannedEvent.id}
                        className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-muted/50 cursor-pointer transition-all"
                        onClick={() => router.visit(`/events/${plannedEvent.event.id}`)}
                    >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted shadow-sm">
                            <img
                                src={plannedEvent.event.image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop"}
                                alt={plannedEvent.event.title}
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-foreground truncate">{plannedEvent.event.title}</h4>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 text-indigo-500" />
                                {new Date(plannedEvent.event.event_date).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })}
                                {plannedEvent.event.time && (
                                    <>
                                        <span className="text-muted-foreground/40">|</span>
                                        <Clock className="h-3 w-3" />
                                        {plannedEvent.event.time}
                                    </>
                                )}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{plannedEvent.event.venue.name}</span>
                            </div>
                            <p className="mt-0.5 text-[11px] text-muted-foreground/60">
                                Planned {formatDistanceToNow(new Date(plannedEvent.planned_at), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                ))}
                {events.length > limit && (
                    <Button
                        variant="ghost"
                        className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                        onClick={() => router.visit("/my/calendar")}
                    >
                        View All ({events.length})
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
