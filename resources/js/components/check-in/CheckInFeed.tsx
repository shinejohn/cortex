import { formatDistanceToNow } from "date-fns";
import { Clock, MapPin, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface CheckIn {
    id: string;
    user: {
        id: string;
        name: string;
        avatar: string;
    };
    event: {
        id: string;
        title: string;
        venue: {
            name: string;
        };
    };
    checked_in_at: string;
    notes?: string;
    location?: string;
}

interface CheckInFeedProps {
    checkIns: CheckIn[];
}

export function CheckInFeed({ checkIns }: CheckInFeedProps) {
    if (checkIns.length === 0) {
        return (
            <Card className="group overflow-hidden border-none shadow-sm">
                <CardContent className="p-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <MapPin className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No recent check-ins</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {checkIns.map((checkIn) => (
                <Card key={checkIn.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                                <AvatarImage src={checkIn.user.avatar} alt={checkIn.user.name} />
                                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                                    {checkIn.user.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-1">
                                    <span className="font-semibold text-foreground">{checkIn.user.name}</span>
                                    <span className="text-sm text-muted-foreground">checked in at</span>
                                    <span className="font-semibold text-indigo-600">{checkIn.event.venue.name}</span>
                                </div>
                                <p className="mt-0.5 text-sm text-muted-foreground">{checkIn.event.title}</p>
                                {checkIn.notes && (
                                    <div className="mt-2 flex items-start gap-2 rounded-lg bg-muted/50 p-2.5">
                                        <MessageSquare className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                                        <p className="text-sm text-foreground/80">{checkIn.notes}</p>
                                    </div>
                                )}
                                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDistanceToNow(new Date(checkIn.checked_in_at), { addSuffix: true })}
                                    </div>
                                    {checkIn.location && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {checkIn.location}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
