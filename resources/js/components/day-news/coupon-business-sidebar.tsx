import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Business } from "@/types/coupon";
import { Clock, ExternalLink, Globe, Map, MapPin, Phone, Star, Store } from "lucide-react";

interface Props {
    business: Business;
}

export function CouponBusinessSidebar({ business }: Props) {
    const hasContactInfo = business.phone || business.website;
    const hasLocation = business.address;
    const businessImage = business.logo ?? business.images?.[0] ?? null;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                    <div className="size-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        {businessImage ? (
                            <img src={businessImage} alt={business.name} className="size-full object-cover" />
                        ) : (
                            <div className="flex size-full items-center justify-center">
                                <Store className="size-8 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <CardTitle className="font-display font-black tracking-tight text-lg line-clamp-2">{business.name}</CardTitle>
                        {business.rating != null && (
                            <div className="mt-1 flex items-center gap-1">
                                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">
                                    {Number(business.rating).toFixed(1)}
                                    {business.review_count != null && (
                                        <span className="text-muted-foreground"> ({business.review_count})</span>
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {business.categories && business.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {business.categories.map((category, index) => (
                            <Badge key={index} variant="secondary" className="text-xs capitalize">
                                {category}
                            </Badge>
                        ))}
                    </div>
                )}

                {hasLocation && (
                    <div className="flex items-start gap-2 text-sm">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <span>{business.address}</span>
                    </div>
                )}

                {business.phone && (
                    <div className="flex items-center gap-2 text-sm">
                        <Phone className="size-4 shrink-0 text-muted-foreground" />
                        <a href={`tel:${business.phone}`} className="text-primary hover:underline">
                            {business.phone}
                        </a>
                    </div>
                )}

                {business.website && (
                    <div className="flex items-center gap-2 text-sm">
                        <Globe className="size-4 shrink-0 text-muted-foreground" />
                        <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                            Visit Website
                        </a>
                    </div>
                )}

                {business.email && (
                    <div className="flex items-center gap-2 text-sm">
                        <Globe className="size-4 shrink-0 text-muted-foreground" />
                        <a href={`mailto:${business.email}`} className="text-primary hover:underline">
                            Email Us
                        </a>
                    </div>
                )}

                {business.opening_hours && Object.keys(business.opening_hours).length > 0 && (
                    <div className="space-y-1.5 border-t pt-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Clock className="size-4 shrink-0 text-muted-foreground" />
                            <span>Hours</span>
                        </div>
                        <div className="ml-6 space-y-1 text-sm text-muted-foreground">
                            {Object.entries(business.opening_hours).map(([day, hours]) => (
                                <div key={day} className="flex justify-between gap-4">
                                    <span className="capitalize">{day}</span>
                                    <span className={hours ? "" : "text-destructive"}>{hours || "Closed"}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid gap-2 pt-2">
                    {business.website && (
                        <Button variant="outline" className="w-full" asChild>
                            <a href={business.website} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 size-4" />
                                Visit Website
                            </a>
                        </Button>
                    )}
                    {business.address && (
                        <Button variant="secondary" className="w-full" asChild>
                            <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(business.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Map className="mr-2 size-4" />
                                Directions
                            </a>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
