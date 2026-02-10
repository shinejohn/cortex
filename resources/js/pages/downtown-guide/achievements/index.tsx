import { Head, router } from "@inertiajs/react";
import { Filter, Star, TrophyIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export default function DowntownGuideAchievementsIndex({ achievements, userAchievements, filters }: DowntownGuideAchievementsIndexProps) {
    const userAchievementIds = new Set(userAchievements.map((ua) => ua.achievement_id));

    const handleFilterChange = (key: string, value: string) => {
        router.get(route("downtown-guide.achievements.index"), { ...filters, [key]: value || undefined }, { preserveState: true });
    };

    return (
        <>
            <Head title="Achievements - DowntownsGuide" />

            <div className="min-h-screen bg-background">
                <main className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                                <TrophyIcon className="size-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="font-display text-3xl font-black tracking-tight">Achievements</h1>
                                <p className="text-muted-foreground">Unlock achievements and earn rewards</p>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-lg border bg-card p-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Filter:</span>
                            </div>
                            <Select value={filters.category || "all"} onValueChange={(value) => handleFilterChange("category", value)}>
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
                            <Select value={filters.rarity || "all"} onValueChange={(value) => handleFilterChange("rarity", value)}>
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
                                const userAchievement = userAchievements.find((ua) => ua.achievement_id === achievement.id);

                                return (
                                    <Card
                                        key={achievement.id}
                                        className={`overflow-hidden border-none shadow-sm transition-all hover:shadow-md ${
                                            isUnlocked ? "" : "opacity-60"
                                        }`}
                                    >
                                        <CardContent className="p-6">
                                            <div className="mb-4 flex items-start justify-between">
                                                <div className="flex-1">
                                                    {achievement.icon ? (
                                                        <div className="mb-2 text-4xl">{achievement.icon}</div>
                                                    ) : (
                                                        <TrophyIcon className="mb-2 h-8 w-8 text-primary" />
                                                    )}
                                                    <h3 className="text-lg font-bold">{achievement.name}</h3>
                                                    {achievement.description && (
                                                        <p className="mt-2 text-sm text-muted-foreground">{achievement.description}</p>
                                                    )}
                                                </div>
                                                {isUnlocked && (
                                                    <div className="flex size-8 items-center justify-center rounded-full bg-green-100">
                                                        <Star className="size-4 fill-green-500 text-green-500" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-4 flex items-center justify-between border-t pt-4">
                                                {achievement.points !== undefined && (
                                                    <div className="flex items-center gap-1">
                                                        <Star className="h-4 w-4 text-yellow-400" />
                                                        <span className="text-sm font-medium">{achievement.points} points</span>
                                                    </div>
                                                )}
                                                {achievement.rarity && (
                                                    <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium capitalize text-primary">
                                                        {achievement.rarity}
                                                    </span>
                                                )}
                                            </div>

                                            {isUnlocked && userAchievement?.unlocked_at && (
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    Unlocked {new Date(userAchievement.unlocked_at).toLocaleDateString()}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex min-h-[40vh] items-center justify-center">
                            <div className="text-center">
                                <TrophyIcon className="mx-auto mb-4 size-16 text-muted-foreground" />
                                <h3 className="mb-2 text-xl font-bold">No achievements found</h3>
                                <p className="text-muted-foreground">Try adjusting your filters</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
