import { Head, Link, router } from "@inertiajs/react";
import { Filter, MedalIcon, TrendingUpIcon, TrophyIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        if (rank === 2) return <MedalIcon className="h-6 w-6 fill-gray-400 text-gray-400" />;
        if (rank === 3) return <MedalIcon className="h-6 w-6 fill-orange-400 text-orange-400" />;
        return null;
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

            <div className="min-h-screen bg-background">
                <main className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                                <TrophyIcon className="size-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="font-display text-3xl font-black tracking-tight">Leaderboard</h1>
                                <p className="text-muted-foreground">Top performers in the community</p>
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto max-w-3xl">
                        {/* Filters */}
                        <div className="mb-6 rounded-lg border bg-card p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Filter:</span>
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
                            <div className="space-y-3">
                                {leaderboard.map((user, index) => {
                                    const rank = index + 1;
                                    const displayValue = getDisplayValue(user);

                                    return (
                                        <Card
                                            key={user.id}
                                            className={`overflow-hidden border-none shadow-sm transition-all hover:shadow-md ${
                                                rank <= 3 ? "bg-primary/5" : ""
                                            }`}
                                        >
                                            <CardContent className="flex items-center gap-4 p-4">
                                                {/* Rank */}
                                                <div className="flex w-12 items-center justify-center">
                                                    {getRankIcon(rank) || (
                                                        <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                                                            {rank}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Avatar */}
                                                <Avatar className="size-12">
                                                    <AvatarImage src={user.avatar || undefined} alt={user.name} />
                                                    <AvatarFallback className="text-lg font-bold">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>

                                                {/* User Info */}
                                                <div className="flex-1">
                                                    <Link
                                                        href={route("downtown-guide.profile.show", user.id)}
                                                        className="text-lg font-bold hover:text-primary"
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
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex min-h-[40vh] items-center justify-center">
                                <div className="text-center">
                                    <TrophyIcon className="mx-auto mb-4 size-16 text-muted-foreground" />
                                    <h3 className="mb-2 text-xl font-bold">No leaderboard data</h3>
                                    <p className="text-muted-foreground">Check back later</p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
