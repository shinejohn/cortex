import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarFilters as CalendarFiltersType } from "@/types/calendars";
import { ChevronDownIcon, ClockIcon, MapPinIcon, TagIcon, UsersIcon, XIcon } from "lucide-react";
import { useState } from "react";

type CalendarFiltersProps = {
    filters: CalendarFiltersType;
    onFilterChange: (filters: Partial<CalendarFiltersType>) => void;
    onClose?: () => void;
};

export function CalendarFilters({ filters, onFilterChange, onClose }: CalendarFiltersProps) {
    const [expandedSections, setExpandedSections] = useState({
        location: true,
        followers: true,
        updates: true,
        price: true,
        category: true,
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections({
            ...expandedSections,
            [section]: !expandedSections[section],
        });
    };

    const handleFollowerRangeChange = (min: number) => {
        onFilterChange({
            min_followers: min,
        });
    };

    const handleUpdateFrequencyChange = (frequency: string) => {
        onFilterChange({
            update_frequency: frequency,
        });
    };

    const handlePriceTypeChange = (priceType: "all" | "free" | "paid") => {
        onFilterChange({
            price_type: priceType,
        });
    };

    const handleCategoryChange = (category: string) => {
        onFilterChange({
            category,
        });
    };

    const resetFilters = () => {
        onFilterChange({
            category: undefined,
            search: undefined,
            price_type: undefined,
            min_followers: undefined,
            max_followers: undefined,
            update_frequency: undefined,
        });
    };

    const categories = [
        { id: "all", name: "All Categories" },
        { id: "jazz", name: "Jazz" },
        { id: "kids", name: "Kids & Family" },
        { id: "fitness", name: "Fitness" },
        { id: "seniors", name: "Seniors" },
        { id: "schools", name: "Schools" },
        { id: "sports", name: "Sports" },
        { id: "arts", name: "Arts" },
        { id: "food", name: "Food" },
        { id: "professional", name: "Professional" },
    ];

    return (
        <div className="bg-card rounded-lg shadow-sm p-4 sticky top-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-sm">
                        Reset
                    </Button>
                    {onClose && (
                        <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
                            <XIcon className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Category Filter */}
            <div className="border-b border-border pb-4 mb-4">
                <button className="flex items-center justify-between w-full text-left" onClick={() => toggleSection("category")}>
                    <div className="flex items-center">
                        <TagIcon className="h-5 w-5 text-muted-foreground mr-2" />
                        <h3 className="text-base font-medium">Category</h3>
                    </div>
                    <ChevronDownIcon
                        className={cn("h-5 w-5 text-muted-foreground transition-transform", expandedSections.category && "transform rotate-180")}
                    />
                </button>
                {expandedSections.category && (
                    <div className="mt-4 space-y-2">
                        {categories.map((cat) => (
                            <div key={cat.id} className="flex items-center">
                                <input
                                    id={`category-${cat.id}`}
                                    name="category"
                                    type="radio"
                                    checked={(filters.category || "all") === cat.id}
                                    onChange={() => handleCategoryChange(cat.id)}
                                    className="h-4 w-4 text-primary focus:ring-primary border-input"
                                />
                                <label htmlFor={`category-${cat.id}`} className="ml-2 block text-sm">
                                    {cat.name}
                                </label>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Followers Filter */}
            <div className="border-b border-border pb-4 mb-4">
                <button className="flex items-center justify-between w-full text-left" onClick={() => toggleSection("followers")}>
                    <div className="flex items-center">
                        <UsersIcon className="h-5 w-5 text-muted-foreground mr-2" />
                        <h3 className="text-base font-medium">Followers</h3>
                    </div>
                    <ChevronDownIcon
                        className={cn("h-5 w-5 text-muted-foreground transition-transform", expandedSections.followers && "transform rotate-180")}
                    />
                </button>
                {expandedSections.followers && (
                    <div className="mt-4 space-y-4">
                        <div>
                            <label htmlFor="followers-slider" className="block text-sm font-medium mb-1">
                                Minimum Followers: {filters.min_followers || 0}+
                            </label>
                            <input
                                id="followers-slider"
                                type="range"
                                min="0"
                                max="10000"
                                step="100"
                                value={filters.min_followers || 0}
                                onChange={(e) => handleFollowerRangeChange(parseInt(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[0, 100, 500, 1000, 5000].map((count) => (
                                <Button
                                    key={count}
                                    variant={(filters.min_followers || 0) === count ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleFollowerRangeChange(count)}
                                    className="text-xs"
                                >
                                    {count > 0 ? `${count}+` : "Any"}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Update Frequency Filter */}
            <div className="border-b border-border pb-4 mb-4">
                <button className="flex items-center justify-between w-full text-left" onClick={() => toggleSection("updates")}>
                    <div className="flex items-center">
                        <ClockIcon className="h-5 w-5 text-muted-foreground mr-2" />
                        <h3 className="text-base font-medium">Update Frequency</h3>
                    </div>
                    <ChevronDownIcon
                        className={cn("h-5 w-5 text-muted-foreground transition-transform", expandedSections.updates && "transform rotate-180")}
                    />
                </button>
                {expandedSections.updates && (
                    <div className="mt-4 space-y-2">
                        {["any", "daily", "weekly", "bi-weekly", "monthly"].map((frequency) => (
                            <div key={frequency} className="flex items-center">
                                <input
                                    id={`frequency-${frequency}`}
                                    name="update-frequency"
                                    type="radio"
                                    checked={(filters.update_frequency || "any") === frequency}
                                    onChange={() => handleUpdateFrequencyChange(frequency)}
                                    className="h-4 w-4 text-primary focus:ring-primary border-input"
                                />
                                <label htmlFor={`frequency-${frequency}`} className="ml-2 block text-sm capitalize">
                                    {frequency === "any" ? "Any frequency" : frequency}
                                </label>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Price Filter */}
            <div>
                <button className="flex items-center justify-between w-full text-left" onClick={() => toggleSection("price")}>
                    <div className="flex items-center">
                        <TagIcon className="h-5 w-5 text-muted-foreground mr-2" />
                        <h3 className="text-base font-medium">Price</h3>
                    </div>
                    <ChevronDownIcon
                        className={cn("h-5 w-5 text-muted-foreground transition-transform", expandedSections.price && "transform rotate-180")}
                    />
                </button>
                {expandedSections.price && (
                    <div className="mt-4 space-y-2">
                        {(["all", "free", "paid"] as const).map((priceType) => (
                            <div key={priceType} className="flex items-center">
                                <input
                                    id={`price-${priceType}`}
                                    name="price-type"
                                    type="radio"
                                    checked={(filters.price_type || "all") === priceType}
                                    onChange={() => handlePriceTypeChange(priceType)}
                                    className="h-4 w-4 text-primary focus:ring-primary border-input"
                                />
                                <label htmlFor={`price-${priceType}`} className="ml-2 block text-sm capitalize">
                                    {priceType === "all" ? "All calendars" : `${priceType} only`}
                                </label>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
