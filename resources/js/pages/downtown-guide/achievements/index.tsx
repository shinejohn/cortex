import { Head } from "@inertiajs/react";
import { TrophyIcon, FilterIcon, StarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { router } from "@inertiajs/react";

interface DowntownGuideAchievementsIndexProps {
    achievements: Array<{
        id: string;
        name: string;
        description?: string;
        icon?: string;
        points?: number;
        category?: string;
        rarity?: string;
    }>;
    userAchievements: Array<{
        id: string;
        achievement_id: string;
        unlocked_at?: string;
    }>;
    filters: {
        category?: string;
        rarity?: string;
    };
}

export default function DowntownGuideAchievementsIndex({
    achievements,
    userAchievements,
    filters,
}: DowntownGuideAchievementsIndexProps) {
    const userAchievementIds = new Set(userAchievements.map((ua) => ua.achievement_id));

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            route("downtown-guide.achievements.index"),
            { ...filters, [key]: value || undefined },
            { preserveState: true }
        );
    };

    const rarityColors = {
        common: "border-gray-200 bg-gray-50",
        rare: "border-blue-200 bg-blue-50",
        epic: "border-purple-200 bg-purple-50",
        legendary: "border-yellow-200 bg-yellow-50",
    };

    return (
        <>
            <Head title="Achievements - DowntownsGuide" />
            
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
                {/* Header */}
                <div className="border-b-4 border-purple-600 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                                <TrophyIcon className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white">Achievements</h1>
                                <p className="mt-2 text-xl text-purple-100">
                                    Unlock achievements and earn rewards
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Filters */}
                    <div className="mb-6 rounded-xl border-2 border-purple-200 bg-white p-6 shadow-lg">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <FilterIcon className="h-4 w-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">Filter:</span>
                            </div>
                            <Select
                                value={filters.category || "all"}
                                onValueChange={(value) => handleFilterChange("category", value)}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="reviews">Reviews</SelectItem>
                                    <SelectItem value="visits">Visits</SelectItem>
                                    <SelectItem value="referrals">Referrals</SelectItem>
                                    <SelectItem value="social">Social</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.rarity || "all"}
                                onValueChange={(value) => handleFilterChange("rarity", value)}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Rarities</SelectItem>
                                    <SelectItem value="common">Common</SelectItem>
                                    <SelectItem value="rare">Rare</SelectItem>
                                    <SelectItem value="epic">Epic</SelectItem>
                                    <SelectItem value="legendary">Legendary</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Achievements Grid */}
                    {achievements.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {achievements.map((achievement) => {
                                const isUnlocked = userAchievementIds.has(achievement.id);
                                const userAchievement = userAchievements.find(
                                    (ua) => ua.achievement_id === achievement.id
                                );

                                return (
                                    <div
                                        key={achievement.id}
                                        className={`rounded-xl border-2 p-6 shadow-lg transition-all ${
                                            isUnlocked
                                                ? rarityColors[achievement.rarity as keyof typeof rarityColors] ||
                                                  "border-purple-200 bg-purple-50"
                                                : "border-gray-200 bg-white opacity-60"
                                        }`}
                                    >
                                        <div className="mb-4 flex items-start justify-between">
                                            <div className="flex-1">
                                                {achievement.icon ? (
                                                    <div className="mb-2 text-4xl">{achievement.icon}</div>
                                                ) : (
                                                    <TrophyIcon className="mb-2 h-8 w-8 text-purple-600" />
                                                )}
                                                <h3 className="text-lg font-bold text-gray-900">{achievement.name}</h3>
                                                {achievement.description && (
                                                    <p className="mt-2 text-sm text-gray-600">{achievement.description}</p>
                                                )}
                                            </div>
                                            {isUnlocked && (
                                                <div className="rounded-full bg-green-100 p-2">
                                                    <StarIcon className="h-5 w-5 fill-green-500 text-green-500" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                                            {achievement.points !== undefined && (
                                                <div className="flex items-center gap-1">
                                                    <StarIcon className="h-4 w-4 text-yellow-400" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {achievement.points} points
                                                    </span>
                                                </div>
                                            )}
                                            {achievement.rarity && (
                                                <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium capitalize text-purple-800">
                                                    {achievement.rarity}
                                                </span>
                                            )}
                                        </div>

                                        {isUnlocked && userAchievement?.unlocked_at && (
                                            <p className="mt-2 text-xs text-gray-500">
                                                Unlocked {new Date(userAchievement.unlocked_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-xl border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-12 text-center">
                            <TrophyIcon className="mx-auto h-12 w-12 text-purple-400" />
                            <p className="mt-4 text-lg font-bold text-gray-900">No achievements found</p>
                            <p className="mt-2 text-sm text-gray-600">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

