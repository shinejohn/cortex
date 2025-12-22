import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
            <Card>
                <CardContent className="p-6 text-center text-gray-500">
                    No recent check-ins
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {checkIns.map((checkIn) => (
                <Card key={checkIn.id}>
                    <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                            <Avatar>
                                <AvatarImage src={checkIn.user.avatar} alt={checkIn.user.name} />
                                <AvatarFallback>{checkIn.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                    <span className="font-medium">{checkIn.user.name}</span>
                                    <span className="text-sm text-gray-500">checked in at</span>
                                    <span className="font-medium">{checkIn.event.venue.name}</span>
                                </div>
                                <div className="mt-1 text-sm text-gray-600">{checkIn.event.title}</div>
                                {checkIn.notes && (
                                    <div className="mt-2 text-sm text-gray-700">{checkIn.notes}</div>
                                )}
                                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                    <div className="flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {formatDistanceToNow(new Date(checkIn.checked_in_at), { addSuffix: true })}
                                    </div>
                                    {checkIn.location && (
                                        <div className="flex items-center">
                                            <MapPin className="h-3 w-3 mr-1" />
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

