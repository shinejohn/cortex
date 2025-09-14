import { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import Header from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import CTASection from "@/components/common/cta-section";
import { SearchBar } from "@/components/performers/search-bar";
import { CategoryCards } from "@/components/performers/category-cards";
import { PerformerCard } from "@/components/performers/performer-card";
import { JoinCta } from "@/components/performers/join-cta";
import type { PerformersPageProps } from "@/types/performers";

export default function Performers() {
    const { auth, featuredPerformers = [] } =
        usePage<PerformersPageProps>().props;
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredPerformers, setFilteredPerformers] =
        useState(featuredPerformers);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setFilteredPerformers(featuredPerformers);
            return;
        }

        const filtered = featuredPerformers.filter(
            (performer) =>
                performer.name.toLowerCase().includes(query.toLowerCase()) ||
                performer.homeCity
                    .toLowerCase()
                    .includes(query.toLowerCase()) ||
                performer.genres.some((genre) =>
                    genre.toLowerCase().includes(query.toLowerCase())
                )
        );
        setFilteredPerformers(filtered);
    };

    return (
        <>
            <Head title="Performers" />

            <Header auth={auth} />

            {/* Page Title and Search */}
            <div className="py-8 bg-background">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-foreground mb-4">
                            Find Amazing Performers
                        </h1>
                        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Discover talented musicians, bands, and entertainers
                            for your next event
                        </p>
                    </div>

                    <SearchBar
                        onSearch={handleSearch}
                        placeholder="Search performers, genres, or locations..."
                    />
                </div>
            </div>

            {/* Browse by Category */}
            <CategoryCards className="bg-muted/30" />

            {/* Join as Performer CTA */}
            <JoinCta />

            {/* Featured Performers Section */}
            <div className="py-12">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">
                                {searchQuery
                                    ? "Search Results"
                                    : "Featured Performers"}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {searchQuery
                                    ? `${filteredPerformers.length} performer${
                                          filteredPerformers.length !== 1
                                              ? "s"
                                              : ""
                                      } found`
                                    : "Top-rated performers in your area"}
                            </p>
                        </div>
                    </div>

                    {filteredPerformers.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground text-lg">
                                No performers found matching "{searchQuery}"
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Try adjusting your search terms or browse by
                                category above
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPerformers.map((performer) => (
                                <PerformerCard
                                    key={performer.id}
                                    performer={performer}
                                />
                            ))}
                        </div>
                    )}

                    {!searchQuery && (
                        <div className="mt-8 text-center">
                            <button className="text-primary hover:text-primary/80 text-sm font-medium">
                                View all performers
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <CTASection />

            <Footer />
        </>
    );
}
