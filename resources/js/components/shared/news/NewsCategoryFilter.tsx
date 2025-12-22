import { cn } from "@/lib/utils";
import { useState } from "react";

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

    const themeColors = {
        daynews: {
            active: "bg-blue-600 text-white",
            inactive: "bg-blue-50 text-blue-700 hover:bg-blue-100",
        },
        downtownsguide: {
            active: "bg-purple-600 text-white",
            inactive: "bg-purple-50 text-purple-700 hover:bg-purple-100",
        },
        eventcity: {
            active: "bg-indigo-600 text-white",
            inactive: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
        },
    };

    const handleCategoryClick = (category: string) => {
        setActiveCategory(category);
        onCategoryChange?.(category);
    };

    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            <button
                onClick={() => handleCategoryClick("all")}
                className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    activeCategory === "all"
                        ? themeColors[theme].active
                        : themeColors[theme].inactive
                )}
            >
                All
            </button>

            {categories.map((category) => (
                <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.slug)}
                    className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                        activeCategory === category.slug
                            ? themeColors[theme].active
                            : themeColors[theme].inactive
                    )}
                >
                    {category.name}
                    {category.count !== undefined && (
                        <span className="ml-2 opacity-75">({category.count})</span>
                    )}
                </button>
            ))}
        </div>
    );
}

