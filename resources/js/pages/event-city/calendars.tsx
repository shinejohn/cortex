import { CalendarFilters } from "@/components/calendars/calendar_filters";
import { Footer } from "@/components/common/footer";
import { GridCard } from "@/components/common/grid-card";
import { GridSection } from "@/components/common/grid-section";
import Header from "@/components/common/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { SharedData } from "@/types";
import { Calendar, CalendarsPageProps, NewCalendar, TrendingCalendar } from "@/types/calendars";
import { Head, router, usePage } from "@inertiajs/react";
import { FilterIcon, GridIcon, ListIcon, MapPinIcon, SearchIcon, UsersIcon, XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

type ViewMode = "grid" | "list";
type SortOption = "trending" | "followers" | "updated" | "new";

export default function CalendarsPage() {
    const { calendars, trendingCalendars, newCalendars, stats, filters, sort } = usePage<CalendarsPageProps>().props;

    const { auth } = usePage<SharedData>().props;

    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [sortBy, setSortBy] = useState<SortOption>((sort as SortOption) || "trending");
    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const [showFilters, setShowFilters] = useState(false);
    const [currentFilters, setCurrentFilters] = useState(filters);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (filters.search || "")) {
                handleFilterChange({ search: searchQuery || undefined });
            }
        }, 500);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    // Handle filter changes
    const handleFilterChange = (newFilters: Partial<typeof currentFilters>, newSort?: SortOption) => {
        const updatedFilters = { ...currentFilters, ...newFilters };
        setCurrentFilters(updatedFilters);

        // Build query params, filtering out undefined/null/empty values
        const params: Record<string, string> = {};
        Object.entries(updatedFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params[key] = value.toString();
            }
        });

        // Add sort if provided
        if (newSort) {
            params.sort = newSort;
        } else if (sortBy) {
            params.sort = sortBy;
        }

        // Use Inertia router for client-side navigation
        router.get("/calendars", params, {
            preserveState: true,
            preserveScroll: true,
            only: ["calendars", "filters"],
        });
    };

    // Handle search submit (prevent default form submission)
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Search is handled by the debounced useEffect
    };

    // Handle sort change
    const handleSortChange = (newSort: SortOption) => {
        setSortBy(newSort);
        handleFilterChange({}, newSort);
    };

    // Clear all filters
    const clearAllFilters = () => {
        setCurrentFilters({});
        setSearchQuery("");
        router.get("/calendars", {}, { preserveState: true, preserveScroll: true });
    };

    const renderCalendarContent = (calendar: Calendar) => (
        <>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
                <UsersIcon className="h-4 w-4 mr-1" />
                {calendar.followers_count.toLocaleString()} followers
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
                {calendar.events_count} events • {calendar.update_frequency}
            </div>
        </>
    );

    const renderCalendarActions = (calendar: Calendar) => (
        <>
            {calendar.subscription_price > 0 ? (
                <span className="text-sm font-semibold">${Number(calendar.subscription_price).toFixed(2)}/mo</span>
            ) : (
                <span className="text-sm font-semibold text-green-600">Free</span>
            )}
        </>
    );

    const renderTrendingCalendarContent = (calendar: TrendingCalendar) => (
        <>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
                <UsersIcon className="h-4 w-4 mr-1" />
                {calendar.followers_count.toLocaleString()} followers
            </div>
            <div className="flex md:flex-col flex-row justify-between gap-1">
                <div className="flex items-center text-sm text-muted-foreground">{calendar.events_count} events</div>
                <Badge className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">{calendar.category}</Badge>
            </div>
        </>
    );

    const renderNewCalendarContent = (calendar: NewCalendar) => (
        <>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {calendar.user.name}
            </div>
            <div className="flex md:flex-col flex-row justify-between gap-2">
                <div className="text-sm text-green-600 font-medium">
                    Just added{" "}
                    {new Date(calendar.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    })}
                </div>
                <Badge className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">{calendar.category}</Badge>
            </div>
        </>
    );

    const renderTrendingCalendarActions = () => <></>;
    const renderNewCalendarActions = () => <></>;

    return (
        <div className="min-h-screen bg-background">
            <Head title="Calendars" />

            <Header auth={auth} />

            {/* Page Title */}
            <div className="py-6 sm:py-8 bg-background">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Curated Event Calendars</h1>
                    <p className="text-muted-foreground mt-2">Discover handpicked events from trusted curators in your community</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-8">
                <div className="flex gap-6">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-80 flex-shrink-0">
                        <CalendarFilters filters={currentFilters} onFilterChange={handleFilterChange} />
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-6">
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
                                            placeholder="Search calendars..."
                                            className="pl-10 rounded-lg"
                                        />
                                    </form>
                                </div>
                                {/* Quick Stats */}
                                <div className="flex justify-center gap-4 sm:gap-6 lg:gap-8 w-full lg:w-auto">
                                    <div className="text-center">
                                        <div className="text-lg sm:text-xl font-bold text-primary">{stats.total_calendars}</div>
                                        <div className="text-xs text-muted-foreground">Calendars</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg sm:text-xl font-bold text-green-600">{stats.total_followers.toLocaleString()}</div>
                                        <div className="text-xs text-muted-foreground">Followers</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg sm:text-xl font-bold text-primary">{stats.active_curators}</div>
                                        <div className="text-xs text-muted-foreground">Curators</div>
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                                    <div className="text-sm text-muted-foreground">{calendars.data.length} calendars found</div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                    {/* Mobile Filter Button */}
                                    <Button variant="outline" size="sm" onClick={() => setShowFilters(true)} className="lg:hidden w-full sm:w-auto">
                                        <FilterIcon className="h-4 w-4 mr-2" />
                                        Filters
                                    </Button>
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
                                        <option value="trending">Trending</option>
                                        <option value="followers">Most Followed</option>
                                        <option value="updated">Recently Updated</option>
                                        <option value="new">Newest</option>
                                    </select>
                                </div>
                            </div>

                            {/* Applied Filters */}
                            {Object.keys(currentFilters).filter((key) => currentFilters[key as keyof typeof currentFilters]).length > 0 && (
                                <div className="flex flex-wrap gap-2">
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
                                    {currentFilters.category && currentFilters.category !== "all" && (
                                        <Badge key="category" variant="secondary" className="flex items-center gap-1">
                                            Category: {currentFilters.category}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleFilterChange({
                                                        category: "all",
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

                            {/* Calendars Grid */}
                            {viewMode === "grid" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                    {calendars.data.map((calendar) => (
                                        <GridCard
                                            key={calendar.id}
                                            id={String(calendar.id)}
                                            href={`/calendars/${calendar.id}`}
                                            image={calendar.image || "/images/calendar-placeholder.jpg"}
                                            imageAlt={calendar.title}
                                            badge={calendar.is_verified ? "Verified" : calendar.category}
                                            title={calendar.title}
                                            actions={renderCalendarActions(calendar)}
                                        >
                                            {renderCalendarContent(calendar)}
                                        </GridCard>
                                    ))}
                                </div>
                            )}

                            {/* Calendars List */}
                            {viewMode === "list" && (
                                <div className="space-y-4">
                                    {calendars.data.map((calendar) => (
                                        <GridCard
                                            key={calendar.id}
                                            id={String(calendar.id)}
                                            href={`/calendars/${calendar.id}`}
                                            image={calendar.image || "/images/calendar-placeholder.jpg"}
                                            imageAlt={calendar.title}
                                            badge={calendar.is_verified ? "Verified" : calendar.category}
                                            title={calendar.title}
                                            actions={renderCalendarActions(calendar)}
                                            className="flex-row"
                                        >
                                            {renderCalendarContent(calendar)}
                                        </GridCard>
                                    ))}
                                </div>
                            )}

                            {/* Empty State */}
                            {calendars.data.length === 0 && (
                                <div className="text-center py-12">
                                    <h3 className="text-lg font-semibold mb-2">No calendars found</h3>
                                    <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
                                    <Button onClick={clearAllFilters} variant="outline">
                                        Clear filters
                                    </Button>
                                </div>
                            )}

                            {/* Pagination */}
                            {calendars.links && calendars.data.length > 0 && (
                                <div className="flex justify-center">
                                    <div className="flex gap-2">
                                        {calendars.links.map((link, index: number) => (
                                            <Button
                                                key={index}
                                                variant={link.active ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => link.url && (window.location.href = link.url)}
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
                            {!searchQuery && !currentFilters.category && (
                                <>
                                    {trendingCalendars.length > 0 && (
                                        <GridSection
                                            title="Trending Calendars"
                                            description="Most popular calendars right now"
                                            viewAllHref="/calendars?sort=trending"
                                            viewAllText="View all trending"
                                            className="bg-muted/50"
                                        >
                                            {trendingCalendars.map((calendar, index: number) => (
                                                <GridCard
                                                    key={calendar.id}
                                                    id={String(calendar.id)}
                                                    href={`/calendars/${calendar.id}`}
                                                    image={calendar.image || "/images/calendar-placeholder.jpg"}
                                                    imageAlt={calendar.title}
                                                    badge={`Trending #${index + 1}`}
                                                    title={calendar.title}
                                                    actions={renderTrendingCalendarActions()}
                                                >
                                                    {renderTrendingCalendarContent(calendar)}
                                                </GridCard>
                                            ))}
                                        </GridSection>
                                    )}

                                    {/* New Calendars */}
                                    {newCalendars.length > 0 && (
                                        <GridSection
                                            title="New Calendars"
                                            description="Just added to our collection"
                                            viewAllHref="/calendars?sort=new"
                                            viewAllText="View all new calendars"
                                        >
                                            {newCalendars.map((calendar) => (
                                                <GridCard
                                                    key={calendar.id}
                                                    id={String(calendar.id)}
                                                    href={`/calendars/${calendar.id}`}
                                                    image={calendar.image || "/images/calendar-placeholder.jpg"}
                                                    imageAlt={calendar.title}
                                                    badge="New Calendar"
                                                    title={calendar.title}
                                                    actions={renderNewCalendarActions()}
                                                >
                                                    {renderNewCalendarContent(calendar)}
                                                </GridCard>
                                            ))}
                                        </GridSection>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Filter Sheet */}
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetContent side="left" className="w-full sm:w-96 p-0">
                    <div className="p-4">
                        <CalendarFilters
                            filters={currentFilters}
                            onFilterChange={(newFilters) => {
                                handleFilterChange(newFilters);
                                setShowFilters(false);
                            }}
                            onClose={() => setShowFilters(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            <Footer />
        </div>
    );
}
