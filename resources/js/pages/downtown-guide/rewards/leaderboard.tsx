import DowntownGuideLayout from "@/layouts/downtown-guide-layout";
import { Head, Link } from "@inertiajs/react";
import { Auth } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LeaderboardEntry {
    id: string;
    name: string;
    total_points: number;
    current_level: string;
}

interface LeaderboardProps {
    auth: Auth;
    leaderboard: LeaderboardEntry[];
    userRank: number;
}

export default function Leaderboard({ auth, leaderboard, userRank }: LeaderboardProps) {
    return (
        <DowntownGuideLayout
            auth={auth}
            seo={{
                title: "Leaderboard",
                description: "Top community members",
            }}
        >
            <Head title="Leaderboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Community Leaderboard</h1>
                        <p className="mt-2 text-gray-600">See who's leading the pack in Downtown Guide!</p>
                        <div className="mt-4 inline-block bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full font-semibold">
                            Your Rank: #{userRank}
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {leaderboard.map((user, index) => (
                                        <tr key={user.id} className={user.id === auth.user.id ? 'bg-indigo-50' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`flex items-center justify-center h-8 w-8 rounded-full font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-600' :
                                                        index === 1 ? 'bg-gray-100 text-gray-600' :
                                                            index === 2 ? 'bg-orange-100 text-orange-600' :
                                                                'text-gray-500'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Avatar className="h-8 w-8 mr-3">
                                                        {/* Use default avatar or user avatar url if available */}
                                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.name} {user.id === auth.user.id && '(You)'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {user.current_level || 'Member'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                                {user.total_points.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </DowntownGuideLayout>
    );
}
