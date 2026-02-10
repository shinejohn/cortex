import { ChevronDownIcon, ClockIcon, MapPinIcon, TagIcon, UsersIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarFilters as CalendarFiltersType } from "@/types/calendars";

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
        <div className="bg-card rounded-xl shadow-sm border border-border/50 p-5 sticky top-4">
            <div className="flex justify-between items-center mb-5">
                <h2 className="font-display text-lg font-black tracking-tight">Filters</h2>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-sm text-muted-foreground hover:text-foreground">
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
            <div className="border-b border-border/50 pb-4 mb-4">
                <button className="flex items-center justify-between w-full text-left group" onClick={() => toggleSection("category")}>
                    <div className="flex items-center gap-2">
                        <TagIcon className="h-4.5 w-4.5 text-indigo-500" />
                        <h3 className="text-sm font-semibold">Category</h3>
                    </div>
                    <ChevronDownIcon
                        className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", expandedSections.category && "rotate-180")}
                    />
                </button>
                {expandedSections.category && (
                    <div className="mt-3 space-y-1.5">
                        {categories.map((cat) => (
                            <label
                                key={cat.id}
                                htmlFor={`category-${cat.id}`}
                                className="flex items-center gap-2.5 rounded-md px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors"
                            >
                                <input
                                    id={`category-${cat.id}`}
                                    name="category"
                                    type="radio"
                                    checked={(filters.category || "all") === cat.id}
                                    onChange={() => handleCategoryChange(cat.id)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-input"
                                />
                                <span className="text-sm">{cat.name}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Followers Filter */}
            <div className="border-b border-border/50 pb-4 mb-4">
                <button className="flex items-center justify-between w-full text-left group" onClick={() => toggleSection("followers")}>
                    <div className="flex items-center gap-2">
                        <UsersIcon className="h-4.5 w-4.5 text-indigo-500" />
                        <h3 className="text-sm font-semibold">Followers</h3>
                    </div>
                    <ChevronDownIcon
                        className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", expandedSections.followers && "rotate-180")}
                    />
                </button>
                {expandedSections.followers && (
                    <div className="mt-3 space-y-4">
                        <div>
                            <label htmlFor="followers-slider" className="block text-xs font-medium text-muted-foreground mb-2">
                                Minimum Followers: <span className="text-foreground font-semibold">{filters.min_followers || 0}+</span>
                            </label>
                            <input
                                id="followers-slider"
                                type="range"
                                min="0"
                                max="10000"
                                step="100"
                                value={filters.min_followers || 0}
                                onChange={(e) => handleFollowerRangeChange(parseInt(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {[0, 100, 500, 1000, 5000].map((count) => (
                                <Button
                                    key={count}
                                    variant={(filters.min_followers || 0) === count ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleFollowerRangeChange(count)}
                                    className={cn(
                                        "text-xs h-7",
                                        (filters.min_followers || 0) === count && "bg-indigo-600 hover:bg-indigo-700 border-indigo-600",
                                    )}
                                >
                                    {count > 0 ? `${count}+` : "Any"}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Update Frequency Filter */}
            <div className="border-b border-border/50 pb-4 mb-4">
                <button className="flex items-center justify-between w-full text-left group" onClick={() => toggleSection("updates")}>
                    <div className="flex items-center gap-2">
                        <ClockIcon className="h-4.5 w-4.5 text-indigo-500" />
                        <h3 className="text-sm font-semibold">Update Frequency</h3>
                    </div>
                    <ChevronDownIcon
                        className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", expandedSections.updates && "rotate-180")}
                    />
                </button>
                {expandedSections.updates && (
                    <div className="mt-3 space-y-1.5">
                        {["any", "daily", "weekly", "bi-weekly", "monthly"].map((frequency) => (
                            <label
                                key={frequency}
                                htmlFor={`frequency-${frequency}`}
                                className="flex items-center gap-2.5 rounded-md px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors"
                            >
                                <input
                                    id={`frequency-${frequency}`}
                                    name="update-frequency"
                                    type="radio"
                                    checked={(filters.update_frequency || "any") === frequency}
                                    onChange={() => handleUpdateFrequencyChange(frequency)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-input"
                                />
                                <span className="text-sm capitalize">
                                    {frequency === "any" ? "Any frequency" : frequency}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Price Filter */}
            <div>
                <button className="flex items-center justify-between w-full text-left group" onClick={() => toggleSection("price")}>
                    <div className="flex items-center gap-2">
                        <TagIcon className="h-4.5 w-4.5 text-indigo-500" />
                        <h3 className="text-sm font-semibold">Price</h3>
                    </div>
                    <ChevronDownIcon
                        className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", expandedSections.price && "rotate-180")}
                    />
                </button>
                {expandedSections.price && (
                    <div className="mt-3 space-y-1.5">
                        {(["all", "free", "paid"] as const).map((priceType) => (
                            <label
                                key={priceType}
                                htmlFor={`price-${priceType}`}
                                className="flex items-center gap-2.5 rounded-md px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors"
                            >
                                <input
                                    id={`price-${priceType}`}
                                    name="price-type"
                                    type="radio"
                                    checked={(filters.price_type || "all") === priceType}
                                    onChange={() => handlePriceTypeChange(priceType)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-input"
                                />
                                <span className="text-sm capitalize">
                                    {priceType === "all" ? "All calendars" : `${priceType} only`}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
