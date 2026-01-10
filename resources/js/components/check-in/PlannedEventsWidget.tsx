import { router } from "@inertiajs/react";
import { formatDistanceToNow } from "date-fns";
import { Calendar, Clock, MapPin } from "lucide-react";
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
            <Card>
                <CardContent className="p-6 text-center text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No planned events</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => router.visit("/events")}>
                        Browse Events
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Planned Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {events.slice(0, limit).map((plannedEvent) => (
                    <div
                        key={plannedEvent.id}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => router.visit(`/events/${plannedEvent.event.id}`)}
                    >
                        <div className="flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden">
                            <img
                                src={plannedEvent.event.image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop"}
                                alt={plannedEvent.event.title}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{plannedEvent.event.title}</h4>
                            <div className="mt-1 flex items-center text-xs text-gray-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(plannedEvent.event.event_date).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })}
                            </div>
                            <div className="mt-1 flex items-center text-xs text-gray-500">
                                <MapPin className="h-3 w-3 mr-1" />
                                {plannedEvent.event.venue.name}
                            </div>
                            <div className="mt-1 text-xs text-gray-400">
                                Planned {formatDistanceToNow(new Date(plannedEvent.planned_at), { addSuffix: true })}
                            </div>
                        </div>
                    </div>
                ))}
                {events.length > limit && (
                    <Button variant="outline" className="w-full" onClick={() => router.visit("/my/calendar")}>
                        View All ({events.length})
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
