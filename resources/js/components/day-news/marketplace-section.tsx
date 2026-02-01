import { Link } from "@inertiajs/react";
import { Tag, ChevronRight } from "lucide-react";
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
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800 flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-news-primary" />
                    Marketplace
                </h2>
            </div>
            <div className="space-y-3">
                {classifieds.map((item, index) => (
                    <div
                        key={item.id}
                        className={`${index !== classifieds.length - 1 ? 'border-b border-gray-100 pb-3' : ''}`}
                    >
                        <div className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-tight">{item.category}</div>
                        <h3 className="text-sm font-medium leading-tight mb-1">
                            <Link href={`/classifieds/${item.id}`} className="hover:text-news-primary transition-colors">
                                {item.title}
                            </Link>
                        </h3>
                        <p className="text-xs text-gray-600">
                            ${parseFloat(item.price).toLocaleString()} • {item.location}
                        </p>
                    </div>
                ))}
            </div>
            <div className="text-center mt-4 pt-1">
                <Link
                    href="/classifieds"
                    className="inline-flex items-center px-4 py-2 bg-news-primary text-white rounded-md text-sm font-medium hover:bg-news-primary-dark transition-colors w-full justify-center"
                >
                    View All Listings
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
            </div>
        </div>
    );
};

export default MarketplaceSection;
