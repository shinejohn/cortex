import { Link } from "@inertiajs/react";
import { CheckCircleIcon, ClockIcon, GlobeIcon, MapPinIcon, PhoneIcon, StarIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { sanitizeHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

interface BusinessDetailProps {
    business: {
        id: string;
        name: string;
        description?: string;
        content?: string;
        image?: string;
        address?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        phone?: string;
        email?: string;
        website?: string;
        rating?: number;
        reviews_count?: number;
        categories?: string[];
        opening_hours?: Record<string, string>;
        slug?: string;
        is_verified?: boolean;
        latitude?: number;
        longitude?: number;
    };
    theme?: "daynews" | "downtownsguide" | "eventcity";
    className?: string;
    showMap?: boolean;
}

export function BusinessDetail({ business, theme = "downtownsguide", className, showMap = false }: BusinessDetailProps) {
    const [imageError, setImageError] = useState(false);

    // Use semantic tokens - consistent across themes

    const formatAddress = () => {
        const parts = [];
        if (business.address) parts.push(business.address);
        if (business.city) parts.push(business.city);
        if (business.state) parts.push(business.state);
        if (business.postal_code) parts.push(business.postal_code);
        return parts.join(", ");
    };

    return (
        <article className={cn("space-y-6", className)}>
            {/* Header */}
            <header className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold text-foreground md:text-4xl">{business.name}</h1>
                            {business.is_verified && <CheckCircleIcon className="h-6 w-6 text-primary" title="Verified Business" />}
                        </div>

                        {business.categories && business.categories.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {business.categories.map((category, index) => (
                                    <Badge key={index} variant="secondary">
                                        {category}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {showMap && business.latitude && business.longitude && (
                    <div className="aspect-video w-full overflow-hidden rounded-lg border">
                        <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}&q=${business.latitude},${business.longitude}`}
                        />
                    </div>
                )}

                {business.image && !imageError && (
                    <div className="aspect-video w-full overflow-hidden rounded-lg">
                        <img src={business.image} alt={business.name} className="h-full w-full object-cover" onError={() => setImageError(true)} />
                    </div>
                )}
            </header>

            {/* Business Details */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Rating */}
                {business.rating !== undefined && (
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2">
                            <StarIcon className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            <div>
                                <h3 className="font-semibold text-foreground">Rating</h3>
                                <p className="text-sm text-muted-foreground">
                                    {business.rating.toFixed(1)} out of 5
                                    {business.reviews_count !== undefined && ` (${business.reviews_count.toLocaleString()} reviews)`}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Address */}
                {(business.address || business.city) && (
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-start gap-3">
                            <MapPinIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                            <div>
                                <h3 className="font-semibold text-foreground">Address</h3>
                                <p className="text-sm text-muted-foreground">{formatAddress()}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact */}
                {(business.phone || business.email || business.website) && (
                    <div className="rounded-lg border bg-card p-4">
                        <h3 className="mb-2 font-semibold text-foreground">Contact</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            {business.phone && (
                                <div className="flex items-center gap-2">
                                    <PhoneIcon className="h-4 w-4" />
                                    <a href={`tel:${business.phone}`} className="hover:text-foreground">
                                        {business.phone}
                                    </a>
                                </div>
                            )}

                            {business.email && (
                                <div className="flex items-center gap-2">
                                    <span className="h-4 w-4">@</span>
                                    <a href={`mailto:${business.email}`} className="hover:text-foreground">
                                        {business.email}
                                    </a>
                                </div>
                            )}

                            {business.website && (
                                <div className="flex items-center gap-2">
                                    <GlobeIcon className="h-4 w-4" />
                                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                                        Visit Website
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Hours */}
                {business.opening_hours && Object.keys(business.opening_hours).length > 0 && (
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-start gap-3">
                            <ClockIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                            <div>
                                <h3 className="mb-2 font-semibold text-foreground">Hours</h3>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    {Object.entries(business.opening_hours).map(([day, hours]) => (
                                        <div key={day} className="flex justify-between gap-4">
                                            <span className="capitalize">{day}</span>
                                            <span>{hours || "Closed"}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Description */}
            {business.description && (
                <div className="rounded-lg border bg-card p-4">
                    <h3 className="mb-2 font-semibold text-foreground">About</h3>
                    <p className="text-muted-foreground">{business.description}</p>
                </div>
            )}

            {/* Content */}
            {business.content && (
                <div className="prose prose-lg max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: sanitizeHtml(business.content) }} />
            )}
        </article>
    );
}
