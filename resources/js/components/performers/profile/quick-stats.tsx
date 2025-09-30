import { Users, Music, Star, MessageCircle, Bell, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PerformerProfile } from '@/types/performer-profile';

interface PerformerQuickStatsProps {
    performer: PerformerProfile;
}

export function PerformerQuickStats({ performer }: PerformerQuickStatsProps) {
    const getFollowerGrowth = () => {
        const growth =
            performer.trendingScore > 80 ? 'fast' : performer.trendingScore > 70 ? 'steady' : 'slow';
        return {
            growth,
            percentage: growth === 'fast' ? '+12%' : growth === 'steady' ? '+5%' : '+2%',
            class:
                growth === 'fast'
                    ? 'text-green-500'
                    : growth === 'steady'
                      ? 'text-blue-500'
                      : 'text-gray-500',
        };
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });
        }
    };

    const followerGrowth = getFollowerGrowth();

    return (
        <>
            <div className="hidden md:flex bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <Users className="h-4 w-4 text-gray-500 mr-1" />
                                <span className="text-sm">
                                    {performer.followerCount.toLocaleString()} followers
                                </span>
                                <span className={`ml-1 text-xs ${followerGrowth.class}`}>
                                    {followerGrowth.percentage}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <Music className="h-4 w-4 text-gray-500 mr-1" />
                                <span className="text-sm">{performer.showsPlayed}+ shows</span>
                            </div>
                            <div className="flex items-center">
                                <Star className="h-4 w-4 text-gray-500 mr-1" />
                                <span className="text-sm">{performer.rating.toFixed(1)} rating</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Button variant="ghost" size="sm">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Message
                            </Button>
                            <Button variant="ghost" size="sm">
                                <Bell className="h-4 w-4 mr-1" />
                                Notify Me
                            </Button>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex md:hidden bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="w-full">
                    <div className="flex items-center justify-between h-14 px-4">
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" className="p-1.5">
                                <MessageCircle className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-1.5">
                                <Bell className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-1.5">
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}