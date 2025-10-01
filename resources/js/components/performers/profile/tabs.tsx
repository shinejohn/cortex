import { Badge } from "@/components/ui/badge";
import type { ProfileTab } from "@/types/performer-profile";

interface PerformerTabsProps {
    activeTab: ProfileTab;
    onTabChange: (tab: ProfileTab) => void;
    upcomingShowsCount: number;
    reviewsCount: number;
    averageRating: number;
}

export function PerformerTabs({ activeTab, onTabChange, upcomingShowsCount, reviewsCount, averageRating }: PerformerTabsProps) {
    const tabs = [
        { id: "overview" as ProfileTab, label: "Overview" },
        {
            id: "upcoming-shows" as ProfileTab,
            label: "Upcoming Shows",
            badge: upcomingShowsCount > 0 ? upcomingShowsCount.toString() : null,
        },
        { id: "past-shows" as ProfileTab, label: "Past Shows" },
        { id: "media" as ProfileTab, label: "Media" },
        {
            id: "reviews" as ProfileTab,
            label: "Reviews",
            badge: averageRating > 0 ? `${averageRating.toFixed(1)}★` : null,
            badgeVariant: "default" as const,
        },
        { id: "about" as ProfileTab, label: "About" },
    ];

    return (
        <div className="bg-white border-b border-gray-200 sticky top-14 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex overflow-x-auto hide-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`whitespace-nowrap px-4 py-4 text-sm font-medium border-b-2 ${
                                activeTab === tab.id
                                    ? "border-indigo-500 text-indigo-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            {tab.label}
                            {tab.badge && (
                                <Badge variant={tab.badgeVariant || "secondary"} className="ml-1">
                                    {tab.badge}
                                </Badge>
                            )}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
}
