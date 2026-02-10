import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category } from "@/types/coupon";
import { router } from "@inertiajs/react";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { route } from "ziggy-js";

interface CouponFiltersProps {
    categories: Category[];
    filters: {
        category?: string;
        search?: string;
        global?: string | boolean;
    };
    hasRegion: boolean;
}

export function CouponFilters({ categories, filters, hasRegion }: CouponFiltersProps) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [category, setCategory] = useState(filters.category ?? "");
    const initialGlobal = filters.global === "1" || filters.global === "true" || filters.global === true;
    const [showGlobal, setShowGlobal] = useState(initialGlobal);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyFilters = useCallback((newFilters: Record<string, string | boolean | undefined>) => {
        const query: Record<string, string> = {};

        if (newFilters.search) query.search = newFilters.search as string;
        if (newFilters.category) query.category = newFilters.category as string;
        if (newFilters.global) query.global = "1";

        router.get(route("daynews.coupons.index"), query, {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    useEffect(() => {
        setSearch(filters.search ?? "");
        setCategory(filters.category ?? "");
        setShowGlobal(filters.global === "1" || filters.global === "true" || filters.global === true);
    }, [filters]);

    const handleSearchChange = (value: string) => {
        setSearch(value);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            applyFilters({
                search: value || undefined,
                category: category || undefined,
                global: showGlobal,
            });
        }, 300);
    };

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const handleCategoryChange = (value: string) => {
        const newCategory = value === "all" ? "" : value;
        setCategory(newCategory);
        applyFilters({
            search: search || undefined,
            category: newCategory || undefined,
            global: showGlobal,
        });
    };

    const handleGlobalToggle = (checked: boolean) => {
        setShowGlobal(checked);
        applyFilters({
            search: search || undefined,
            category: category || undefined,
            global: checked,
        });
    };

    const clearFilters = () => {
        setSearch("");
        setCategory("");
        setShowGlobal(false);
        router.get(route("daynews.coupons.index"), {}, { preserveState: true });
    };

    const hasActiveFilters = search || category || showGlobal;

    return (
        <div className="space-y-4 rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                    <Label htmlFor="search" className="sr-only">
                        Search coupons
                    </Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="search"
                            type="text"
                            placeholder="Search coupons, businesses, or codes..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <div className="w-full sm:w-48">
                    <Label htmlFor="category" className="sr-only">
                        Category
                    </Label>
                    <Select value={category || "all"} onValueChange={handleCategoryChange}>
                        <SelectTrigger id="category">
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
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
                {hasRegion && (
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="show-global"
                            checked={showGlobal}
                            onCheckedChange={(checked) => handleGlobalToggle(checked === true)}
                        />
                        <Label htmlFor="show-global" className="text-sm cursor-pointer">
                            Show all regions
                        </Label>
                    </div>
                )}
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                        <X className="mr-1 size-4" />
                        Clear filters
                    </Button>
                )}
            </div>
        </div>
    );
}
