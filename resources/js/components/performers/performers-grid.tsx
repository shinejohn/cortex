import { usePage } from "@inertiajs/react";
import { CalendarIcon, MicIcon, StarIcon } from "lucide-react";
import { GridCard } from "@/components/common/grid-card";
import { GridSection } from "@/components/common/grid-section";
import { Badge } from "@/components/ui/badge";
import type { Performer, PerformersGridProps } from "@/types/home";

const PerformersGrid = () => {
    const { featuredPerformers } = usePage<PerformersGridProps>().props;

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
    };

    const renderPerformerContent = (performer: Performer) => (
        <>
            <div className="flex flex-wrap gap-1 mb-2">
                {performer.genres.map((genre, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                        {genre}
                    </Badge>
                ))}
            </div>

            <div className="flex items-center text-sm text-muted-foreground mb-1">
                <MicIcon className="h-4 w-4 mr-1" />
                {performer.homeCity}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {performer.upcomingShow ? <>Next show: {formatDate(performer.upcomingShow.date)}</> : "No upcoming shows"}
                </div>
                <div className="flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">{performer.rating}</span>
                    <span className="text-xs text-muted-foreground ml-1">({performer.reviewCount})</span>
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
            className="bg-muted/50"
        >
            {featuredPerformers?.map((performer) => (
                <GridCard
                    key={performer.id}
                    id={performer.id}
                    href={`/performers/${performer.id}`}
                    image={performer.image}
                    imageAlt={performer.name}
                    title={performer.name}
                    hideTitle={true}
                    detailsButton={false}
                    imageOverlay={
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                            <h3 className="font-bold text-lg text-white">{performer.name}</h3>
                        </div>
                    }
                >
                    {renderPerformerContent(performer)}
                </GridCard>
            ))}
        </GridSection>
    );
};

export default PerformersGrid;
