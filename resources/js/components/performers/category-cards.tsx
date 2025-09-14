import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import {
    MusicIcon,
    MicIcon,
    HeadphonesIcon,
    GuitarIcon,
    ArrowRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PerformerCategory } from "@/types/performers";

const defaultCategories: PerformerCategory[] = [
    {
        id: "bands",
        name: "Bands",
        icon: "music",
        count: 45,
        color: "purple",
    },
    {
        id: "solo-artists",
        name: "Solo Artists",
        icon: "mic",
        count: 32,
        color: "blue",
    },
    {
        id: "djs",
        name: "DJs",
        icon: "headphones",
        count: 28,
        color: "green",
    },
    {
        id: "acoustic",
        name: "Acoustic",
        icon: "guitar",
        count: 19,
        color: "orange",
    },
];

const getIconComponent = (iconName: string) => {
    const iconMap = {
        music: MusicIcon,
        mic: MicIcon,
        headphones: HeadphonesIcon,
        guitar: GuitarIcon,
    };
    return iconMap[iconName as keyof typeof iconMap] || MusicIcon;
};

const getColorClasses = (color: string) => {
    const colorMap = {
        purple: {
            bg: "bg-purple-50 dark:bg-purple-950/30",
            bgHover: "hover:bg-purple-100 dark:hover:bg-purple-900/50",
            text: "text-purple-700 dark:text-purple-300",
            border: "border-purple-200 dark:border-purple-800",
            icon: "text-purple-600 dark:text-purple-400",
        },
        blue: {
            bg: "bg-blue-50 dark:bg-blue-950/30",
            bgHover: "hover:bg-blue-100 dark:hover:bg-blue-900/50",
            text: "text-blue-700 dark:text-blue-300",
            border: "border-blue-200 dark:border-blue-800",
            icon: "text-blue-600 dark:text-blue-400",
        },
        green: {
            bg: "bg-green-50 dark:bg-green-950/30",
            bgHover: "hover:bg-green-100 dark:hover:bg-green-900/50",
            text: "text-green-700 dark:text-green-300",
            border: "border-green-200 dark:border-green-800",
            icon: "text-green-600 dark:text-green-400",
        },
        orange: {
            bg: "bg-orange-50 dark:bg-orange-950/30",
            bgHover: "hover:bg-orange-100 dark:hover:bg-orange-900/50",
            text: "text-orange-700 dark:text-orange-300",
            border: "border-orange-200 dark:border-orange-800",
            icon: "text-orange-600 dark:text-orange-400",
        },
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.purple;
};

interface CategoryCardsProps {
    categories?: PerformerCategory[];
    className?: string;
}

export function CategoryCards({
    categories = defaultCategories,
    className,
}: CategoryCardsProps) {
    return (
        <div className={cn("py-8", className)}>
            <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">
                            Browse by Category
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Discover performers across different musical styles
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((category) => {
                        const IconComponent = getIconComponent(category.icon);
                        const colors = getColorClasses(category.color);

                        return (
                            <Link
                                key={category.id}
                                href={`/performers?category=${category.id}`}
                                className="group block"
                            >
                                <div
                                    className={cn(
                                        "relative p-6 rounded-xl border transition-all duration-200",
                                        "transform hover:scale-105 hover:shadow-lg",
                                        colors.bg,
                                        colors.border,
                                        colors.bgHover
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div
                                            className={cn(
                                                "p-3 rounded-lg",
                                                "bg-white dark:bg-slate-800/50"
                                            )}
                                        >
                                            <IconComponent
                                                className={cn(
                                                    "h-6 w-6",
                                                    colors.icon
                                                )}
                                            />
                                        </div>
                                        <ArrowRightIcon
                                            className={cn(
                                                "h-5 w-5 transition-transform group-hover:translate-x-1",
                                                colors.text
                                            )}
                                        />
                                    </div>

                                    <div>
                                        <h3
                                            className={cn(
                                                "text-lg font-semibold mb-1",
                                                colors.text
                                            )}
                                        >
                                            {category.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {category.count} performers
                                            available
                                        </p>
                                    </div>

                                    {/* Hover effect overlay */}
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
