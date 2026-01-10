import { Head, Link } from "@inertiajs/react";
import { GiftIcon, StarIcon, TrendingUpIcon, TrophyIcon, UserIcon, UsersIcon } from "lucide-react";
import { BusinessList } from "@/components/shared/business/BusinessList";
import { ReviewList } from "@/components/shared/reviews/ReviewList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DowntownGuideProfileShowProps {
    user: {
        id: string;
        name: string;
        email?: string;
        avatar?: string;
        bio?: string;
        slug?: string;
        total_points?: number;
        level?: number;
    };
    stats: {
        reviews_count: number;
        ratings_count: number;
        articles_count: number;
        events_count: number;
        coupons_count: number;
        followers_count: number;
        following_count: number;
        total_points: number;
        level: number;
        achievements_count: number;
    };
    activity: Array<{
        id: string;
        type: string;
        description: string;
        created_at?: string;
    }>;
    level: number;
    achievements: Array<{
        id: string;
        name: string;
        description?: string;
        icon?: string;
        unlocked_at?: string;
    }>;
    points: number;
    loyaltyPrograms: Array<{
        id: string;
        business_name: string;
        points: number;
    }>;
    referrals: Array<{
        id: string;
        referred_user_name: string;
        status: string;
    }>;
}

export default function DowntownGuideProfileShow({
    user,
    stats,
    activity,
    level,
    achievements,
    points,
    loyaltyPrograms,
    referrals,
}: DowntownGuideProfileShowProps) {
    return (
        <>
            <Head title={`${user.name}'s Profile - DowntownsGuide`} />

            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
                {/* Header */}
                <div className="border-b-4 border-purple-600 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-6">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-24 w-24 rounded-full border-4 border-white shadow-lg" />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-card/20 shadow-lg">
                                    <UserIcon className="h-12 w-12 text-white" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                                {user.bio && <p className="mt-2 text-purple-100">{user.bio}</p>}
                                <div className="mt-4 flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <TrophyIcon className="h-5 w-5 text-yellow-300" />
                                        <span className="text-white">Level {level}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StarIcon className="h-5 w-5 text-yellow-300" />
                                        <span className="text-white">{points.toLocaleString()} Points</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border-2 border bg-card p-6 shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-accent p-2">
                                    <StarIcon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.reviews_count}</p>
                                    <p className="text-sm text-muted-foreground">Reviews</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border-2 border bg-card p-6 shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-pink-100 p-2">
                                    <TrophyIcon className="h-6 w-6 text-pink-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.achievements_count}</p>
                                    <p className="text-sm text-muted-foreground">Achievements</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border-2 border bg-card p-6 shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-accent p-2">
                                    <UsersIcon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.followers_count}</p>
                                    <p className="text-sm text-muted-foreground">Followers</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border-2 border bg-card p-6 shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-pink-100 p-2">
                                    <GiftIcon className="h-6 w-6 text-pink-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{loyaltyPrograms.length}</p>
                                    <p className="text-sm text-muted-foreground">Loyalty Programs</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="activity" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 bg-accent/50">
                            <TabsTrigger value="activity" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                Activity
                            </TabsTrigger>
                            <TabsTrigger value="achievements" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                <TrophyIcon className="mr-2 h-4 w-4" />
                                Achievements ({achievements.length})
                            </TabsTrigger>
                            <TabsTrigger value="loyalty" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                <GiftIcon className="mr-2 h-4 w-4" />
                                Loyalty ({loyaltyPrograms.length})
                            </TabsTrigger>
                            <TabsTrigger value="referrals" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                <UsersIcon className="mr-2 h-4 w-4" />
                                Referrals ({referrals.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="activity" className="mt-6">
                            <div className="rounded-xl border-2 border bg-card p-6 shadow-lg">
                                <h2 className="mb-4 text-xl font-bold text-foreground">Recent Activity</h2>
                                {activity.length > 0 ? (
                                    <div className="space-y-4">
                                        {activity.map((item) => (
                                            <div key={item.id} className="flex items-start gap-4 border-b border pb-4 last:border-0">
                                                <TrendingUpIcon className="h-5 w-5 text-primary" />
                                                <div className="flex-1">
                                                    <p className="text-sm text-foreground">{item.description}</p>
                                                    {item.created_at && (
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {new Date(item.created_at).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground">
                                        <p>No recent activity</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="achievements" className="mt-6">
                            <div className="rounded-xl border-2 border bg-card p-6 shadow-lg">
                                <h2 className="mb-4 text-xl font-bold text-foreground">Achievements</h2>
                                {achievements.length > 0 ? (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {achievements.map((achievement) => (
                                            <div
                                                key={achievement.id}
                                                className="rounded-lg border-2 border bg-gradient-to-r from-purple-50 to-pink-50 p-4"
                                            >
                                                {achievement.icon && <div className="mb-2 text-3xl">{achievement.icon}</div>}
                                                <h3 className="font-bold text-foreground">{achievement.name}</h3>
                                                {achievement.description && (
                                                    <p className="mt-1 text-sm text-muted-foreground">{achievement.description}</p>
                                                )}
                                                {achievement.unlocked_at && (
                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                        Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground">
                                        <TrophyIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <p className="mt-4">No achievements yet</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="loyalty" className="mt-6">
                            <div className="rounded-xl border-2 border bg-card p-6 shadow-lg">
                                <h2 className="mb-4 text-xl font-bold text-foreground">Loyalty Programs</h2>
                                {loyaltyPrograms.length > 0 ? (
                                    <div className="space-y-4">
                                        {loyaltyPrograms.map((program) => (
                                            <div
                                                key={program.id}
                                                className="flex items-center justify-between rounded-lg border-2 border bg-gradient-to-r from-purple-50 to-pink-50 p-4"
                                            >
                                                <div>
                                                    <h3 className="font-bold text-foreground">{program.business_name}</h3>
                                                    <p className="text-sm text-muted-foreground">Loyalty Program</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-primary">{program.points}</p>
                                                    <p className="text-xs text-muted-foreground">Points</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground">
                                        <GiftIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <p className="mt-4">Not enrolled in any loyalty programs</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="referrals" className="mt-6">
                            <div className="rounded-xl border-2 border bg-card p-6 shadow-lg">
                                <h2 className="mb-4 text-xl font-bold text-foreground">Referrals</h2>
                                {referrals.length > 0 ? (
                                    <div className="space-y-4">
                                        {referrals.map((referral) => (
                                            <div
                                                key={referral.id}
                                                className="flex items-center justify-between rounded-lg border-2 border bg-card p-4"
                                            >
                                                <div>
                                                    <p className="font-medium text-foreground">{referral.referred_user_name}</p>
                                                    <p className="text-sm text-muted-foreground">Referred user</p>
                                                </div>
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                        referral.status === "completed"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                                >
                                                    {referral.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground">
                                        <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <p className="mt-4">No referrals yet</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
}
