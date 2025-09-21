import React from "react";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { FilterSidebar } from "@/components/venues/filter-sidebar";
import { VenueFilters } from "@/types/venues";

interface MobileFilterSidebarProps {
    filters: VenueFilters;
    onFilterChange: (filters: Partial<VenueFilters>) => void;
    onClose: () => void;
}

export const MobileFilterSidebar = ({
    filters,
    onFilterChange,
    onClose,
}: MobileFilterSidebarProps) => (
    <div className="fixed inset-0 z-40 lg:hidden">
        <div className="fixed inset-0 bg-black/30" onClick={onClose}></div>
        <div className="relative w-full max-w-xs p-4 h-full bg-background overflow-y-auto border-r border-border">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-foreground">Filters</h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <XIcon className="h-5 w-5" />
                </Button>
            </div>
            <FilterSidebar
                filters={filters}
                onFilterChange={onFilterChange}
                onClearFilters={() => {
                    // Clear filters handled in parent
                }}
            />
            <div className="mt-6 pt-6 border-t border-border">
                <Button onClick={onClose} className="w-full">
                    Apply Filters
                </Button>
            </div>
        </div>
    </div>
);
