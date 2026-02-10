import { Link } from "@inertiajs/react";
import { BadgeCheck, ClockIcon, GlobeIcon, MapPinIcon, PhoneIcon, StarIcon } from "lucide-react";
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

    const formatAddress = () => {
        const parts = [];
        if (business.address) parts.push(business.address);
        if (business.city) parts.push(business.city);
        if (business.state) parts.push(business.state);
        if (business.postal_code) parts.push(business.postal_code);
        return parts.join(", ");
    };

    return (
        <article className={cn("space-y-8", className)}>
            {/* Hero Image */}
            {business.image && !imageError && (
                <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl">
                    <img
                        src={business.image}
                        alt={business.name}
                        className="h-full w-full object-cover"
                        onError={() => setImageError(true)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                        <div className="flex items-center gap-3">
                            <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-4xl">{business.name}</h1>
                            {business.is_verified && <BadgeCheck className="size-6 text-white" title="Verified Business" />}
                        </div>
                        {business.categories && business.categories.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {business.categories.map((category, index) => (
                                    <Badge key={index} variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
                                        {category}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Header - shown when no image */}
            {(!business.image || imageError) && (
                <header className="space-y-4">
                    <div className="flex items-center gap-3">
                        <h1 className="font-display text-3xl font-black tracking-tight text-foreground md:text-4xl">{business.name}</h1>
                        {business.is_verified && <BadgeCheck className="size-6 text-primary" title="Verified Business" />}
                    </div>

                    {business.categories && business.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {business.categories.map((category, index) => (
                                <Badge key={index} variant="secondary">
                                    {category}
                                </Badge>
                            ))}
                        </div>
                    )}
                </header>
            )}

            {/* Map */}
            {showMap && business.latitude && business.longitude && (
                <div className="aspect-video w-full overflow-hidden rounded-xl border shadow-sm">
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

            {/* Business Details Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Rating */}
                {business.rating !== undefined && (
                    <div className="overflow-hidden rounded-xl border-none bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-50">
                                <StarIcon className="size-5 fill-yellow-400 text-yellow-400" />
                            </div>
                            <div>
                                <h3 className="font-display font-black tracking-tight text-foreground">Rating</h3>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <StarIcon
                                                key={star}
                                                className={cn(
                                                    "size-4",
                                                    star <= Math.round(business.rating!)
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "fill-muted text-muted",
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-foreground">{business.rating.toFixed(1)}</span>
                                    {business.reviews_count !== undefined && (
                                        <span className="text-sm text-muted-foreground">({business.reviews_count.toLocaleString()} reviews)</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Address */}
                {(business.address || business.city) && (
                    <div className="overflow-hidden rounded-xl border-none bg-card p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                                <MapPinIcon className="size-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-display font-black tracking-tight text-foreground">Address</h3>
                                <p className="text-sm text-muted-foreground">{formatAddress()}</p>
                                {business.latitude != null && business.longitude != null && (
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                                    >
                                        <MapPinIcon className="size-3.5" />
                                        Get Directions
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact */}
                {(business.phone || business.email || business.website) && (
                    <div className="overflow-hidden rounded-xl border-none bg-card p-5 shadow-sm">
                        <h3 className="mb-3 font-display font-black tracking-tight text-foreground">Contact</h3>
                        <div className="space-y-3 text-sm text-muted-foreground">
                            {business.phone && (
                                <a href={`tel:${business.phone}`} className="flex items-center gap-2 hover:text-foreground">
                                    <PhoneIcon className="size-3.5 text-primary" />
                                    <span>{business.phone}</span>
                                </a>
                            )}

                            {business.email && (
                                <a href={`mailto:${business.email}`} className="flex items-center gap-2 hover:text-foreground">
                                    <span className="size-3.5 text-center text-primary">@</span>
                                    <span>{business.email}</span>
                                </a>
                            )}

                            {business.website && (
                                <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-foreground">
                                    <GlobeIcon className="size-3.5 text-primary" />
                                    <span>Visit Website</span>
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Hours */}
                {business.opening_hours && Object.keys(business.opening_hours).length > 0 && (
                    <div className="overflow-hidden rounded-xl border-none bg-card p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
                                <ClockIcon className="size-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="mb-3 font-display font-black tracking-tight text-foreground">Hours</h3>
                                <div className="space-y-1.5 text-sm text-muted-foreground">
                                    {Object.entries(business.opening_hours).map(([day, hours]) => (
                                        <div key={day} className="flex justify-between gap-4">
                                            <span className="capitalize">{day}</span>
                                            <span className={hours ? "" : "text-destructive"}>{hours || "Closed"}</span>
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
                <div className="overflow-hidden rounded-xl border-none bg-card p-6 shadow-sm">
                    <h3 className="mb-3 font-display text-xl font-black tracking-tight text-foreground">About</h3>
                    <p className="leading-relaxed text-muted-foreground">{business.description}</p>
                </div>
            )}

            {/* Content */}
            {business.content && (
                <div className="prose prose-lg max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: sanitizeHtml(business.content) }} />
            )}
        </article>
    );
}
