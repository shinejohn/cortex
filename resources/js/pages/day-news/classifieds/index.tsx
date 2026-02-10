import { SEO } from "@/components/common/seo";
import { ClassifiedCard } from "@/components/day-news/classified-card";
import { ClassifiedFilters } from "@/components/day-news/classified-filters";
import DayNewsHeader from "@/components/day-news/day-news-header";
import LocationPrompt from "@/components/day-news/location-prompt";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import type { ClassifiedsIndexPageProps } from "@/types/classified";
import { Link } from "@inertiajs/react";
import { List, Package, Plus, Search, ShoppingBag } from "lucide-react";
import { route } from "ziggy-js";

interface Props extends ClassifiedsIndexPageProps {
    auth?: Auth;
}

export default function ClassifiedsIndex({
    auth,
    featuredClassifieds,
    classifieds,
    categories,
    conditions,
    filters,
    hasRegion,
}: Props) {
    return (
        <LocationProvider>
            <div className="min-h-screen bg-gray-50">
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Local Classifieds",
                        description:
                            "Browse local classifieds in your area. Find great deals on cars, real estate, electronics, furniture, and more from your community.",
                        url: "/classifieds",
                    }}
                />
                <DayNewsHeader auth={auth} />
                <LocationPrompt />

                <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Page header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="flex items-center gap-3 font-display text-3xl font-black tracking-tight text-gray-900">
                                <ShoppingBag className="size-8 text-indigo-600" />
                                Community Classifieds
                            </h1>
                            <p className="mt-1 text-gray-600">
                                Buy, sell, and connect with your neighbors
                            </p>
                        </div>
                        {auth?.user && (
                            <div className="flex gap-2">
                                <Button variant="outline" asChild>
                                    <Link href={route("daynews.classifieds.my")}>
                                        <List className="mr-2 size-4" />
                                        My Listings
                                    </Link>
                                </Button>
                                <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                                    <Link href={route("daynews.classifieds.create")}>
                                        <Plus className="mr-2 size-4" />
                                        Post Listing
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="mb-8">
                        <ClassifiedFilters
                            categories={categories}
                            conditions={conditions}
                            filters={filters}
                            hasRegion={hasRegion}
                        />
                    </div>

                    {/* Featured classifieds */}
                    {featuredClassifieds.length > 0 && !filters.search && !filters.category && (
                        <section className="mb-12">
                            <h2 className="mb-4 text-xl font-bold text-gray-900">
                                Featured Listings
                            </h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {featuredClassifieds.slice(0, 6).map((classified) => (
                                    <ClassifiedCard key={classified.id} classified={classified} variant="featured" />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* All classifieds */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-gray-900">
                            {filters.search || filters.category || filters.condition
                                ? "Search Results"
                                : "All Listings"}
                        </h2>

                        {classifieds.data.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {classifieds.data.map((classified) => (
                                        <ClassifiedCard key={classified.id} classified={classified} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {classifieds.last_page > 1 && (
                                    <div className="mt-8 flex items-center justify-center gap-2">
                                        {classifieds.prev_page_url && (
                                            <Button variant="outline" asChild>
                                                <Link href={classifieds.prev_page_url}>Previous</Link>
                                            </Button>
                                        )}
                                        <span className="px-4 text-sm text-gray-500">
                                            Page {classifieds.current_page} of {classifieds.last_page}
                                        </span>
                                        {classifieds.next_page_url && (
                                            <Button variant="outline" asChild>
                                                <Link href={classifieds.next_page_url}>Next</Link>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
                                    <Search className="size-8 text-gray-400" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-gray-700">No Listings Found</h3>
                                <p className="mx-auto mb-4 max-w-md text-gray-500">
                                    {filters.search || filters.category || filters.condition
                                        ? "Try adjusting your filters or search terms."
                                        : hasRegion
                                          ? "There are no listings available for your region yet. Be the first to post one!"
                                          : "Select your location to see listings relevant to your area."}
                                </p>
                                {auth?.user && (
                                    <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700" asChild>
                                        <Link href={route("daynews.classifieds.create")}>
                                            <Plus className="mr-2 size-4" />
                                            Post a Listing
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </LocationProvider>
    );
}
