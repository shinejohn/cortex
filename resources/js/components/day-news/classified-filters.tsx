import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Category, Condition, FilterOptions } from "@/types/classified";
import { router } from "@inertiajs/react";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { route } from "ziggy-js";

interface Props {
    categories: Category[];
    conditions: Condition[];
    filters: FilterOptions;
    hasRegion: boolean;
}

export function ClassifiedFilters({ categories, conditions, filters, hasRegion }: Props) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [category, setCategory] = useState(filters.category ?? "");
    const [condition, setCondition] = useState(filters.condition ?? "");
    const [minPrice, setMinPrice] = useState(filters.min_price?.toString() ?? "");
    const [maxPrice, setMaxPrice] = useState(filters.max_price?.toString() ?? "");

    const applyFilters = useCallback(
        (newFilters: Record<string, string | number | boolean | undefined>) => {
            const params = new URLSearchParams();

            const allFilters = {
                category: filters.category,
                condition: filters.condition,
                min_price: filters.min_price,
                max_price: filters.max_price,
                search: filters.search,
                global: filters.global,
                ...newFilters,
            };

            Object.entries(allFilters).forEach(([key, value]) => {
                if (value !== undefined && value !== "" && value !== false) {
                    params.set(key, String(value));
                }
            });

            router.get(route("daynews.classifieds.index"), Object.fromEntries(params), {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [filters],
    );

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search ?? "")) {
                applyFilters({ search: search || undefined });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search, filters.search, applyFilters]);

    const handleCategoryChange = (value: string) => {
        applyFilters({ category: value === "all" ? undefined : value });
    };

    const handleConditionChange = (value: string) => {
        applyFilters({ condition: value === "all" ? undefined : value });
    };

    const handlePriceFilter = () => {
        applyFilters({
            min_price: minPrice ? parseFloat(minPrice) : undefined,
            max_price: maxPrice ? parseFloat(maxPrice) : undefined,
        });
    };

    const handleGlobalToggle = (checked: boolean) => {
        applyFilters({ global: checked });
    };

    const clearFilters = () => {
        setSearch("");
        setCategory("");
        setCondition("");
        setMinPrice("");
        setMaxPrice("");
        router.get(route("daynews.classifieds.index"), {}, { preserveState: true });
    };

    const hasActiveFilters = filters.category || filters.condition || filters.min_price || filters.max_price || filters.search;

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                    placeholder="Search classifieds..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Category filter */}
            <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category || "all"} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Condition filter */}
            <div className="space-y-2">
                <Label>Condition</Label>
                <Select value={condition || "all"} onValueChange={handleConditionChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Any Condition" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Any Condition</SelectItem>
                        {conditions.map((cond) => (
                            <SelectItem key={cond.value} value={cond.value}>
                                {cond.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Price range */}
            <div className="space-y-2">
                <Label>Price Range</Label>
                <div className="flex gap-2">
                    <Input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        min={0}
                    />
                    <Input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        min={0}
                    />
                    <Button variant="secondary" onClick={handlePriceFilter}>
                        Apply
                    </Button>
                </div>
            </div>

            {/* Global toggle */}
            {hasRegion && (
                <div className="flex items-center justify-between">
                    <Label htmlFor="global-toggle" className="cursor-pointer">
                        Show all regions
                    </Label>
                    <Switch id="global-toggle" checked={filters.global ?? false} onCheckedChange={handleGlobalToggle} />
                </div>
            )}

            {/* Clear filters */}
            {hasActiveFilters && (
                <Button variant="outline" className="w-full" onClick={clearFilters}>
                    <X className="mr-2 size-4" />
                    Clear Filters
                </Button>
            )}
        </div>
    );
}
