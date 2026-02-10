import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NewsCategoryFilterProps {
    categories: Array<{ id: string; name: string; slug: string; count?: number }>;
    selectedCategory?: string;
    onCategoryChange?: (category: string) => void;
    theme?: "daynews" | "downtownsguide" | "eventcity";
    className?: string;
}

export function NewsCategoryFilter({
    categories,
    selectedCategory = "all",
    onCategoryChange,
    theme = "daynews",
    className,
}: NewsCategoryFilterProps) {
    const [activeCategory, setActiveCategory] = useState(selectedCategory);

    const handleCategoryClick = (category: string) => {
        setActiveCategory(category);
        onCategoryChange?.(category);
    };

    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            <Button
                onClick={() => handleCategoryClick("all")}
                variant={activeCategory === "all" ? "default" : "secondary"}
                size="sm"
                className="rounded-full text-[10px] uppercase tracking-widest font-black"
            >
                All
            </Button>

            {categories.map((category) => (
                <Button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.slug)}
                    variant={activeCategory === category.slug ? "default" : "secondary"}
                    size="sm"
                    className="rounded-full text-[10px] uppercase tracking-widest font-black"
                >
                    {category.name}
                    {category.count !== undefined && <span className="ml-1.5 opacity-75">({category.count})</span>}
                </Button>
            ))}
        </div>
    );
}
