import { FilterIcon, SearchIcon, XIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { VENUE_AMENITIES, VENUE_TYPES, VenueFilters } from "@/types/venues.d";

interface FilterSidebarProps {
    filters: VenueFilters;
    onFilterChange: (filters: Partial<VenueFilters>) => void;
    onClearFilters: () => void;
    className?: string;
}

const CAPACITY_RANGES = [
    { label: "1-50", min: 1, max: 50 },
    { label: "51-150", min: 51, max: 150 },
    { label: "151-300", min: 151, max: 300 },
    { label: "301-500", min: 301, max: 500 },
    { label: "500+", min: 500, max: 1000 },
];

const PRICE_RANGES = [
    { label: "$0-100", min: 0, max: 100 },
    { label: "$101-300", min: 101, max: 300 },
    { label: "$301-500", min: 301, max: 500 },
    { label: "$501-1000", min: 501, max: 1000 },
    { label: "$1000+", min: 1000, max: 5000 },
];

export const FilterSidebar = ({ filters, onFilterChange, onClearFilters, className }: FilterSidebarProps) => {
    const capacityRange = [filters.min_capacity || 1, filters.max_capacity || 1000];
    const priceRange = [filters.min_price || 0, filters.max_price || 5000];

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange({ search: e.target.value || undefined });
    };

    const handleVenueTypeChange = (venueType: string, checked: boolean) => {
        const currentTypes = filters.venue_types || [];
        const newTypes = checked ? [...currentTypes, venueType] : currentTypes.filter((type) => type !== venueType);

        onFilterChange({
            venue_types: newTypes.length > 0 ? newTypes : undefined,
        });
    };

    const handleAmenityChange = (amenity: string, checked: boolean) => {
        const currentAmenities = filters.amenities || [];
        const newAmenities = checked ? [...currentAmenities, amenity] : currentAmenities.filter((a) => a !== amenity);

        onFilterChange({
            amenities: newAmenities.length > 0 ? newAmenities : undefined,
        });
    };

    const handleCapacityChange = (values: number[]) => {
        onFilterChange({
            min_capacity: values[0] === 1 ? undefined : values[0],
            max_capacity: values[1] === 1000 ? undefined : values[1],
        });
    };

    const handlePriceChange = (values: number[]) => {
        onFilterChange({
            min_price: values[0] === 0 ? undefined : values[0],
            max_price: values[1] === 5000 ? undefined : values[1],
        });
    };

    const handleCapacityQuickSelect = (min: number, max: number) => {
        onFilterChange({
            min_capacity: min === 1 ? undefined : min,
            max_capacity: max === 1000 ? undefined : max,
        });
    };

    const handlePriceQuickSelect = (min: number, max: number) => {
        onFilterChange({
            min_price: min === 0 ? undefined : min,
            max_price: max === 5000 ? undefined : max,
        });
    };

    const hasActiveFilters = !!(
        filters.search ||
        filters.venue_types?.length ||
        filters.min_capacity ||
        filters.max_capacity ||
        filters.min_price ||
        filters.max_price ||
        filters.amenities?.length ||
        filters.verified ||
        filters.date
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
                <Label htmlFor="search-venues">Search</Label>
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="search-venues"
                        type="text"
                        placeholder="Search venues..."
                        value={filters.search || ""}
                        onChange={handleSearchChange}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Venue Types */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">Venue Type</Label>
                <div className="space-y-2">
                    {Object.values(VENUE_TYPES).map((venueType) => (
                        <div key={venueType} className="flex items-center space-x-2">
                            <Checkbox
                                id={`venue-type-${venueType}`}
                                checked={filters.venue_types?.includes(venueType) || false}
                                onCheckedChange={(checked) => handleVenueTypeChange(venueType, checked as boolean)}
                            />
                            <Label htmlFor={`venue-type-${venueType}`} className="text-sm font-normal cursor-pointer">
                                {venueType}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Capacity */}
            <div className="space-y-4">
                <Label className="text-sm font-medium">Capacity</Label>
                <div className="space-y-3">
                    <div className="px-2">
                        <Slider value={capacityRange} onValueChange={handleCapacityChange} max={1000} min={1} step={1} className="w-full" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>{capacityRange[0]}</span>
                            <span>{capacityRange[1]}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {CAPACITY_RANGES.map((range) => (
                            <Button
                                key={range.label}
                                variant="outline"
                                size="sm"
                                onClick={() => handleCapacityQuickSelect(range.min, range.max)}
                                className={cn(
                                    "text-xs h-8",
                                    capacityRange[0] === range.min &&
                                        capacityRange[1] === range.max &&
                                        "bg-primary text-primary-foreground border-primary",
                                )}
                            >
                                {range.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Price */}
            <div className="space-y-4">
                <Label className="text-sm font-medium">Price per Hour</Label>
                <div className="space-y-3">
                    <div className="px-2">
                        <Slider value={priceRange} onValueChange={handlePriceChange} max={5000} min={0} step={10} className="w-full" />
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

            {/* Amenities */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">Amenities</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Object.values(VENUE_AMENITIES).map((amenity) => (
                        <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox
                                id={`amenity-${amenity}`}
                                checked={filters.amenities?.includes(amenity) || false}
                                onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                            />
                            <Label htmlFor={`amenity-${amenity}`} className="text-sm font-normal cursor-pointer">
                                {amenity}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Verified */}
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="verified-only"
                    checked={filters.verified || false}
                    onCheckedChange={(checked) =>
                        onFilterChange({
                            verified: (checked as boolean) || undefined,
                        })
                    }
                />
                <Label htmlFor="verified-only" className="text-sm font-normal cursor-pointer">
                    Verified venues only
                </Label>
            </div>
        </div>
    );
};

export default FilterSidebar;
