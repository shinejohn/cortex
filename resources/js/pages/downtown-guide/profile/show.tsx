import { Head, Link } from "@inertiajs/react";
import { GiftIcon, Star, TrendingUpIcon, TrophyIcon, UserIcon, UsersIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

            <div className="min-h-screen bg-background">
                {/* Profile Header */}
                <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-6">
                            <Avatar className="size-24 border-4 border-background shadow-lg">
                                <AvatarImage src={user.avatar || undefined} alt={user.name} />
                                <AvatarFallback className="text-2xl">
                                    {user.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="font-display text-3xl font-black tracking-tight">{user.name}</h1>
                                {user.bio && <p className="mt-2 text-muted-foreground">{user.bio}</p>}
                                <div className="mt-4 flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <TrophyIcon className="h-5 w-5 text-yellow-500" />
                                        <span className="font-medium">Level {level}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-yellow-500" />
                                        <span className="font-medium">{points.toLocaleString()} Points</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <main className="container mx-auto px-4 py-8">
                    {/* Stats Cards */}
                    <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="overflow-hidden border-none shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                        <Star className="size-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats?.reviews_count ?? 0}</p>
                                        <p className="text-sm text-muted-foreground">Reviews</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden border-none shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                        <TrophyIcon className="size-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats?.achievements_count ?? 0}</p>
                                        <p className="text-sm text-muted-foreground">Achievements</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden border-none shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                        <UsersIcon className="size-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats?.followers_count ?? 0}</p>
                                        <p className="text-sm text-muted-foreground">Followers</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden border-none shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                        <GiftIcon className="size-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{loyaltyPrograms?.length ?? 0}</p>
                                        <p className="text-sm text-muted-foreground">Loyalty Programs</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="activity" className="w-full">
                        <TabsList className="mb-6">
                            <TabsTrigger value="activity">Activity</TabsTrigger>
                            <TabsTrigger value="achievements">
                                Achievements ({achievements?.length ?? 0})
                            </TabsTrigger>
                            <TabsTrigger value="loyalty">
                                Loyalty ({loyaltyPrograms?.length ?? 0})
                            </TabsTrigger>
                            <TabsTrigger value="referrals">
                                Referrals ({referrals?.length ?? 0})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="activity">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {activity.length > 0 ? (
                                        <div className="space-y-4">
                                            {activity.map((item) => (
                                                <div key={item.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                                                    <TrendingUpIcon className="mt-0.5 size-5 shrink-0 text-primary" />
                                                    <div className="flex-1">
                                                        <p className="text-sm">{item.description}</p>
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
                                        <p className="py-8 text-center text-muted-foreground">No recent activity</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="achievements">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Achievements</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {achievements.length > 0 ? (
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {achievements.map((achievement) => (
                                                <div
                                                    key={achievement.id}
                                                    className="rounded-lg border bg-muted/50 p-4 transition-colors hover:bg-muted"
                                                >
                                                    {achievement.icon && <div className="mb-2 text-3xl">{achievement.icon}</div>}
                                                    <h3 className="font-bold">{achievement.name}</h3>
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
                                        <div className="py-8 text-center">
                                            <TrophyIcon className="mx-auto size-12 text-muted-foreground" />
                                            <p className="mt-4 text-muted-foreground">No achievements yet</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="loyalty">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Loyalty Programs</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loyaltyPrograms.length > 0 ? (
                                        <div className="space-y-3">
                                            {loyaltyPrograms.map((program) => (
                                                <div
                                                    key={program.id}
                                                    className="flex items-center justify-between rounded-lg border bg-muted/50 p-4"
                                                >
                                                    <div>
                                                        <h3 className="font-bold">{program.business_name}</h3>
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
                                        <div className="py-8 text-center">
                                            <GiftIcon className="mx-auto size-12 text-muted-foreground" />
                                            <p className="mt-4 text-muted-foreground">Not enrolled in any loyalty programs</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="referrals">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Referrals</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {referrals.length > 0 ? (
                                        <div className="space-y-3">
                                            {referrals.map((referral) => (
                                                <div
                                                    key={referral.id}
                                                    className="flex items-center justify-between rounded-lg border bg-card p-4"
                                                >
                                                    <div>
                                                        <p className="font-medium">{referral.referred_user_name}</p>
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
                                        <div className="py-8 text-center">
                                            <UsersIcon className="mx-auto size-12 text-muted-foreground" />
                                            <p className="mt-4 text-muted-foreground">No referrals yet</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </>
    );
}
