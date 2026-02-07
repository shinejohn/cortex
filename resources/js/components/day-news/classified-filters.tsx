import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category, Condition, FilterOptions } from "@/types/classified";
import { router } from "@inertiajs/react";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyFilters = useCallback((newFilters: Record<string, string | undefined>) => {
        const query: Record<string, string> = {};

        if (newFilters.search) query.search = newFilters.search;
        if (newFilters.category) query.category = newFilters.category;
        if (newFilters.condition) query.condition = newFilters.condition;

        router.get(route("daynews.classifieds.index"), query, {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    useEffect(() => {
        setSearch(filters.search ?? "");
        setCategory(filters.category ?? "");
        setCondition(filters.condition ?? "");
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
                condition: condition || undefined,
            });
        }, 300);
    };

    const handleCategoryChange = (value: string) => {
        const newCategory = value === "all" ? "" : value;
        setCategory(newCategory);
        applyFilters({
            search: search || undefined,
            category: newCategory || undefined,
            condition: condition || undefined,
        });
    };

    const handleConditionChange = (value: string) => {
        const newCondition = value === "all" ? "" : value;
        setCondition(newCondition);
        applyFilters({
            search: search || undefined,
            category: category || undefined,
            condition: newCondition || undefined,
        });
    };

    const clearFilters = () => {
        setSearch("");
        setCategory("");
        setCondition("");
        router.get(route("daynews.classifieds.index"), {}, { preserveState: true });
    };

    const hasActiveFilters = search || category || condition;

    return (
        <div className="space-y-4 rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                    <Label htmlFor="search" className="sr-only">Search</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="search"
                            type="text"
                            placeholder="Search classifieds..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="w-full sm:w-48">
                    <Label htmlFor="category" className="sr-only">Category</Label>
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

                <div className="w-full sm:w-48">
                    <Label htmlFor="condition" className="sr-only">Condition</Label>
                    <Select value={condition || "all"} onValueChange={handleConditionChange}>
                        <SelectTrigger id="condition">
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
            </div>

            {hasActiveFilters && (
                <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                        <X className="mr-1 size-4" />
                        Clear filters
                    </Button>
                </div>
            )}
        </div>
    );
}
