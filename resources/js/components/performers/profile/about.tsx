import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, MapPin, Calendar, Music } from 'lucide-react';
import type { PerformerProfile } from '@/types/performer-profile';

interface PerformerAboutProps {
    performer: PerformerProfile;
}

export function PerformerAbout({ performer }: PerformerAboutProps) {
    const getExperienceLevel = () => {
        if (performer.yearsActive < 3) return 'Emerging Artist';
        if (performer.yearsActive < 7) return 'Established Act';
        if (performer.yearsActive < 12) return 'Veteran Performer';
        return 'Industry Legend';
    };

    const getYearsActiveString = () => {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - performer.yearsActive;
        return `${startYear} - Present`;
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Biography</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-700 leading-relaxed">{performer.bio}</p>
                    <div className="mt-6 space-y-4">
                        <p className="text-gray-700">
                            With {performer.yearsActive} years of experience in the music industry,{' '}
                            {performer.name} has established a reputation for delivering unforgettable
                            performances that blend technical mastery with emotional depth. Their journey
                            began in {new Date().getFullYear() - performer.yearsActive} and has since
                            evolved into a distinctive sound that resonates with audiences across
                            generations.
                        </p>
                        <p className="text-gray-700">
                            {performer.name} has performed at numerous venues throughout Florida and
                            beyond, from intimate local spots to major festivals. Their commitment to
                            musical excellence and audience connection has earned them a dedicated following
                            of {performer.followerCount.toLocaleString()} fans who appreciate their
                            authentic approach and engaging stage presence.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                                <div className="text-sm font-medium text-gray-500">Based In</div>
                                <div className="text-base text-gray-900">{performer.homeCity}</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                                <div className="text-sm font-medium text-gray-500">Years Active</div>
                                <div className="text-base text-gray-900">
                                    {getYearsActiveString()} ({performer.yearsActive} years)
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Music className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                                <div className="text-sm font-medium text-gray-500">Experience Level</div>
                                <div className="text-base text-gray-900">{getExperienceLevel()}</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Music className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                                <div className="text-sm font-medium text-gray-500">Total Shows</div>
                                <div className="text-base text-gray-900">
                                    {performer.showsPlayed}+ performances
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Genres</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {performer.genres.map((genre, index) => (
                            <Badge key={index} variant="secondary" className="text-sm">
                                {genre}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Services & Offerings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            {performer.availableForBooking ? (
                                <Check className="h-5 w-5 text-green-500" />
                            ) : (
                                <X className="h-5 w-5 text-red-500" />
                            )}
                            <span className="text-sm text-gray-700">Available for Booking</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {performer.availableForPrivateEvents ? (
                                <Check className="h-5 w-5 text-green-500" />
                            ) : (
                                <X className="h-5 w-5 text-red-500" />
                            )}
                            <span className="text-sm text-gray-700">Private Events</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {performer.hasOriginalMusic ? (
                                <Check className="h-5 w-5 text-green-500" />
                            ) : (
                                <X className="h-5 w-5 text-red-500" />
                            )}
                            <span className="text-sm text-gray-700">Original Music</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {performer.takesRequests ? (
                                <Check className="h-5 w-5 text-green-500" />
                            ) : (
                                <X className="h-5 w-5 text-red-500" />
                            )}
                            <span className="text-sm text-gray-700">Takes Song Requests</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {performer.offersMeetAndGreet ? (
                                <Check className="h-5 w-5 text-green-500" />
                            ) : (
                                <X className="h-5 w-5 text-red-500" />
                            )}
                            <span className="text-sm text-gray-700">Meet & Greet</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {performer.hasMerchandise ? (
                                <Check className="h-5 w-5 text-green-500" />
                            ) : (
                                <X className="h-5 w-5 text-red-500" />
                            )}
                            <span className="text-sm text-gray-700">Merchandise Available</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {performer.isFamilyFriendly ? (
                                <Check className="h-5 w-5 text-green-500" />
                            ) : (
                                <X className="h-5 w-5 text-red-500" />
                            )}
                            <span className="text-sm text-gray-700">Family Friendly</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {performer.hasSamples ? (
                                <Check className="h-5 w-5 text-green-500" />
                            ) : (
                                <X className="h-5 w-5 text-red-500" />
                            )}
                            <span className="text-sm text-gray-700">Audio/Video Samples</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}