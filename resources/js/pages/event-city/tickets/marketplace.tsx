import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { SEO } from "@/components/common/seo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Auth } from "@/types";
import { Link, router, usePage } from "@inertiajs/react";
import { Search, Filter, Calendar, MapPin, Clock, Star, Grid, List, Home, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface TicketListing {
    id: string;
    event: {
        id: string;
        title: string;
        event_date: string;
        image: string;
    };
    ticket_plan: {
        name: string;
        price: number;
    };
    seller: {
        user: {
            name: string;
            avatar: string;
        };
    };
    price: number;
    quantity: number;
    status: string;
    listed_at: string;
}

interface Props {
    auth: Auth;
    listings: {
        data: TicketListing[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
        price_min?: number;
        price_max?: number;
        date?: string;
        tags?: string[];
    };
}

export default function TicketMarketplace() {
    const { auth, listings, filters } = usePage<Props>().props;
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get("/ticket-marketplace", { search: searchQuery }, { preserveState: true });
    };

    const formatEventDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: "Ticket Marketplace - GoEventCity",
                    description: "Find and purchase tickets for the best local events",
                }}
            />
            <Header auth={auth} />

            {/* Header Section */}
            <div className="bg-indigo-700 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold sm:text-5xl">Ticket Marketplace</h1>
                        <p className="mt-3 text-xl">Find and purchase tickets for the best local events</p>
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="mt-8 max-w-3xl mx-auto">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-4 border border-transparent rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white focus:border-white text-gray-900"
                                    placeholder="Search by event name, venue, or category..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                                        <Filter className="h-5 w-5 text-gray-400" />
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="border-b border-gray-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                            <span className="font-semibold text-indigo-600 mr-2">{listings.meta.total}</span>
                            Events Available
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold text-indigo-600 mr-2">
                                {listings.data.reduce((sum, listing) => sum + listing.quantity, 0)}
                            </span>
                            Tickets For Sale
                        </div>
                    </div>
                </div>
            </div>

            {/* Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <nav className="flex text-sm text-gray-500">
                    <Link href="/" className="hover:text-gray-700 flex items-center">
                        <Home className="h-4 w-4 mr-1" />
                        Home
                    </Link>
                    <ChevronRight className="h-4 w-4 mx-2" />
                    <Link href="/tickets" className="hover:text-gray-700">
                        Tickets
                    </Link>
                    <ChevronRight className="h-4 w-4 mx-2" />
                    <span className="text-gray-900 font-medium">Marketplace</span>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filter Sidebar */}
                    {showFilters && (
                        <div className="lg:w-1/4 w-full">
                            <Card>
                                <CardContent className="p-5 space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
                                    </div>
                                    {/* Price Range Filter */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Price Range</h4>
                                        <div className="flex items-center space-x-2">
                                            <Input type="number" placeholder="Min" className="w-20" defaultValue={filters.price_min} />
                                            <span className="text-gray-500">to</span>
                                            <Input type="number" placeholder="Max" className="w-20" defaultValue={filters.price_max} />
                                        </div>
                                    </div>
                                    {/* Date Filter */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Date</h4>
                                        <Input type="date" defaultValue={filters.date} className="w-full" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="lg:w-3/4 w-full">
                        {/* Sort and View Controls */}
                        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center">
                                <span className="text-sm text-gray-500 mr-2">Sort by:</span>
                                <select className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="recommended">Recommended</option>
                                    <option value="price_low">Price: Low to High</option>
                                    <option value="price_high">Price: High to Low</option>
                                    <option value="date">Date: Soonest First</option>
                                </select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="hidden lg:flex items-center text-sm text-gray-500 mr-4">
                                    <span>
                                        Showing {listings.data.length} of {listings.meta.total} events
                                    </span>
                                </div>
                                <div className="flex border border-gray-300 rounded-md overflow-hidden">
                                    <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")}>
                                        <Grid className="h-5 w-5" />
                                    </Button>
                                    <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")}>
                                        <List className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Ticket Listings */}
                        {viewMode === "grid" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {listings.data.map((listing) => (
                                    <Card
                                        key={listing.id}
                                        className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => router.visit(`/ticket-marketplace/${listing.id}`)}
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            <img
                                                src={
                                                    listing.event.image ||
                                                    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop"
                                                }
                                                alt={listing.event.title}
                                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                            />
                                            {listing.status === "available" && (
                                                <Badge className="absolute top-2 left-2 bg-indigo-600">Available</Badge>
                                            )}
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="font-bold text-lg text-gray-900 mb-2">{listing.event.title}</h3>
                                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                                <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                                                {formatEventDate(listing.event.event_date)}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 mb-3">
                                                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                                                {listing.ticket_plan.name}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="text-gray-500 text-sm">From</span>
                                                    <div className="font-bold text-lg text-gray-900">${listing.price.toFixed(2)}</div>
                                                </div>
                                                <Button size="sm">Get Tickets</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {listings.data.map((listing) => (
                                    <Card
                                        key={listing.id}
                                        className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => router.visit(`/ticket-marketplace/${listing.id}`)}
                                    >
                                        <CardContent className="p-4 sm:p-6">
                                            <div className="flex flex-col sm:flex-row">
                                                <div className="sm:w-1/4 mb-4 sm:mb-0 sm:mr-6">
                                                    <div className="h-32 sm:h-full w-full rounded-md overflow-hidden bg-gray-200 relative">
                                                        <img
                                                            src={
                                                                listing.event.image ||
                                                                "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop"
                                                            }
                                                            alt={listing.event.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-900 mb-1">{listing.event.title}</h3>
                                                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                                                <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                                                                <span>{formatEventDate(listing.event.event_date)}</span>
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                                                                <span>{listing.ticket_plan.name}</span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 sm:mt-0 flex flex-col items-start sm:items-end">
                                                            <div className="text-sm text-gray-500">{listing.quantity} tickets available</div>
                                                        </div>
                                                    </div>
                                                    <div className="border-t border-gray-100 pt-4 mt-2">
                                                        <div className="flex flex-wrap justify-between items-center">
                                                            <div className="text-sm">
                                                                <span className="text-gray-600">Price:</span>
                                                                <span className="font-medium ml-1">${listing.price.toFixed(2)}</span>
                                                            </div>
                                                            <Button size="sm">Get Tickets</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {listings.links && listings.links.length > 3 && (
                            <div className="mt-8 flex justify-center">
                                <div className="flex space-x-2">
                                    {listings.links.map((link: any, index: number) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            onClick={() => link.url && router.visit(link.url)}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
