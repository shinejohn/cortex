import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Business } from "@/types/coupon";
import { ExternalLink, Globe, Mail, Map, MapPin, Phone, Star } from "lucide-react";

interface Props {
    business: Business;
}

export function CouponBusinessSidebar({ business }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">About the Business</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Logo and Name */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="size-20 overflow-hidden rounded-full border bg-muted">
                        {business.logo ? (
                            <img
                                src={business.logo}
                                alt={business.name}
                                className="size-full object-cover"
                            />
                        ) : (
                            <div className="flex size-full items-center justify-center bg-secondary text-secondary-foreground">
                                <span className="text-2xl font-bold">{business.name.charAt(0)}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{business.name}</h3>
                        {business.rating && (
                            <div className="flex items-center justify-center gap-1 text-yellow-500">
                                <Star className="size-4 fill-current" />
                                <span className="text-sm font-medium text-foreground">
                                    {business.rating} ({business.review_count || 0})
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                {/* Contact Info */}
                <div className="space-y-3 text-sm">
                    {business.address && (
                        <div className="flex gap-2">
                            <MapPin className="size-4 flex-shrink-0 text-muted-foreground" />
                            <span>{business.address}</span>
                        </div>
                    )}
                    {business.website && (
                        <div className="flex gap-2">
                            <Globe className="size-4 flex-shrink-0 text-muted-foreground" />
                            <a
                                href={business.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                Visit Website
                            </a>
                        </div>
                    )}
                    {business.phone && (
                        <div className="flex gap-2">
                            <Phone className="size-4 flex-shrink-0 text-muted-foreground" />
                            <a href={`tel:${business.phone}`} className="hover:underline">
                                {business.phone}
                            </a>
                        </div>
                    )}
                    {business.email && (
                        <div className="flex gap-2">
                            <Mail className="size-4 flex-shrink-0 text-muted-foreground" />
                            <a href={`mailto:${business.email}`} className="hover:underline">
                                Email Us
                            </a>
                        </div>
                    )}
                </div>

                <div className="grid gap-2 pt-2">
                    {business.website && (
                        <Button variant="outline" className="w-full" asChild>
                            <a href={business.website} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 size-4" />
                                Website
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
