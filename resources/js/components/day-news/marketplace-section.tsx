import { Link } from "@inertiajs/react";
import { ChevronRight, Tag } from "lucide-react";
import React from "react";

interface ClassifiedListing {
    id: string;
    category: string;
    title: string;
    price: string;
    location: string;
}

interface MarketplaceSectionProps {
    classifieds: ClassifiedListing[];
}

export const MarketplaceSection = ({ classifieds }: MarketplaceSectionProps) => {
    if (!classifieds || classifieds.length === 0) {
        return null;
    }

    return (
        <div className="overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center font-display font-black tracking-tight text-foreground">
                    <Tag className="mr-2 size-4 text-primary" />
                    Marketplace
                </h2>
            </div>
            <div className="space-y-3">
                {classifieds.map((item, index) => (
                    <div
                        key={item.id}
                        className={`${index !== classifieds.length - 1 ? "border-b pb-3" : ""}`}
                    >
                        <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {item.category}
                        </div>
                        <h3 className="mb-1 text-sm font-medium leading-tight">
                            <Link href={`/classifieds/${item.id}`} className="transition-colors hover:text-primary">
                                {item.title}
                            </Link>
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            ${parseFloat(item.price).toLocaleString()} &bull; {item.location}
                        </p>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-1 text-center">
                <Link
                    href="/classifieds"
                    className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    View All Listings
                    <ChevronRight className="ml-1 size-4" />
                </Link>
            </div>
        </div>
    );
};

export default MarketplaceSection;
