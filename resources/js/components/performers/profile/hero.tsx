import { usePage } from "@inertiajs/react";
import { CheckCircle, Clock, MapPin, Plus, Share2, Star, Users } from "lucide-react";
import { FollowButton } from "@/components/common/follow-button";
import { Button } from "@/components/ui/button";
import type { PerformerProfile } from "@/types/performer-profile";

interface PerformerHeroProps {
    performer: PerformerProfile;
    isFollowing: boolean;
}

export function PerformerHero({ performer, isFollowing }: PerformerHeroProps) {
    const { auth } = usePage().props as { auth?: { user?: { id: string } } };

    const getYearsActiveString = () => {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - performer.yearsActive;
        return `Performing since ${startYear}`;
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `${performer.name} - Performer Profile`,
                text: `Check out ${performer.name} on GoEventCity!`,
                url: window.location.href,
            });
        }
    };

    return (
        <div className="relative">
            <div className="h-64 md:h-80 lg:h-96 w-full overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
                    alt={`${performer.name} cover`}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8 text-white">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6">
                    <div className="relative -mt-16 md:-mt-20 lg:-mt-24 z-10">
                        <div className="h-24 w-24 md:h-32 md:w-32 lg:h-40 lg:w-40 rounded-full border-4 border-white overflow-hidden bg-white">
                            <img src={performer.profileImage} alt={performer.name} className="w-full h-full object-cover" />
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">{performer.name}</h1>
                            {performer.isVerified && (
                                <div title="Verified Performer">
                                    <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm md:text-base">
                            <div className="flex gap-1 flex-wrap">
                                {performer.genres.slice(0, 2).map((genre, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>
                            <span className="text-gray-200">•</span>
                            <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{performer.homeCity}</span>
                            </div>
                            <span className="text-gray-200">•</span>
                            <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{getYearsActiveString()}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center">
                                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                <span className="ml-1">{performer.rating.toFixed(1)}</span>
                                <span className="ml-1 text-gray-300">({performer.reviewCount})</span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                <span>{performer.followerCount.toLocaleString()} followers</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-2 md:mt-0">
                        <FollowButton
                            followableType="performer"
                            followableId={performer.id}
                            variant="text"
                            className="bg-indigo-600 text-white hover:bg-indigo-700"
                            initialFollowing={isFollowing}
                        />
                        <Button onClick={handleShare} variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                            <Share2 className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
