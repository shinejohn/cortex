import { Head, usePage, Link, router } from "@inertiajs/react";
import React from "react";
import CategoryFilter from "@/components/common/category-filter";
import CTASection from "@/components/common/cta-section";
import DateSelector from "@/components/common/date-selector";
import { Footer } from "@/components/common/footer";
import Header from "@/components/common/header";
import { SEO } from "@/components/common/seo";
import LocationPrompt from "@/components/event-city/location-prompt";
import EventsGrid from "@/components/events/events-grid";
import UpcomingEvents from "@/components/events/upcoming-events";
import PerformersGrid from "@/components/performers/performers-grid";
import VenuesGrid from "@/components/venues/venues-grid";
import { LocationProvider } from "@/contexts/location-context";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, MusicIcon } from "lucide-react";
import { type SharedData } from "@/types";

interface WelcomeProps {
    featuredEvents: any[];
    featuredVenues: any[];
    featuredPerformers: any[];
    upcomingEvents: any[];
    advertisements: {
        banner: any[];
        featured: any[];
        sidebar: any[];
    };
}

export default function Welcome({ featuredEvents, featuredVenues, featuredPerformers, upcomingEvents }: WelcomeProps) {
    const { auth } = usePage<SharedData>().props;

    const handleCategoryChange = (category: string) => {
        router.visit(route("events", { category: category === "All" ? undefined : category }) as any);
    };

    // We need a ref to track mount
    const isMounted = React.useRef(false);

    const safeHandleDateChange = (date: Date) => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        const dateString = date.toISOString().split("T")[0];
        router.visit(route("events", { date: dateString }) as any);
    };

    return (
        <LocationProvider>
            <SEO
                type="website"
                site="event-city"
                data={{
                    title: "Home",
                    description: "Discover local events, venues, and performers. Find concerts, shows, and entertainment near you.",
                    url: "/",
                }}
            />

            <Header auth={auth} />

            {/* Hero Section */}
            <div className="relative bg-background overflow-hidden border-b">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl mb-6">
                            Experience Your City Like Never Before
                        </h1>
                        <p className="mt-4 text-xl text-muted-foreground mb-10">
                            The ultimate guide to live music, local events, and hidden gems.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Button size="lg" className="rounded-full px-8" asChild>
                                <Link href={route("events") as any}>
                                    <CalendarIcon className="mr-2 h-5 w-5" />
                                    Find Events
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
                                <Link href={route("venues") as any}>
                                    <MapPinIcon className="mr-2 h-5 w-5" />
                                    Explore Venues
                                </Link>
                            </Button>
                            <Button size="lg" variant="ghost" className="rounded-full px-8" asChild>
                                <Link href={route("performers") as any}>
                                    <MusicIcon className="mr-2 h-5 w-5" />
                                    Discover Artists
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <LocationPrompt />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

                {/* Discovery Tools */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    <CategoryFilter selectedCategory="All" onCategoryChange={handleCategoryChange} />
                    <DateSelector onDateChange={safeHandleDateChange} currentView="daily" setCurrentView={() => { }} />
                </div>

                {/* Featured Events */}
                {featuredEvents && featuredEvents.length > 0 ? (
                    <EventsGrid events={featuredEvents} title="Featured Events" />
                ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-lg">
                        <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground">No featured events right now.</h3>
                        <Button variant="link" asChild><Link href={route("events") as any}>Browse all events</Link></Button>
                    </div>
                )}

                {/* Venues */}
                {featuredVenues && featuredVenues.length > 0 ? (
                    <VenuesGrid venues={featuredVenues} title="Top Venues" />
                ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-lg">
                        <MapPinIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground">Discover local venues.</h3>
                        <Button variant="link" asChild><Link href={route("venues") as any}>Browse venues</Link></Button>
                    </div>
                )}

                {/* Performers */}
                {featuredPerformers && featuredPerformers.length > 0 ? (
                    <PerformersGrid performers={featuredPerformers} title="Trending Artists" />
                ) : null}

                {/* Upcoming List */}
                {upcomingEvents && upcomingEvents.length > 0 && <UpcomingEvents events={upcomingEvents} />}

            </div>

            <CTASection />

            <Footer />
        </LocationProvider>
    );
}
