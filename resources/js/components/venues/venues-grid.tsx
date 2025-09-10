import { GridCard } from "@/components/common/grid-card";
import { GridSection } from "@/components/common/grid-section";
import type { Venue, VenuesGridProps } from "@/types/home";
import { usePage } from "@inertiajs/react";
import { Building2Icon, MapPinIcon, StarIcon } from "lucide-react";

const VenuesGrid = () => {
    const { featuredVenues } = usePage<VenuesGridProps>().props;

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, "0")}/${(
            date.getMonth() + 1
        )
            .toString()
            .padStart(2, "0")}`;
    };

    const renderVenueContent = (venue: Venue) => (
        <>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {venue.location}
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                    <Building2Icon className="h-4 w-4 mr-1" />
                    Capacity: {venue.capacity}
                </div>
                <div className="flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">{venue.rating}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                        ({venue.reviewCount})
                    </span>
                </div>
            </div>
        </>
    );

    return (
        <GridSection
            title="Featured Venues"
            viewAllHref="/venues"
            viewAllText="View all venues"
            promoteHref="/advertise/venue-promotion"
            promoteText="Promote your venue here"
            className="bg-background"
        >
            {featuredVenues?.map((venue) => (
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
