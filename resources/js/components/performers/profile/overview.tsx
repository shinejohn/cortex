import { Link } from "@inertiajs/react";
import { ArrowRight, Calendar, MapPin, Star } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PerformerProfile, PerformerReview, RatingStats } from "@/types/performer-profile";

interface PerformerOverviewProps {
    performer: PerformerProfile;
    ratingStats: RatingStats;
    recentReviews: PerformerReview[];
}

export function PerformerOverview({ performer, ratingStats, recentReviews }: PerformerOverviewProps) {
    const [isBioExpanded, setIsBioExpanded] = useState(false);

    const getExperienceLevel = () => {
        if (performer.yearsActive < 3) return "Emerging Artist";
        if (performer.yearsActive < 7) return "Established Act";
        if (performer.yearsActive < 12) return "Veteran Performer";
        return "Industry Legend";
    };

    const getFollowerGrowth = () => {
        const growth = performer.trendingScore > 80 ? "fast" : performer.trendingScore > 70 ? "steady" : "slow";
        return {
            growth,
            percentage: growth === "fast" ? "+12%" : growth === "steady" ? "+5%" : "+2%",
            class: growth === "fast" ? "text-green-500" : growth === "steady" ? "text-blue-500" : "text-gray-500",
        };
    };

    const followerGrowth = getFollowerGrowth();

    return (
        <div className="space-y-8">
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="flex flex-col items-center justify-center p-2 border-r border-gray-100">
                            <div className="text-sm text-gray-500 mb-1">Followers</div>
                            <div className="flex items-center">
                                <span className="text-xl font-bold">{performer.followerCount.toLocaleString()}</span>
                                <span className={`ml-1 text-xs ${followerGrowth.class}`}>{followerGrowth.percentage}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 border-r border-gray-100">
                            <div className="text-sm text-gray-500 mb-1">Shows Played</div>
                            <div className="text-xl font-bold">{performer.showsPlayed}+</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 border-r border-gray-100">
                            <div className="text-sm text-gray-500 mb-1">Experience</div>
                            <div className="text-xl font-bold">{performer.yearsActive} yrs</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 border-r border-gray-100">
                            <div className="text-sm text-gray-500 mb-1">Response Rate</div>
                            <div className="text-xl font-bold">95%</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2">
                            <div className="text-sm text-gray-500 mb-1">Next Show</div>
                            <div className="text-lg font-bold">
                                {performer.upcomingShows.length > 0
                                    ? new Date(performer.upcomingShows[0].date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                    : "TBA"}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>About {performer.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={isBioExpanded ? "" : "line-clamp-3"}>
                        <p className="text-gray-700">{performer.bio}</p>
                        {isBioExpanded && (
                            <div className="mt-4 space-y-4">
                                <p className="text-gray-700">
                                    With {performer.yearsActive} years of experience in the music industry, {performer.name} has established a
                                    reputation for delivering unforgettable performances that blend technical mastery with emotional depth.
                                </p>
                            </div>
                        )}
                    </div>
                    <Button variant="link" className="mt-2 p-0 h-auto" onClick={() => setIsBioExpanded(!isBioExpanded)}>
                        {isBioExpanded ? "Show Less" : "Read More"}
                    </Button>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-gray-200 rounded-md p-4">
                            <h3 className="font-medium text-gray-900 mb-2">Highlights</h3>
                            <ul className="space-y-2">
                                <li className="flex items-start">
                                    <Star className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
                                    <p className="text-sm text-gray-700">
                                        {getExperienceLevel()} with {performer.yearsActive} years of experience
                                    </p>
                                </li>
                                <li className="flex items-start">
                                    <Star className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
                                    <p className="text-sm text-gray-700">Performed at {Math.floor(performer.showsPlayed * 0.8)}+ venues</p>
                                </li>
                                <li className="flex items-start">
                                    <Star className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
                                    <p className="text-sm text-gray-700">
                                        {performer.rating.toFixed(1)} star average from {performer.reviewCount} reviews
                                    </p>
                                </li>
                            </ul>
                        </div>

                        <div className="border border-gray-200 rounded-md p-4">
                            <h3 className="font-medium text-gray-900 mb-2">Specialties</h3>
                            <div className="flex flex-wrap gap-2">
                                {performer.genres.map((genre, index) => (
                                    <Badge key={index} variant="secondary">
                                        {genre}
                                    </Badge>
                                ))}
                                {performer.hasOriginalMusic && <Badge variant="default">Original Music</Badge>}
                                {performer.takesRequests && <Badge variant="default">Takes Requests</Badge>}
                                {performer.availableForPrivateEvents && <Badge variant="default">Private Events</Badge>}
                                {performer.offersMeetAndGreet && <Badge variant="default">Meet & Greet</Badge>}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {performer.events.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Upcoming Events</CardTitle>
                        <Link href="/events" className="text-sm text-indigo-600 hover:text-indigo-800">
                            View All <ArrowRight className="inline h-4 w-4" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {performer.events.slice(0, 3).map((event) => (
                                <Link
                                    key={event.id}
                                    href={`/events/${event.id}`}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors block"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 mb-2">{event.title}</div>
                                        <div className="flex items-center gap-2 mb-1 text-sm">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium">
                                                {new Date(event.event_date).toLocaleDateString("en-US", {
                                                    weekday: "short",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </span>
                                            <span className="text-gray-500">at {event.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="h-4 w-4" />
                                            <span>{event.venue.name}</span>
                                            {event.venue.address && (
                                                <>
                                                    <span>•</span>
                                                    <span>{event.venue.address}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {recentReviews.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Reviews</CardTitle>
                        <Link href="#" className="text-sm text-indigo-600 hover:text-indigo-800">
                            View All <ArrowRight className="inline h-4 w-4" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentReviews.map((review) => (
                                <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                                            {review.user.avatar ? (
                                                <img src={review.user.avatar} alt={review.user.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-500 font-medium">
                                                    {review.user.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium">{review.user.name}</span>
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${
                                                                i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700">{review.content}</p>
                                            <span className="text-xs text-gray-500 mt-1">{new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
