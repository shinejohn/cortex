import { Head, Link, router, usePage } from "@inertiajs/react";
import { CalendarIcon, ClockIcon, FilterIcon, GridIcon, ListIcon, MapPinIcon, SearchIcon, StarIcon, TicketIcon, XIcon } from "lucide-react";
import { useState } from "react";
import CTASection from "@/components/common/cta-section";
import { Footer } from "@/components/common/footer";
import { GridCard } from "@/components/common/grid-card";
import Header from "@/components/common/header";
import { FilterSidebar, TicketFilters } from "@/components/tickets/filter-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type Event } from "@/types/events";

type ViewMode = "grid" | "list";
type SortOption = "date" | "price_low" | "price_high" | "popularity" | "recommended";

interface PaginatedEvents {
    data: Event[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface TicketsPageProps {
    auth: {
        user?: {
            id: string;
            name: string;
            email: string;
        };
    };
    events: PaginatedEvents;
    featuredEvents: Event[];
    filters: TicketFilters;
    sort: SortOption;
}

export default function Tickets() {
    const { auth, events, featuredEvents = [], filters, sort } = usePage().props as unknown as TicketsPageProps;

    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [sortBy, setSortBy] = useState<SortOption>(sort || "date");
    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const [showFilters, setShowFilters] = useState(false);
    const [currentFilters, setCurrentFilters] = useState(filters);

    // Handle filter changes
    const handleFilterChange = (newFilters: Partial<TicketFilters>) => {
        const updatedFilters = { ...currentFilters, ...newFilters };
        setCurrentFilters(updatedFilters);

        // Build query parameters
        const params: Record<string, string | string[]> = {};
        Object.entries(updatedFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                if (Array.isArray(value)) {
                    params[key] = value;
                } else {
                    params[key] = value.toString();
                }
            }
        });

        // Use Inertia router for smooth navigation
        router.get("/tickets", params, {
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

        // Build query parameters
        const params: Record<string, string | string[]> = { sort: newSort };
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                if (Array.isArray(value)) {
                    params[key] = value;
                } else {
                    params[key] = value.toString();
                }
            }
        });

