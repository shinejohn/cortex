import { MapPinIcon, UserIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LocationPoint {
    id: string;
    latitude: number;
    longitude: number;
    user: {
        id: string;
        name: string;
    };
}

interface LocationShareMapProps {
    locations: LocationPoint[];
    className?: string;
}

export function LocationShareMap({ locations, className = '' }: LocationShareMapProps) {
    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <MapPinIcon className="h-4 w-4" />
                    Live Locations ({locations.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative min-h-[200px] overflow-hidden rounded-lg border bg-muted/30">
                    {locations.length === 0 ? (
                        <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                            No one is sharing their location yet
                        </div>
                    ) : (
                        <div className="space-y-2 p-4">
                            {locations.map((location) => (
                                <div
                                    key={location.id}
                                    className="flex items-center gap-3 rounded-lg bg-background p-3 shadow-sm"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <UserIcon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{location.user.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                                        </p>
                                    </div>
                                    <MapPinIcon className="h-4 w-4 text-primary" />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="absolute bottom-2 right-2 rounded bg-background/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur-sm">
                        Map view coming soon
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
