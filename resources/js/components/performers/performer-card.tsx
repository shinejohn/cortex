import { Link } from "@inertiajs/react";
import { CalendarIcon, HeartIcon, MicIcon, ShareIcon, StarIcon } from "lucide-react";
import { useState } from "react";
import { GridCard } from "@/components/common/grid-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Performer } from "@/types/performers";

interface PerformerCardProps {
    performer: Performer;
    showActions?: boolean;
}

export function PerformerCard({ performer, showActions = true }: PerformerCardProps) {
    const [isLiked, setIsLiked] = useState(false);

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (navigator.share) {
            navigator.share({
                title: performer.name,
                text: `Check out this performer: ${performer.name}`,
                url: window.location.origin + `/performers/${performer.id}`,
            });
        } else {
            navigator.clipboard.writeText(`${window.location.origin}/performers/${performer.id}`);
        }
    };

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsLiked(!isLiked);
    };

    const renderPerformerContent = () => (
        <>
            {/* Performer type and main genre */}
            <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-xs">
                    {performer.genres[0] || "Music"}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                    <MicIcon className="h-3 w-3 mr-1" />
                    <span className="text-xs">Band</span>
                </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-1 mb-2">
                {performer.genres.slice(1).map((genre, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                        {genre}
                    </Badge>
                ))}
            </div>

            {/* Rating */}
            <div className="flex items-center mb-2">
                <div className="flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">{performer.rating}</span>
                    <span className="text-xs text-muted-foreground ml-1">({performer.reviewCount} reviews)</span>
                </div>
            </div>

            {/* Next show */}
            <div className="flex items-center text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span className="text-xs">
                    {performer.upcomingShow ? (
                        <>
                            Next: {formatDate(performer.upcomingShow.date)} at {performer.upcomingShow.venue || "Capitol Theatre"}
                        </>
                    ) : (
                        "No upcoming shows"
                    )}
                </span>
            </div>
        </>
    );

    const renderPerformerActions = () => {
        if (!showActions) return null;

        return (
            <>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    className="text-muted-foreground hover:text-primary p-1 h-8 w-8"
                    title="Share Performer"
                >
                    <ShareIcon className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLike}
                    className={`text-muted-foreground hover:text-primary p-1 h-8 w-8 ${isLiked ? "text-red-500 hover:text-red-600" : ""}`}
                    title={isLiked ? "Remove from favorites" : "Add to favorites"}
                >
                    <HeartIcon className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                </Button>
            </>
        );
    };

    return (
        <GridCard
            id={performer.id}
            href={`/performers/${performer.id}`}
            image={performer.image}
            imageAlt={performer.name}
            title={performer.name}
            hideTitle={true}
            detailsButton={false}
            actions={renderPerformerActions()}
            imageOverlay={
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <h3 className="font-bold text-lg text-white mb-0.5">{performer.name}</h3>
                    <p className="text-white/80 text-sm">{performer.homeCity}</p>
                </div>
            }
        >
            {renderPerformerContent()}
        </GridCard>
    );
}
