import { GridCard } from "@/components/common/grid-card";
import { GridSection } from "@/components/common/grid-section";
import { Button } from "@/components/ui/button";
import { NewVenue, TrendingVenue } from "@/types/venues";
import { ArrowRightIcon, MapPinIcon, StarIcon } from "lucide-react";
import React from "react";

interface DiscoverySectionsProps {
    trendingVenues: readonly TrendingVenue[];
    newVenues: readonly NewVenue[];
    onVenueClick: (venueId: number) => void;
    onCollectionClick: (collectionPath: string) => void;
}

export const DiscoverySections = ({ trendingVenues, newVenues, onVenueClick }: DiscoverySectionsProps) => (
    <div className="space-y-16">
        {/* Trending Venues */}
        {trendingVenues.length > 0 && (
            <GridSection
                title="Trending Venues"
                description="Most popular places right now"
                viewAllHref="/venues?sort=popular"
                viewAllText="View all trending"
                promoteHref="/promote-venue"
                promoteText="Promote your venue here"
                className="bg-muted/50"
            >
                {trendingVenues.map((venue, index: number) => (
                    <GridCard
                        key={venue.id}
                        id={String(venue.id)}
                        href={`/venues/${venue.id}`}
                        image={venue.images[0] || "/images/venue-placeholder.jpg"}
                        imageAlt={venue.name}
                        badge={`Trending #${index + 1}`}
                        title={venue.name}
                        actions={
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    onVenueClick(venue.id);
                                }}
                                className="text-muted-foreground hover:text-primary p-1 h-8 w-8"
                                title="View Details"
                            >
                                <ArrowRightIcon className="h-4 w-4" />
                            </Button>
                        }
                    >
                        <div className="flex items-center text-sm text-muted-foreground mb-1">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {venue.location.neighborhood}
                        </div>
                        <div className="flex items-center">
                            <StarIcon className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            <span className="font-medium">{venue.rating}</span>
                            <span className="text-muted-foreground ml-1">({venue.reviewCount})</span>
                        </div>
                    </GridCard>
                ))}
            </GridSection>
        )}

        {/* New Venues */}
        {newVenues.length > 0 && (
            <GridSection
                title="New Venues"
                description="Just added to our collection"
                viewAllHref="/venues?sort=newest"
                viewAllText="View all new venues"
                promoteHref="/promote-venue"
                promoteText="Promote your venue here"
            >
                {newVenues.map((venue) => (
                    <GridCard
                        key={venue.id}
                        id={String(venue.id)}
                        href={`/venues/${venue.id}`}
                        image={venue.images[0] || "/images/venue-placeholder.jpg"}
                        imageAlt={venue.name}
                        badge="New Venue"
                        title={venue.name}
                        actions={
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    onVenueClick(venue.id);
                                }}
                                className="text-muted-foreground hover:text-primary p-1 h-8 w-8"
                                title="View Details"
                            >
                                <ArrowRightIcon className="h-4 w-4" />
                            </Button>
                        }
                    >
                        <div className="flex items-center text-sm text-muted-foreground mb-1">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {venue.location.neighborhood}
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                            Just added{" "}
                            {new Date(venue.listedDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                            })}
                        </div>
                    </GridCard>
                ))}
            </GridSection>
        )}
    </div>
);
