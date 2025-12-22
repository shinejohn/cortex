import { Link } from "@inertiajs/react";
import { MapPinIcon, StarIcon, PhoneIcon, GlobeIcon } from "lucide-react";
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
    const themeClasses = {
        daynews: "border-blue-200 hover:border-blue-300",
        downtownsguide: "border-purple-200 hover:border-purple-300",
        eventcity: "border-indigo-200 hover:border-indigo-300",
    };

    const href = business.slug ? `/businesses/${business.slug}` : `/businesses/${business.id}`;

    return (
        <Link
            href={href}
            className={cn(
                "group block rounded-lg border bg-card p-4 transition-all hover:shadow-md",
                themeClasses[theme],
                className
            )}
        >
            <div className="flex gap-4">
                {business.image && (
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                        <img
                            src={business.image}
                            alt={business.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                    </div>
                )}

                <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-foreground">{business.name}</h3>
                                {business.is_verified && (
                                    <span className="text-xs text-blue-600" title="Verified">✓</span>
                                )}
                            </div>

                            {showRating && business.rating !== undefined && (
                                <div className="flex items-center gap-1">
                                    <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-medium text-foreground">
                                        {business.rating.toFixed(1)}
                                    </span>
                                    {business.reviews_count !== undefined && (
                                        <span className="text-sm text-muted-foreground">
                                            ({business.reviews_count.toLocaleString()})
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {showDescription && business.description && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">{business.description}</p>
                    )}

                    {business.categories && business.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {business.categories.slice(0, 3).map((category, index) => (
                                <span
                                    key={index}
                                    className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
                                >
                                    {category}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="space-y-1 text-sm text-muted-foreground">
                        {showAddress && (business.address || business.city) && (
                            <div className="flex items-center gap-1">
                                <MapPinIcon className="h-4 w-4" />
                                <span>
                                    {business.address && `${business.address}, `}
                                    {business.city}
                                    {business.state && `, ${business.state}`}
                                </span>
                            </div>
                        )}

                        {showContact && (
                            <div className="flex flex-wrap gap-4">
                                {business.phone && (
                                    <div className="flex items-center gap-1">
                                        <PhoneIcon className="h-4 w-4" />
                                        <span>{business.phone}</span>
                                    </div>
                                )}

                                {business.website && (
                                    <a
                                        href={business.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center gap-1 hover:text-foreground"
                                    >
                                        <GlobeIcon className="h-4 w-4" />
                                        <span>Website</span>
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

