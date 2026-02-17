import DowntownGuideLayout from "@/layouts/downtown-guide-layout";
import { Head, Link } from "@inertiajs/react";
import { Auth } from "@/types";
import { route } from "ziggy-js";
import { Trophy, Star, TrendingUp, Medal, Award, Store } from "lucide-react";

interface Stats {
    total_points: number;
    lifetime_points: number;
    current_level: string;
    level_number: number;
    rank: number;
}

interface Achievement {
    id: string;
    completed_at: string;
    achievement: {
        title: string;
        description: string;
        badge_image_url?: string;
        points: number;
    };
}

interface LoyaltyProgram {
    id: string;
    points_balance: number;
    current_tier: string;
    business: {
        id: string;
        name: string;
    };
}

interface RewardsIndexProps {
    auth: Auth;
    stats: Stats;
    achievements: Achievement[];
    loyalty: LoyaltyProgram[];
}

export default function RewardsIndex({ auth, stats, achievements, loyalty }: RewardsIndexProps) {
    return (
        <DowntownGuideLayout
            auth={auth}
            seo={{
                title: "My Rewards",
                description: "Track your points and achievements",
            }}
        >
            <Head title="My Rewards" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
                            <div className="flex items-center space-x-3 mb-2">
                                <Star className="h-6 w-6 text-yellow-300" />
                                <h3 className="text-lg font-semibold">Total Points</h3>
                            </div>
                            <p className="text-3xl font-bold">{stats.total_points}</p>
                            <p className="text-sm opacity-80 mt-1">Lifetime: {stats.lifetime_points}</p>
                        </div>
                        <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center space-x-3 mb-2">
                                <Trophy className="h-6 w-6 text-yellow-500" />
                                <h3 className="text-lg font-semibold text-gray-900">Current Level</h3>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stats.current_level}</p>
                            <p className="text-sm text-gray-500 mt-1">Level {stats.level_number}</p>
                        </div>
                        <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center space-x-3 mb-2">
                                <TrendingUp className="h-6 w-6 text-green-500" />
                                <h3 className="text-lg font-semibold text-gray-900">Your Rank</h3>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">#{stats.rank}</p>
                            <Link href={route('downtown-guide.rewards.leaderboard')} className="text-sm text-indigo-600 hover:underline mt-1 block">
                                View Leaderboard
                            </Link>
                        </div>
                        <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center space-x-3 mb-2">
                                <Medal className="h-6 w-6 text-orange-500" />
                                <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{achievements.length}</p>
                            <p className="text-sm text-gray-500 mt-1">Badges Earned</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Loyalty Programs */}
                        <div className="lg:col-span-2">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">My Loyalty Programs</h2>
                            {loyalty.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {loyalty.map((program) => (
                                        <div key={program.id} className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center space-x-3">
                                                    <div className="bg-blue-100 p-2 rounded-full">
                                                        <Store className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{program.business.name}</h3>
                                                        <p className="text-xs text-gray-500">{program.current_tier} Member</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <p className="text-2xl font-bold text-indigo-600">{program.points_balance} pts</p>
                                                <p className="text-xs text-gray-400">Available Balance</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white p-6 rounded-lg border text-center text-gray-500">
                                    <p>You haven't joined any loyalty programs yet.</p>
                                    <p className="text-sm mt-2">Visit businesses to start earning points!</p>
                                </div>
                            )}
                        </div>

                        {/* Recent Achievements */}
                        <div className="lg:col-span-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Achievements</h2>
                            <div className="bg-white rounded-lg border shadow-sm divide-y">
                                {achievements.length > 0 ? (
                                    achievements.slice(0, 5).map((userAchievement) => (
                                        <div key={userAchievement.id} className="p-4 flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                {userAchievement.achievement.badge_image_url ? (
                                                    <img src={userAchievement.achievement.badge_image_url} alt="" className="h-10 w-10 rounded-full" />
                                                ) : (
                                                    <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                                        <Award className="h-5 w-5 text-yellow-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">{userAchievement.achievement.title}</h4>
                                                <p className="text-xs text-gray-500">{userAchievement.achievement.description}</p>
                                                <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                    +{userAchievement.achievement.points} pts
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-gray-500">
                                        <p>No achievements unlocked yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DowntownGuideLayout>
    );
}
