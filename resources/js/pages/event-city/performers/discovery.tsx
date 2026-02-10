import { Link, router, usePage } from "@inertiajs/react";
import { Calendar, Clock, Filter, Grid3x3, List, MapPin, Music, Search, Star, TrendingUp, Users, X } from "lucide-react";
import { useState } from "react";
import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { SEO } from "@/components/common/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Auth } from "@/types";

interface Performer {
    id: string;
    name: string;
    image: string;
    category: string;
    genres: string[];
    location: string;
    price_range: string;
    rating: number;
    total_reviews: number;
    upcoming_shows: number;
    is_touring: boolean;
}

import { PaginatedData, SharedData } from "@/types";

interface Props extends SharedData {
    performers: PaginatedData<Performer>;
    filters: {
        search?: string;
        genre?: string;
        location?: string;
        price_range?: string;
        availability?: string;
    };
}

export default function PerformerDiscovery() {
    const { auth, performers, filters: initialFilters } = usePage<Props>().props;
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState(initialFilters.search || "");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState(initialFilters);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('performers.discovery'), { search: searchQuery, ...filters }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        router.get(route('performers.discovery'), { search: searchQuery, ...newFilters }, { preserveState: true });
    };

    return (
        <div className="min-h-screen bg-muted/50">
            <SEO
                type="website"
                site="event-city"
                data={{
                    title: "Discover Performers - GoEventCity",
                    url: route('performers.discovery') as string,
                }}
            />
            <Header auth={auth} />

            {/* Hero Section */}
            <div className="relative bg-primary text-white py-12 overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <h1 className="font-display text-4xl font-black tracking-tight mb-4">Discover Performers</h1>
                    <p className="text-xl text-purple-100">Find the perfect talent for your event</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-card border-b border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search performers, genres, or locations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)}>
                                <Filter className="h-5 w-5 mr-2" />
                                Filters
                            </Button>
                            <div className="flex border rounded-md">
                                <Button
                                    type="button"
                                    variant={viewMode === "grid" ? "default" : "ghost"}
                                    className="rounded-r-none"
                                    onClick={() => setViewMode("grid")}
                                >
                                    <Grid3x3 className="h-5 w-5" />
                                </Button>
                                <Button
                                    type="button"
                                    variant={viewMode === "list" ? "default" : "ghost"}
                                    className="rounded-l-none"
                                    onClick={() => setViewMode("list")}
                                >
                                    <List className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </form>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Genre</label>
                                    <select
                                        value={filters.genre || ""}
                                        onChange={(e) => handleFilterChange("genre", e.target.value)}
                                        className="w-full border rounded-md"
                                    >
                                        <option value="">All Genres</option>
                                        <option value="rock">Rock</option>
                                        <option value="jazz">Jazz</option>
                                        <option value="pop">Pop</option>
                                        <option value="country">Country</option>
                                        <option value="electronic">Electronic</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Location</label>
                                    <Input
                                        type="text"
                                        placeholder="City, State"
                                        value={filters.location || ""}
                                        onChange={(e) => handleFilterChange("location", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Price Range</label>
                                    <select
                                        value={filters.price_range || ""}
                                        onChange={(e) => handleFilterChange("price_range", e.target.value)}
                                        className="w-full border rounded-md"
                                    >
                                        <option value="">Any Price</option>
                                        <option value="$">$ (Under $200)</option>
                                        <option value="$$">$$ ($200-$500)</option>
                                        <option value="$$$">$$$ ($500-$1000)</option>
                                        <option value="$$$$">$$$$ ($1000+)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Availability</label>
                                    <select
                                        value={filters.availability || ""}
                                        onChange={(e) => handleFilterChange("availability", e.target.value)}
                                        className="w-full border rounded-md"
                                    >
                                        <option value="">Any Time</option>
                                        <option value="tonight">Tonight</option>
                                        <option value="this-weekend">This Weekend</option>
                                        <option value="next-7-days">Next 7 Days</option>
                                        <option value="next-30-days">Next 30 Days</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-muted-foreground">
                        Found <span className="font-semibold text-foreground">{performers.meta.total}</span> performers
                    </p>
                </div>

                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {performers.data.map((performer: Performer) => (
                            <Card key={performer.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={performer.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop"}
                                        alt={performer.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-semibold text-foreground">{performer.name}</h3>
                                        {performer.is_touring && (
                                            <Badge variant="default" className="bg-green-500">
                                                <TrendingUp className="h-3 w-3 mr-1" />
                                                Touring
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">{performer.category}</p>
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {performer.genres.slice(0, 3).map((genre: string) => (
                                            <Badge key={genre} variant="outline" className="text-xs">
                                                {genre}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                        <div className="flex items-center">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            {performer.location}
                                        </div>
                                        <div className="flex items-center">
                                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                            {performer.rating.toFixed(1)} ({performer.total_reviews})
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-semibold text-foreground">{performer.price_range}</span>
                                        <Button onClick={() => router.visit(`/performers/${performer.id}`)}>View Profile</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {performers.data.map((performer: Performer) => (
                            <Card key={performer.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-6">
                                        <div className="h-24 w-24 rounded-lg overflow-hidden shrink-0">
                                            <img
                                                src={
                                                    performer.image ||
                                                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop"
                                                }
                                                alt={performer.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="text-xl font-semibold text-foreground">{performer.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{performer.category}</p>
                                                </div>
                                                {performer.is_touring && (
                                                    <Badge variant="default" className="bg-green-500">
                                                        <TrendingUp className="h-3 w-3 mr-1" />
                                                        Touring
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {performer.genres.map((genre: string) => (
                                                    <Badge key={genre} variant="outline" className="text-xs">
                                                        {genre}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                                                <div className="flex items-center">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    {performer.location}
                                                </div>
                                                <div className="flex items-center">
                                                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                                    {performer.rating.toFixed(1)} ({performer.total_reviews} reviews)
                                                </div>
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    {performer.upcoming_shows} upcoming shows
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-semibold text-foreground">{performer.price_range}</span>
                                                <Button onClick={() => router.visit(route('performers.show', performer.id) as any)}>View Profile</Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
