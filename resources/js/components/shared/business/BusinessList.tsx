import { BusinessCard } from "./BusinessCard";
import { cn } from "@/lib/utils";

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
            <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground">No businesses found</p>
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
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
