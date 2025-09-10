import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GridSection } from "@/components/common/grid-section";
import type { Performer, PerformersGridProps } from "@/types/home";
import { Link, usePage } from "@inertiajs/react";
import { CalendarIcon, MicIcon, StarIcon } from "lucide-react";

const PerformersGrid = () => {
    const { featuredPerformers } = usePage<PerformersGridProps>().props;

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, "0")}/${(
            date.getMonth() + 1
        )
            .toString()
            .padStart(2, "0")}`;
    };

    const renderPerformerContent = (performer: Performer) => (
        <>
            <div className="flex flex-wrap gap-1 mb-2">
                {performer.genres.map((genre, idx) => (
                    <Badge
                        key={idx}
                        variant="secondary"
                        className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full border-0"
                    >
                        {genre}
                    </Badge>
                ))}
            </div>

            <div className="flex items-center text-sm text-gray-600 mb-1">
                <MicIcon className="h-4 w-4 mr-1" />
                {performer.homeCity}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Next show: {formatDate(performer.upcomingShow.date)}
                </div>
                <div className="flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">
                        {performer.rating}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                        ({performer.reviewCount})
                    </span>
                </div>
            </div>
        </>
    );

    return (
        <GridSection
            title="Featured Performers"
            viewAllHref="/performers"
            viewAllText="View all performers"
            promoteHref="/advertise/performer-promotion"
            promoteText="Promote your performances here"
            className="bg-gray-50"
        >
            {featuredPerformers?.map((performer) => (
                <Card
                    key={performer.id}
                    className="gap-0 bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer p-0 border-0"
                >
                    <Link
                        href={`/performers/${performer.id}`}
                        className="block"
                    >
                        <div className="h-48 overflow-hidden relative">
                            <img
                                src={performer.image}
                                alt={performer.name}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                <h3 className="font-bold text-lg text-white">
                                    {performer.name}
                                </h3>
                            </div>
                        </div>
                    </Link>

                    <CardContent className="p-3">
                        {renderPerformerContent(performer)}
                    </CardContent>
                </Card>
            ))}
        </GridSection>
    );
};

export default PerformersGrid;
