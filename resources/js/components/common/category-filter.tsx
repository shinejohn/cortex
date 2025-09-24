import { cn } from "@/lib/utils";
import { GlassWaterIcon, HeartIcon, MusicIcon, PaletteIcon, StarIcon, SunIcon, UserIcon, UtensilsIcon } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

type Category = {
    name: string;
    icon: React.ReactNode;
    colors: {
        bg: string;
        bgHover: string;
        bgActive: string;
        text: string;
        textActive: string;
        border: string;
        borderActive: string;
    };
};

const categories: Category[] = [
    {
        name: "All",
        icon: <StarIcon className="h-4 w-4" />,
        colors: {
            bg: "bg-slate-50 dark:bg-slate-900/30",
            bgHover: "hover:bg-slate-100 dark:hover:bg-slate-800/50",
            bgActive: "bg-slate-900 dark:bg-slate-100",
            text: "text-slate-700 dark:text-slate-300",
            textActive: "text-white dark:text-slate-900",
            border: "border-slate-200 dark:border-slate-700",
            borderActive: "border-slate-900 dark:border-slate-100",
        },
    },
    {
        name: "Music",
        icon: <MusicIcon className="h-4 w-4" />,
        colors: {
            bg: "bg-purple-50 dark:bg-purple-950/30",
            bgHover: "hover:bg-purple-100 dark:hover:bg-purple-900/50",
            bgActive: "bg-purple-600 dark:bg-purple-500",
            text: "text-purple-700 dark:text-purple-300",
            textActive: "text-white",
            border: "border-purple-200 dark:border-purple-800",
            borderActive: "border-purple-600 dark:border-purple-500",
        },
    },
    {
        name: "Food & Drink",
        icon: <UtensilsIcon className="h-4 w-4" />,
        colors: {
            bg: "bg-orange-50 dark:bg-orange-950/30",
            bgHover: "hover:bg-orange-100 dark:hover:bg-orange-900/50",
            bgActive: "bg-orange-600 dark:bg-orange-500",
            text: "text-orange-700 dark:text-orange-300",
            textActive: "text-white",
            border: "border-orange-200 dark:border-orange-800",
            borderActive: "border-orange-600 dark:border-orange-500",
        },
    },
    {
        name: "Arts",
        icon: <PaletteIcon className="h-4 w-4" />,
        colors: {
            bg: "bg-pink-50 dark:bg-pink-950/30",
            bgHover: "hover:bg-pink-100 dark:hover:bg-pink-900/50",
            bgActive: "bg-pink-600 dark:bg-pink-500",
            text: "text-pink-700 dark:text-pink-300",
            textActive: "text-white",
            border: "border-pink-200 dark:border-pink-800",
            borderActive: "border-pink-600 dark:border-pink-500",
        },
    },
    {
        name: "Family",
        icon: <UserIcon className="h-4 w-4" />,
        colors: {
            bg: "bg-green-50 dark:bg-green-950/30",
            bgHover: "hover:bg-green-100 dark:hover:bg-green-900/50",
            bgActive: "bg-green-600 dark:bg-green-500",
            text: "text-green-700 dark:text-green-300",
            textActive: "text-white",
            border: "border-green-200 dark:border-green-800",
            borderActive: "border-green-600 dark:border-green-500",
        },
    },
    {
        name: "Nightlife",
        icon: <GlassWaterIcon className="h-4 w-4" />,
        colors: {
            bg: "bg-purple-50 dark:bg-purple-950/30",
            bgHover: "hover:bg-purple-100 dark:hover:bg-purple-900/50",
            bgActive: "bg-purple-600 dark:bg-purple-500",
            text: "text-purple-700 dark:text-purple-300",
            textActive: "text-white",
            border: "border-purple-200 dark:border-purple-800",
            borderActive: "border-purple-600 dark:border-purple-500",
        },
    },
    {
        name: "Outdoor",
        icon: <SunIcon className="h-4 w-4" />,
        colors: {
            bg: "bg-blue-50 dark:bg-blue-950/30",
            bgHover: "hover:bg-blue-100 dark:hover:bg-blue-900/50",
            bgActive: "bg-blue-600 dark:bg-blue-500",
            text: "text-blue-700 dark:text-blue-300",
            textActive: "text-white",
            border: "border-blue-200 dark:border-blue-800",
            borderActive: "border-blue-600 dark:border-blue-500",
        },
    },
    {
        name: "Free",
        icon: <HeartIcon className="h-4 w-4" />,
        colors: {
            bg: "bg-red-50 dark:bg-red-950/30",
            bgHover: "hover:bg-red-100 dark:hover:bg-red-900/50",
            bgActive: "bg-red-600 dark:bg-red-500",
            text: "text-red-700 dark:text-red-300",
            textActive: "text-white",
            border: "border-red-200 dark:border-red-800",
            borderActive: "border-red-600 dark:border-red-500",
        },
    },
];

type CategoryFilterProps = {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    className?: string;
};

export const CategoryFilter = ({ selectedCategory, onCategoryChange, className }: CategoryFilterProps) => {
    return (
        <div className={cn("py-4", className)}>
            <div className="max-w-4xl mx-auto px-3 sm:px-4">
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 justify-items-center">
                    {categories.map((category) => {
                        const isSelected = selectedCategory === category.name;
                        const colors = category.colors;

                        return (
                            <Button
                                key={category.name}
                                onClick={() => onCategoryChange(category.name)}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full max-w-[80px] h-16 p-2 relative",
                                    "rounded-lg border transition-all duration-200 transform",
                                    "hover:scale-105 hover:shadow-md active:scale-95",
                                    "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
                                    // Base colors (unselected state)
                                    !isSelected && [colors.bg, colors.text, colors.border, colors.bgHover],
                                    // Active colors (selected state)
                                    isSelected && [
                                        colors.bgActive,
                                        colors.textActive,
                                        colors.borderActive,
                                        "shadow-lg ring-2 ring-offset-2",
                                        // Dynamic ring color based on category
                                        category.name === "All" && "ring-slate-900/20 dark:ring-slate-100/20",
                                        category.name === "Music" && "ring-purple-600/20",
                                        category.name === "Food & Drink" && "ring-orange-600/20",
                                        category.name === "Arts" && "ring-pink-600/20",
                                        category.name === "Family" && "ring-green-600/20",
                                        category.name === "Nightlife" && "ring-purple-600/20",
                                        category.name === "Outdoor" && "ring-blue-600/20",
                                        category.name === "Free" && "ring-red-600/20",
                                    ],
                                )}
                                aria-label={`Filter by ${category.name}`}
                                type="button"
                            >
                                <div className="mb-1 flex-shrink-0">{category.icon}</div>
                                <span className="text-xs font-medium text-center leading-tight truncate w-full">{category.name}</span>

                                {/* Selection indicator dot */}
                                {isSelected && (
                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-current rounded-full" />
                                )}
                            </Button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CategoryFilter;
