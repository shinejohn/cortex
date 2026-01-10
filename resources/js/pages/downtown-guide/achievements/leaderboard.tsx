import { Head } from "@inertiajs/react";
import { TrophyIcon, MedalIcon, TrendingUpIcon, FilterIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { router } from "@inertiajs/react";
import { Link } from "@inertiajs/react";

interface DowntownGuideLeaderboardProps {
    leaderboard: Array<{
        id: string;
        name: string;
        avatar?: string;
        total_points?: number;
        level?: number;
        reviews_count?: number;
        achievements_count?: number;
    }>;
    period: string;
    type: string;
}

export default function DowntownGuideLeaderboard({ leaderboard, period, type }: DowntownGuideLeaderboardProps) {
    const handleFilterChange = (key: string, value: string) => {
        router.get(route("downtown-guide.leaderboard"), { [key]: value }, { preserveState: true });
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <MedalIcon className="h-6 w-6 fill-yellow-400 text-yellow-400" />;
        if (rank === 2) return <MedalIcon className="h-6 w-6 fill-gray-400 text-muted-foreground" />;
        if (rank === 3) return <MedalIcon className="h-6 w-6 fill-orange-400 text-orange-400" />;
        return null;
    };

    const getRankBadge = (rank: number) => {
        if (rank <= 3) return null;
        return <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-purple-900">{rank}</div>;
    };

    const getDisplayValue = (user: (typeof leaderboard)[0]) => {
        switch (type) {
            case "points":
                return user.total_points || 0;
            case "reviews":
                return user.reviews_count || 0;
            case "achievements":
                return user.achievements_count || 0;
            default:
                return user.total_points || 0;
        }
    };

    const getDisplayLabel = () => {
        switch (type) {
            case "points":
                return "Points";
            case "reviews":
                return "Reviews";
            case "achievements":
                return "Achievements";
            default:
                return "Points";
        }
    };

    return (
        <>
            <Head title="Leaderboard - DowntownsGuide" />

            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
                {/* Header */}
                <div className="border-b-4 border-purple-600 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-card/20 p-3 backdrop-blur-sm">
                                <TrophyIcon className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white">Leaderboard</h1>
                                <p className="mt-2 text-xl text-purple-100">Top performers in the community</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Filters */}
                    <div className="mb-6 rounded-xl border-2 border bg-card p-6 shadow-lg">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <FilterIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-foreground">Filter:</span>
                            </div>
                            <Select value={type} onValueChange={(value) => handleFilterChange("type", value)}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="points">Points</SelectItem>
                                    <SelectItem value="reviews">Reviews</SelectItem>
                                    <SelectItem value="achievements">Achievements</SelectItem>
                                    <SelectItem value="visits">Visits</SelectItem>
                                    <SelectItem value="referrals">Referrals</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={period} onValueChange={(value) => handleFilterChange("period", value)}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="all_time">All Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Leaderboard */}
                    {leaderboard.length > 0 ? (
                        <div className="space-y-4">
                            {leaderboard.map((user, index) => {
                                const rank = index + 1;
                                const displayValue = getDisplayValue(user);

                                return (
                                    <div
                                        key={user.id}
                                        className={`flex items-center gap-4 rounded-xl border-2 p-4 shadow-lg transition-all ${
                                            rank <= 3 ? "border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50" : "border bg-card"
                                        }`}
                                    >
                                        {/* Rank */}
                                        <div className="flex w-12 items-center justify-center">{getRankIcon(rank) || getRankBadge(rank)}</div>

                                        {/* Avatar */}
                                        <div className="flex-shrink-0">
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    className="h-12 w-12 rounded-full border-2 border"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border bg-accent">
                                                    <span className="text-lg font-bold text-primary">{user.name.charAt(0).toUpperCase()}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* User Info */}
                                        <div className="flex-1">
                                            <Link
                                                href={route("downtown-guide.profile.show", user.id)}
                                                className="text-lg font-bold text-foreground hover:text-primary"
                                            >
                                                {user.name}
                                            </Link>
                                            {user.level && <p className="text-sm text-muted-foreground">Level {user.level}</p>}
                                        </div>

                                        {/* Value */}
                                        <div className="text-right">
                                            <div className="flex items-center gap-2">
                                                <TrendingUpIcon className="h-5 w-5 text-primary" />
                                                <span className="text-2xl font-bold text-primary">{displayValue.toLocaleString()}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{getDisplayLabel()}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-xl border-2 border-dashed border bg-gradient-to-br from-purple-50 to-pink-50 p-12 text-center">
                            <TrophyIcon className="mx-auto h-12 w-12 text-purple-400" />
                            <p className="mt-4 text-lg font-bold text-foreground">No leaderboard data</p>
                            <p className="mt-2 text-sm text-muted-foreground">Check back later</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
