import { Link } from "@inertiajs/react";
import { MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { RelatedPerformer } from "@/types/performer-profile";

interface PerformerRelatedPerformersProps {
    performers: RelatedPerformer[];
}

export function PerformerRelatedPerformers({ performers }: PerformerRelatedPerformersProps) {
    if (performers.length === 0) return null;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Similar Performers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {performers.map((p) => (
                    <Link key={p.id} href={`/performers/${p.id}`}>
                        <Card className="hover:shadow-md transition-shadow h-full">
                            <CardContent className="p-4">
                                <div className="flex gap-4">
                                    <div className="h-16 w-16 rounded-full overflow-hidden shrink-0 bg-muted">
                                        {p.profileImage ? (
                                            <img
                                                src={p.profileImage}
                                                alt={p.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-muted-foreground font-medium">
                                                {p.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-foreground truncate">{p.name}</div>
                                        {p.genres?.length > 0 && (
                                            <div className="text-sm text-muted-foreground truncate">
                                                {p.genres.slice(0, 2).join(", ")}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                            {p.rating > 0 && (
                                                <span className="flex items-center">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    {p.rating.toFixed(1)}
                                                </span>
                                            )}
                                            {p.homeCity && (
                                                <span className="flex items-center">
                                                    <MapPin className="h-4 w-4" />
                                                    {p.homeCity}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
