import { Link } from "@inertiajs/react";
import { BadgeCheck, Clock, GlobeIcon, MapPinIcon, NavigationIcon, PhoneIcon, StarIcon, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BusinessCardProps {
    business: {
        id: string;
        name: string;
        description?: string;
        image?: string;
        address?: string;
        city?: string;
        state?: string;
        phone?: string;
        website?: string;
        rating?: number;
        reviews_count?: number;
        categories?: string[];
        slug?: string;
        is_verified?: boolean;
        active_coupons_count?: number;
        price_level?: number;
        open_state?: string;
        latitude?: number;
        longitude?: number;
    };
    theme?: "daynews" | "downtownsguide" | "eventcity";
    className?: string;
    showDescription?: boolean;
    showRating?: boolean;
    showAddress?: boolean;
    showContact?: boolean;
}

export function BusinessCard({
    business,
    theme = "downtownsguide",
    className,
    showDescription = true,
    showRating = true,
    showAddress = true,
    showContact = false,
}: BusinessCardProps) {
    const href = business.slug ? `/businesses/${business.slug}` : `/businesses/${business.id}`;
    const [distance, setDistance] = useState<string | null>(null);

    useEffect(() => {
        if (!business.latitude || !business.longitude || !showContact) return;

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const R = 3958.8; // Earth radius in miles
                    const lat1 = (position.coords.latitude * Math.PI) / 180;
                    const lat2 = (business.latitude! * Math.PI) / 180;
                    const dLat = lat2 - lat1;
                    const dLon = ((business.longitude! - position.coords.longitude) * Math.PI) / 180;
                    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    const d = R * c;
                    setDistance(d < 0.1 ? "Nearby" : `${d.toFixed(1)} mi`);
                },
                () => {
                    // Geolocation denied or unavailable, do not show distance
                },
                { maximumAge: 600000, timeout: 5000 },
            );
        }
    }, [business.latitude, business.longitude, showContact]);

    return (
        <Link
            href={href}
            className={cn(
                "group block overflow-hidden rounded-lg border-none bg-card shadow-sm transition-all hover:shadow-lg hover:-translate-y-1",
                className,
            )}
        >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {business.image ? (
                    <img
                        src={business.image}
                        alt={business.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <MapPinIcon className="size-12" />
                    </div>
                )}

                {/* Category Badge */}
                {business.categories && business.categories.length > 0 && (
                    <Badge variant="secondary" className="absolute left-3 top-3 capitalize">
                        {business.categories[0]}
                    </Badge>
                )}

                {/* Verified Badge */}
                {business.is_verified && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                        <BadgeCheck className="size-3.5" />
                        Verified
                    </div>
                )}

                {/* Special Offer Badge */}
                {(business.active_coupons_count ?? 0) > 0 && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-green-600 px-2 py-1 text-xs font-medium text-white">
                        <Tag className="size-3.5" />
                        Special Offer
                    </div>
                )}
            </div>

            <div className="p-4">
                {/* Name */}
                <div className="flex items-center gap-2">
                    <h3 className="truncate font-display text-lg font-black tracking-tight text-foreground">
                        {business.name}
                    </h3>
                    {business.is_verified && <BadgeCheck className="size-4 shrink-0 text-primary" />}
                </div>

                {/* Categories & Meta */}
                {business.categories && business.categories.length > 1 && (
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{business.categories.slice(0, 2).join(" \u00b7 ")}</span>
                        {business.price_level != null && business.price_level > 0 && (
                            <span className="text-muted-foreground">
                                {"\u00b7 "}{"$".repeat(business.price_level)}
                            </span>
                        )}
                    </div>
                )}

                {/* Rating */}
                {showRating && business.rating !== undefined && (
                    <div className="mb-2 flex items-center gap-1.5">
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
                        <span className="font-medium text-foreground">{business.rating.toFixed(1)}</span>
                        {business.reviews_count !== undefined && (
                            <span className="text-sm text-muted-foreground">({business.reviews_count.toLocaleString()} reviews)</span>
                        )}
                    </div>
                )}

                {/* Description */}
                {showDescription && business.description && (
                    <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{business.description}</p>
                )}

                {/* Address */}
                {showAddress && (business.address || business.city) && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPinIcon className="size-3.5 shrink-0 text-primary" />
                        <span className="truncate">
                            {business.address || `${business.city}${business.state ? `, ${business.state}` : ""}`}
                        </span>
                    </div>
                )}

                {/* Contact */}
                {showContact && (
                    <div className="mt-3 flex items-center gap-4 border-t pt-3">
                        {business.phone && (
                            <a
                                href={`tel:${business.phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                            >
                                <PhoneIcon className="size-3.5 text-primary" />
                                <span>Call</span>
                            </a>
                        )}

                        {business.website && (
                            <a
                                href={business.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                            >
                                <GlobeIcon className="size-3.5 text-primary" />
                                <span>Website</span>
                            </a>
                        )}

                        {business.open_state && (
                            <span className={cn(
                                "flex items-center gap-1 text-sm",
                                business.open_state === "open"
                                    ? "text-green-600"
                                    : "text-muted-foreground"
                            )}>
                                <Clock className="size-3.5" />
                                <span className="capitalize">{business.open_state}</span>
                            </span>
                        )}
                        {distance && (
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <NavigationIcon className="size-3.5 text-primary" />
                                <span>{distance}</span>
                            </span>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
}
