import { MapPinIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BusinessCard } from "./BusinessCard";

interface BusinessListProps {
    businesses: Array<{
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
    }>;
    theme?: "daynews" | "downtownsguide" | "eventcity";
    className?: string;
    showDescription?: boolean;
    showRating?: boolean;
    showAddress?: boolean;
    showContact?: boolean;
}

export function BusinessList({
    businesses,
    theme = "downtownsguide",
    className,
    showDescription = true,
    showRating = true,
    showAddress = true,
    showContact = false,
}: BusinessListProps) {
    if (businesses.length === 0) {
        return (
            <div className="rounded-xl border border-dashed p-12 text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                    <MapPinIcon className="size-6 text-muted-foreground" />
                </div>
                <p className="font-display font-black tracking-tight text-foreground">No businesses found</p>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
        );
    }

    return (
        <div className={cn("grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3", className)}>
            {businesses.map((business) => (
                <BusinessCard
                    key={business.id}
                    business={business}
                    theme={theme}
                    showDescription={showDescription}
                    showRating={showRating}
                    showAddress={showAddress}
                    showContact={showContact}
                />
            ))}
        </div>
    );
}
