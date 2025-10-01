import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PerformerUpcomingShow } from "@/types/performer-profile";
import { Calendar, ExternalLink, MapPin } from "lucide-react";

interface PerformerUpcomingShowsProps {
    shows: PerformerUpcomingShow[];
}

export function PerformerUpcomingShows({ shows }: PerformerUpcomingShowsProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });
    };

    if (shows.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Shows</h3>
                    <p className="text-gray-500">Check back soon for new performance dates!</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {shows.map((show) => (
                <Card key={show.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="h-5 w-5 text-indigo-600" />
                                    <span className="text-lg font-semibold">{formatDate(show.date)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                    <MapPin className="h-4 w-4" />
                                    <span className="font-medium">{show.venue}</span>
                                </div>
                                {show.location && <div className="ml-6 text-sm text-gray-500">{show.location}</div>}
                                <div className="ml-6 text-sm text-gray-500 mt-1">{formatTime(show.date)}</div>
                            </div>
                            <div className="flex flex-col gap-2">
                                {show.ticketsAvailable ? (
                                    <>
                                        <Button className="w-full md:w-auto">Get Tickets</Button>
                                        {show.ticketUrl && (
                                            <Button variant="outline" size="sm" asChild className="w-full md:w-auto">
                                                <a href={show.ticketUrl} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4 mr-1" />
                                                    External Link
                                                </a>
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <Button variant="outline" disabled className="w-full md:w-auto">
                                        Sold Out
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
