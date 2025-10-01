import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { FilterIcon, SearchIcon, XIcon } from "lucide-react";
import React from "react";

export interface TicketFilters {
    search?: string;
    min_price?: number;
    max_price?: number;
    categories?: string[];
    date?: string;
    free_only?: boolean;
}

interface FilterSidebarProps {
    filters: TicketFilters;
    onFilterChange: (filters: Partial<TicketFilters>) => void;
    onClearFilters: () => void;
    className?: string;
}

const PRICE_RANGES = [
    { label: "$0-25", min: 0, max: 25 },
    { label: "$26-50", min: 26, max: 50 },
    { label: "$51-100", min: 51, max: 100 },
    { label: "$101-200", min: 101, max: 200 },
    { label: "$200+", min: 200, max: 500 },
];

const CATEGORIES = ["Music", "Food & Drink", "Arts", "Family", "Nightlife", "Outdoor", "Sports", "Comedy"];

export const FilterSidebar = ({ filters, onFilterChange, onClearFilters, className }: FilterSidebarProps) => {
    const priceRange = [filters.min_price || 0, filters.max_price || 500];

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange({ search: e.target.value || undefined });
    };

    const handleCategoryChange = (category: string, checked: boolean) => {
        const currentCategories = filters.categories || [];
        const newCategories = checked ? [...currentCategories, category] : currentCategories.filter((c) => c !== category);

        onFilterChange({
            categories: newCategories.length > 0 ? newCategories : undefined,
        });
    };

    const handlePriceChange = (values: number[]) => {
        onFilterChange({
            min_price: values[0] === 0 ? undefined : values[0],
            max_price: values[1] === 500 ? undefined : values[1],
        });
    };

    const handlePriceQuickSelect = (min: number, max: number) => {
        onFilterChange({
            min_price: min === 0 ? undefined : min,
            max_price: max === 500 ? undefined : max,
        });
    };

    const hasActiveFilters = !!(
        filters.search ||
        filters.categories?.length ||
        filters.min_price ||
        filters.max_price ||
        filters.date ||
        filters.free_only
    );

    return (
        <div className={cn("p-4 sm:p-6 space-y-4 sm:space-y-6 h-fit bg-card rounded-lg shadow-sm", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FilterIcon className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-base sm:text-lg font-semibold">Filters</h3>
                </div>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="h-8 px-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <XIcon className="h-4 w-4 mr-1" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Search */}
            <div className="space-y-2">
                <Label htmlFor="search-tickets">Search</Label>
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="search-tickets"
                        type="text"
                        placeholder="Search events..."
                        value={filters.search || ""}
                        onChange={handleSearchChange}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">Categories</Label>
                <div className="space-y-2">
                    {CATEGORIES.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                                id={`category-${category}`}
                                checked={filters.categories?.includes(category) || false}
                                onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                            />
                            <Label htmlFor={`category-${category}`} className="text-sm font-normal cursor-pointer">
                                {category}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Price */}
            <div className="space-y-4">
                <Label className="text-sm font-medium">Ticket Price</Label>
                <div className="space-y-3">
                    <div className="px-2">
                        <Slider value={priceRange} onValueChange={handlePriceChange} max={500} min={0} step={5} className="w-full" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>${priceRange[0]}</span>
                            <span>${priceRange[1]}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {PRICE_RANGES.map((range) => (
                            <Button
                                key={range.label}
                                variant="outline"
                                size="sm"
                                onClick={() => handlePriceQuickSelect(range.min, range.max)}
                                className={cn(
                                    "text-xs h-8",
                                    priceRange[0] === range.min && priceRange[1] === range.max && "bg-primary text-primary-foreground border-primary",
                                )}
                            >
                                {range.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
                <Label htmlFor="event-date">Event Date</Label>
                <Input
                    id="event-date"
                    type="date"
                    value={filters.date || ""}
                    onChange={(e) =>
                        onFilterChange({
                            date: e.target.value || undefined,
                        })
                    }
                    className="w-full"
                />
            </div>

            {/* Free Events Only */}
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="free-only"
                    checked={filters.free_only || false}
                    onCheckedChange={(checked) =>
                        onFilterChange({
                            free_only: (checked as boolean) || undefined,
                        })
                    }
                />
                <Label htmlFor="free-only" className="text-sm font-normal cursor-pointer">
                    Free events only
                </Label>
            </div>
        </div>
    );
};

export default FilterSidebar;
