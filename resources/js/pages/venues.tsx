import { Footer } from "@/components/common/footer";
import { GridCard } from "@/components/common/grid-card";
import { GridSection } from "@/components/common/grid-section";
import Header from "@/components/common/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CTASection } from "@/components/venues/CTASection";
import { EmptyState } from "@/components/venues/EmptyState";
import { MobileFilterSidebar } from "@/components/venues/MobileFilterSidebar";
import { FilterSidebar } from "@/components/venues/filter-sidebar";
import { cn } from "@/lib/utils";
import { SharedData } from "@/types";
import { NewVenue, TrendingVenue, Venue, VenueFilters, VenuesPageProps } from "@/types/venues";
import { Head, router, usePage } from "@inertiajs/react";
import { FilterIcon, GridIcon, ListIcon, MapIcon, MapPinIcon, SearchIcon, SlidersIcon, StarIcon, XIcon } from "lucide-react";
import React, { useState } from "react";

type ViewMode = "grid" | "list" | "map";
type SortOption = "recommended" | "popular" | "newest" | "price_low" | "price_high" | "distance" | "rating" | "capacity";

export default function VenuesPage() {
    const { venues, trendingVenues, newVenues, stats, filters, sort } = usePage<VenuesPageProps>().props;

    const { auth } = usePage<SharedData>().props;

    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [sortBy, setSortBy] = useState<SortOption>((sort as SortOption) || "popular");
    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const [showFilters, setShowFilters] = useState(false);
    const [currentFilters, setCurrentFilters] = useState(filters);

    // Handle filter changes
    const handleFilterChange = (newFilters: Partial<typeof currentFilters>) => {
        const updatedFilters = { ...currentFilters, ...newFilters };
        setCurrentFilters(updatedFilters);

        // Update URL with new filters
        router.get("/venues", updatedFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange({ search: searchQuery });
    };

    // Handle sort change
    const handleSortChange = (newSort: SortOption) => {
        setSortBy(newSort);
        router.get(
            "/venues",
            { ...currentFilters, sort: newSort },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Clear all filters
    const clearAllFilters = () => {
        setCurrentFilters({});
        setSearchQuery("");
        router.get(
            "/venues",
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const renderVenueContent = (venue: Venue) => (
        <>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {venue.location.address}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
                <StarIcon className="h-4 w-4 mr-1 text-yellow-500" />
                {venue.rating} ({venue.reviewCount} reviews)
            </div>
        </>
    );

    const renderVenueActions = (venue: Venue) => (
        <>
            <span className="text-sm font-semibold">${venue.pricing.pricePerHour.toLocaleString()}/hr</span>
        </>
    );

    const renderTrendingVenueContent = (venue: TrendingVenue) => (
        <>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {venue.location.neighborhood}
            </div>
            <div className="flex md:flex-col flex-row justify-between gap-1">
                <div className="flex items-center text-sm text-muted-foreground">
                    <StarIcon className="h-4 w-4 mr-1 text-yellow-500" />
                    {venue.rating} ({venue.reviewCount} reviews)
                </div>
                <Badge className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">{venue.venueType}</Badge>
            </div>
        </>
    );

    const renderNewVenueContent = (venue: NewVenue) => (
        <>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {venue.location.neighborhood}
            </div>
            <div className="flex md:flex-col flex-row justify-between gap-2">
                <div className="text-sm text-green-600 font-medium">
                    Just added{" "}
                    {new Date(venue.listedDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    })}
                </div>
                <Badge className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">{venue.venueType}</Badge>
            </div>
        </>
    );

    const renderTrendingVenueActions = () => <></>;

    const renderNewVenueActions = () => <></>;

    return (
        <div className="min-h-screen bg-background">
            <Head title="Venues" />

            <Header auth={auth} />

            {/* Page Title */}
            <div className="py-6 sm:py-8 bg-background">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Venues</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-8">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Filters Section */}
                    <aside className={cn("w-full lg:w-80 lg:flex-shrink-0 transition-all duration-200", showFilters ? "block" : "hidden lg:block")}>
                        <div className="lg:sticky lg:top-4">
                            <FilterSidebar filters={currentFilters} onFilterChange={handleFilterChange} onClearFilters={clearAllFilters} />
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 space-y-6">
                        {/* Search and Stats */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card p-4 sm:p-6 rounded-lg shadow-sm">
                            {/* Search */}
                            <div className="w-full lg:flex-grow lg:max-w-md">
                                <form onSubmit={handleSearch} className="relative w-full">
                                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search for venues, events, or activities..."
                                        className="pl-10 rounded-lg"
                                    />
                                </form>
                            </div>
                            {/* Quick Stats */}
                            <div className="flex justify-center gap-4 sm:gap-6 lg:gap-8 w-full lg:w-auto">
                                <div className="text-center">
                                    <div className="text-lg sm:text-xl font-bold text-primary">{stats.totalVenues}</div>
                                    <div className="text-xs text-muted-foreground">Total Venues</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg sm:text-xl font-bold text-green-600">{stats.eventsThisWeek}</div>
                                    <div className="text-xs text-muted-foreground">Events This Week</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg sm:text-xl font-bold text-purple-600">{stats.newVenuesThisWeek}</div>
                                    <div className="text-xs text-muted-foreground">New This Week</div>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
                                    <FilterIcon className="h-4 w-4 mr-2" />
                                    {showFilters ? "Hide Filters" : "Show Filters"}
                                </Button>

                                <div className="text-sm text-muted-foreground">{venues.data.length} venues found</div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                {/* View Mode Toggle */}
                                <div className="flex bg-muted rounded-lg p-1">
                                    {(["grid", "list", "map"] as const).map((mode) => (
                                        <Button
                                            key={mode}
                                            variant={viewMode === mode ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => setViewMode(mode)}
                                            className={cn("h-8 px-3 text-sm", viewMode === mode && "bg-background shadow-sm")}
                                        >
                                            {mode === "grid" && <GridIcon className="h-4 w-4" />}
                                            {mode === "list" && <ListIcon className="h-4 w-4" />}
                                            {mode === "map" && <MapIcon className="h-4 w-4" />}
                                        </Button>
                                    ))}
                                </div>

                                {/* Sort Dropdown */}
                                <select
                                    value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value as SortOption)}
                                    className="w-full sm:w-auto px-3 py-2 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-ring focus:border-ring"
                                >
                                    <option value="popular">Most Popular</option>
                                    <option value="recommended">Recommended</option>
                                    <option value="newest">Newest</option>
                                    <option value="price_low">Price: Low to High</option>
                                    <option value="price_high">Price: High to Low</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="capacity">Largest Capacity</option>
                                </select>
                            </div>
                        </div>

                        {/* Applied Filters */}
                        {Object.keys(currentFilters).filter((key) => currentFilters[key as keyof typeof currentFilters]).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {currentFilters.venue_types?.map((type) => (
                                    <Badge key={type} variant="secondary" className="flex items-center gap-1">
                                        {type}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleFilterChange({
                                                    venue_types: currentFilters.venue_types?.filter((t) => t !== type),
                                                })
                                            }
                                            className="h-4 w-4 p-0 ml-1"
                                        >
                                            <XIcon className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))}
                                {currentFilters.amenities?.map((amenity) => (
                                    <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                                        {amenity}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleFilterChange({
                                                    amenities: currentFilters.amenities?.filter((a) => a !== amenity),
                                                })
                                            }
                                            className="h-4 w-4 p-0 ml-1"
                                        >
                                            <XIcon className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))}
                                {currentFilters.search && (
                                    <Badge key="search" variant="secondary" className="flex items-center gap-1">
                                        Search: "{currentFilters.search}"
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleFilterChange({
                                                    search: "",
                                                })
                                            }
                                            className="h-4 w-4 p-0 ml-1"
                                        >
                                            <XIcon className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                )}
                                <Button variant="ghost" onClick={clearAllFilters} className="text-sm">
                                    Clear all filters
                                </Button>
                            </div>
                        )}

                        {/* Venues Grid */}
                        {viewMode === "grid" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                {venues.data.map((venue) => (
                                    <GridCard
                                        key={venue.id}
                                        id={String(venue.id)}
                                        href={`/venues/${venue.id}`}
                                        image={venue.images[0] || "/images/venue-placeholder.jpg"}
                                        imageAlt={venue.name}
                                        badge={venue.venueType}
                                        title={venue.name}
                                        actions={renderVenueActions(venue)}
                                    >
                                        {renderVenueContent(venue)}
                                    </GridCard>
                                ))}
                            </div>
                        )}

                        {/* Venues List */}
                        {viewMode === "list" && (
                            <div className="space-y-4">
                                {venues.data.map((venue) => (
                                    <GridCard
                                        key={venue.id}
                                        id={String(venue.id)}
                                        href={`/venues/${venue.id}`}
                                        image={venue.images[0] || "/images/venue-placeholder.jpg"}
                                        imageAlt={venue.name}
                                        badge={venue.venueType}
                                        title={venue.name}
                                        actions={renderVenueActions(venue)}
                                        className="flex-row"
                                    >
                                        {renderVenueContent(venue)}
                                    </GridCard>
                                ))}
                            </div>
                        )}

                        {/* Map View */}
                        {viewMode === "map" && (
                            <Card className="h-96 flex items-center justify-center">
                                <p className="text-muted-foreground">Map view coming soon...</p>
                            </Card>
                        )}

                        {/* Empty State */}
                        {venues.data.length === 0 && <EmptyState onClearFilters={clearAllFilters} />}

                        {/* Pagination */}
                        {venues.links && venues.data.length > 0 && (
                            <div className="flex justify-center">
                                <div className="flex gap-2">
                                    {venues.links.map((link, index: number) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => link.url && router.visit(link.url)}
                                            disabled={!link.url}
                                            className={cn("px-3 py-2 text-sm", !link.url && "opacity-50 cursor-not-allowed")}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Discovery Sections */}
                        {!searchQuery && !currentFilters.venue_types?.length && !currentFilters.amenities?.length && (
                            <>
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
                                                actions={renderTrendingVenueActions()}
                                            >
                                                {renderTrendingVenueContent(venue)}
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
                                                actions={renderNewVenueActions()}
                                            >
                                                {renderNewVenueContent(venue)}
                                            </GridCard>
                                        ))}
                                    </GridSection>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Sidebar */}
            {showFilters && (
                <MobileFilterSidebar filters={currentFilters} onFilterChange={handleFilterChange} onClose={() => setShowFilters(false)} />
            )}

            {/* CTA Section */}
            <CTASection />

            <Footer />
        </div>
    );
}
