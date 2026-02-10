import { usePage } from "@inertiajs/react";
import { Building2Icon, MapPinIcon, StarIcon } from "lucide-react";
import { GridCard } from "@/components/common/grid-card";
import { GridSection } from "@/components/common/grid-section";
import type { FullVenue, Venue, VenuesGridProps } from "@/types/home";

const VenuesGrid = ({ venues: propVenues, title }: { venues?: any[], title?: string }) => {
    const { featuredVenues: contextVenues } = usePage<VenuesGridProps>().props;
    const venues = propVenues || contextVenues;
    const sectionTitle = title || "Featured Venues";

    const _formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
    };

    const renderVenueContent = (venue: Venue | FullVenue) => {
        // Handle both old and new venue formats
        const location = typeof venue.location === "string" ? venue.location : (venue as FullVenue).location?.address || "Location TBD";
        const capacity = typeof venue.capacity === "string" ? venue.capacity : String((venue as FullVenue).capacity || "TBD");
        const rating = typeof venue.rating === "string" ? venue.rating : String((venue as FullVenue).rating || "0.0");
        const reviewCount = typeof venue.reviewCount === "string" ? venue.reviewCount : String((venue as FullVenue).reviewCount || "0");

        return (
            <>
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {location}
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Building2Icon className="h-4 w-4 mr-1" />
                        Capacity: {capacity}
                    </div>
                    <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{rating}</span>
                        <span className="text-xs text-muted-foreground ml-1">({reviewCount})</span>
                    </div>
                </div>
            </>
        );
    };

    if (!venues || venues.length === 0) return null;

    return (
        <GridSection
            title={sectionTitle}
            viewAllHref="/venues"
            viewAllText="View all venues"
            promoteHref="/advertise/venue-promotion"
            promoteText="Promote your venue here"
            className="bg-background"
        >
            {venues.map((venue) => (
                <GridCard
                    key={venue.id}
                    id={venue.id}
                    href={`/venues/${venue.id}`}
                    image={venue.image}
                    imageAlt={venue.name}
                    badge={venue.venueType}
                    title={venue.name}
                >
                    {renderVenueContent(venue)}
                </GridCard>
            ))}
        </GridSection>
    );
};

export default VenuesGrid;