        // Use Inertia router for smooth navigation
        router.get("/tickets", params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Clear all filters
    const clearAllFilters = () => {
        setCurrentFilters({});
        setSearchQuery("");
        router.get(
            "/tickets",
            {},
            {
                preserveState: true,
                preserveScroll: false,
            },
        );
    };

    const renderEventContent = (event: Event) => (
        <>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {new Date(event.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                })}
            </div>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
                <ClockIcon className="h-4 w-4 mr-1" />
                {new Date(event.date).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                })}
            </div>
            <div className="flex items-center text-sm text-muted-foreground mb-3">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {event.venue?.name || "TBD"}
            </div>
            {event.communityRating && (
                <div className="flex items-center text-sm text-muted-foreground">
                    <StarIcon className="h-4 w-4 mr-1 text-yellow-500" />
                    {Number(event.communityRating).toFixed(1)}
                </div>
            )}
        </>
    );

    const renderEventActions = (event: Event) => (
        <>
            <span className="text-sm font-semibold">{event.price?.isFree ? "Free" : `$${event.price?.min}`}</span>
        </>
    );

    return (
        <>
            <Head title="Tickets & Passes" />

            <Header auth={auth} />

            {/* Hero Section */}
            <div className="bg-primary text-primary-foreground py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold sm:text-5xl">Tickets & Passes</h1>
                        <p className="mt-3 text-xl">Buy and manage tickets for local events</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Filters Section */}
                    <aside className={cn("w-full lg:w-80 lg:flex-shrink-0 transition-all duration-200", showFilters ? "block" : "hidden lg:block")}>
                        <div className="lg:sticky lg:top-4">
                            <FilterSidebar filters={currentFilters} onFilterChange={handleFilterChange} onClearFilters={clearAllFilters} />
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 space-y-6">
                        {/* Search and Controls */}
                        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm space-y-4">
                            {/* Search */}
                            <div className="w-full">
                                <form onSubmit={handleSearch} className="relative w-full">
                                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search for events..."
                                        className="pl-10 rounded-lg"
                                    />
                                </form>
                            </div>

                            {/* Controls */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                                    <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
                                        <FilterIcon className="h-4 w-4 mr-2" />
                                        {showFilters ? "Hide Filters" : "Show Filters"}
                                    </Button>

                                    <div className="text-sm text-muted-foreground">{events.data.length} events found</div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                    {/* View Mode Toggle */}
                                    <div className="flex bg-muted rounded-lg p-1">
                                        {(["grid", "list"] as const).map((mode) => (
                                            <Button
                                                key={mode}
                                                variant={viewMode === mode ? "default" : "ghost"}
                                                size="sm"
                                                onClick={() => setViewMode(mode)}
                                                className={cn("h-8 px-3 text-sm", viewMode === mode && "bg-background shadow-sm")}
                                            >
                                                {mode === "grid" && <GridIcon className="h-4 w-4" />}
                                                {mode === "list" && <ListIcon className="h-4 w-4" />}
                                            </Button>
                                        ))}
                                    </div>

                                    {/* Sort Dropdown */}
                                    <select
                                        value={sortBy}
                                        onChange={(e) => handleSortChange(e.target.value as SortOption)}
                                        className="w-full sm:w-auto px-3 py-2 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-ring focus:border-ring"
                                    >
                                        <option value="date">Date: Soonest First</option>
                                        <option value="recommended">Recommended</option>
                                        <option value="price_low">Price: Low to High</option>
                                        <option value="price_high">Price: High to Low</option>
                                        <option value="popularity">Most Popular</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Applied Filters */}
                        {Object.keys(currentFilters).filter((key) => currentFilters[key as keyof typeof currentFilters]).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {currentFilters.categories?.map((category) => (
                                    <Badge key={category} variant="secondary" className="flex items-center gap-1">
                                        {category}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleFilterChange({
                                                    categories: currentFilters.categories?.filter((c) => c !== category),
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
                                {currentFilters.date && (
                                    <Badge key="date" variant="secondary" className="flex items-center gap-1">
                                        Date: {new Date(currentFilters.date).toLocaleDateString()}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleFilterChange({
                                                    date: undefined,
                                                })
                                            }
                                            className="h-4 w-4 p-0 ml-1"
                                        >
                                            <XIcon className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                )}
                                {currentFilters.free_only && (
                                    <Badge key="free" variant="secondary" className="flex items-center gap-1">
                                        Free Events
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleFilterChange({
                                                    free_only: undefined,
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

                        {/* Events Grid */}
                        {viewMode === "grid" && events.data.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                {events.data.map((event) => (
                                    <GridCard
                                        key={event.id}
                                        id={event.id}
                                        href={`/events/${event.id}/tickets`}
                                        image={event.image}
                                        imageAlt={event.title}
                                        badge={event.category}
                                        title={event.title}
                                        actions={renderEventActions(event)}
                                    >
                                        {renderEventContent(event)}
                                    </GridCard>
                                ))}
                            </div>
                        )}

                        {/* Events List */}
                        {viewMode === "list" && events.data.length > 0 && (
                            <div className="space-y-4">
                                {events.data.map((event) => (
                                    <GridCard
                                        key={event.id}
                                        id={event.id}
                                        href={`/events/${event.id}/tickets`}
                                        image={event.image}
                                        imageAlt={event.title}
                                        badge={event.category}
                                        title={event.title}
                                        actions={renderEventActions(event)}
                                        className="flex-row"
                                    >
                                        {renderEventContent(event)}
                                    </GridCard>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {events.data.length === 0 && (
                            <Card className="p-8 text-center">
                                <div className="mx-auto h-24 w-24 text-muted-foreground">
                                    <TicketIcon className="h-24 w-24" />
                                </div>
                                <h3 className="mt-4 text-lg font-medium">No events found</h3>
                                <p className="mt-2 text-muted-foreground">Try adjusting your filters or search query to find more events.</p>
                                <div className="mt-6">
                                    <Button onClick={clearAllFilters}>Reset all filters</Button>
                                </div>
                            </Card>
                        )}

                        {/* Pagination */}
                        {events.links && events.data.length > 0 && (
                            <div className="flex justify-center">
                                <div className="flex gap-2">
                                    {events.links.map((link, index: number) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            onClick={() =>
                                                link.url &&
                                                router.get(
                                                    link.url,
                                                    {},
                                                    {
                                                        preserveState: true,
                                                        preserveScroll: false,
                                                    },
                                                )
                                            }
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

                        {/* Featured Events Section */}
                        {!searchQuery && !currentFilters.categories?.length && featuredEvents.length > 0 && (
                            <div className="mt-12">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">Featured Events</h2>
                                    <Link href="/events" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center font-medium text-sm">
                                        View all events
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {featuredEvents.slice(0, 6).map((event) => (
                                        <GridCard
                                            key={event.id}
                                            id={event.id}
                                            href={`/events/${event.id}/tickets`}
                                            image={event.image}
                                            imageAlt={event.title}
                                            badge={event.category}
                                            title={event.title}
                                            actions={renderEventActions(event)}
                                        >
                                            {renderEventContent(event)}
                                        </GridCard>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CTASection />
            <Footer />
        </>
    );
}
