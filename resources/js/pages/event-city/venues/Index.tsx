import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    BuildingIcon,
    FilterIcon,
    MapPinIcon,
    PlusIcon,
    SearchIcon,
    StarIcon,
    UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";

interface Venue {
    id: string;
    name: string;
    description: string;
    venue_type: string;
    capacity: number;
    average_rating: number | null;
    total_reviews: number;
    total_ratings: number;
    status: string;
    verified: boolean;
    address: string;
    price_per_hour: number | null;
    images: string[];
    workspace?: { id: string; name: string };
    createdBy?: { id: string; name: string };
}

interface PaginatedVenues {
    data: Venue[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface Filters {
    status?: string;
    venue_type?: string;
    verified?: string;
    search?: string;
    capacity_min?: string;
    capacity_max?: string;
    rating_min?: string;
}

interface Sort {
    sort: string;
    direction: string;
}

interface Ad {
    id: string;
    placement: string;
    advertable: {
        id: string;
        title: string | null;
        excerpt: string | null;
        featured_image: string | null;
        slug: string | null;
    };
    expires_at: string;
}

interface Props {
    venues: PaginatedVenues;
    filters: Filters;
    sort: Sort;
    advertisements: {
        sidebar: Ad[];
    };
}

export default function VenuesIndex({ venues, filters, sort, advertisements }: Props) {
    const [search, setSearch] = useState(filters.search || "");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route("venues.index") as string,
            { ...filters, search },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            route("venues.index") as string,
            { ...filters, [key]: value || undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <AppLayout>
            <Head title="Manage Venues" />
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="font-display text-2xl font-black tracking-tight">Manage Venues</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {venues.total} venue{venues.total !== 1 ? "s" : ""} in your workspace
                            </p>
                        </div>
                        <Button asChild>
                            <Link href={route("venues.create") as string}>
                                <PlusIcon className="mr-2 size-4" />
                                Add Venue
                            </Link>
                        </Button>
                    </div>

                    {/* Filters */}
                    <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                <form onSubmit={handleSearch} className="flex-1">
                                    <div className="relative">
                                        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search venues..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </form>
                                <Select
                                    value={filters.status || ""}
                                    onValueChange={(v) => handleFilterChange("status", v)}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.venue_type || ""}
                                    onValueChange={(v) => handleFilterChange("venue_type", v)}
                                >
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="Venue Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Types</SelectItem>
                                        <SelectItem value="concert_hall">Concert Hall</SelectItem>
                                        <SelectItem value="bar">Bar</SelectItem>
                                        <SelectItem value="club">Club</SelectItem>
                                        <SelectItem value="theater">Theater</SelectItem>
                                        <SelectItem value="outdoor">Outdoor</SelectItem>
                                        <SelectItem value="restaurant">Restaurant</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {venues.data.length === 0 ? (
                            <div className="col-span-full py-16 text-center">
                                <BuildingIcon className="mx-auto size-12 text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-medium text-foreground">No venues found</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Add your first venue to get started.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href={route("venues.create") as string}>
                                        <PlusIcon className="mr-2 size-4" />
                                        Add Venue
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            venues.data.map((venue) => (
                                <Link
                                    key={venue.id}
                                    href={route("venues.show", venue.id) as string}
                                    className="block"
                                >
                                    <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm hover:shadow-md transition-shadow h-full">
                                        {/* Image */}
                                        <div className="relative aspect-video bg-muted">
                                            {venue.images?.[0] ? (
                                                <img
                                                    src={venue.images[0]}
                                                    alt={venue.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <BuildingIcon className="size-12 text-muted-foreground/30" />
                                                </div>
                                            )}
                                            {venue.verified && (
                                                <Badge className="absolute top-2 right-2 bg-green-500">Verified</Badge>
                                            )}
                                            <Badge variant="secondary" className="absolute top-2 left-2 capitalize">
                                                {venue.status}
                                            </Badge>
                                        </div>

                                        <CardContent className="p-4">
                                            <h3 className="font-display text-lg font-bold tracking-tight line-clamp-1">
                                                {venue.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground capitalize mt-1">
                                                {venue.venue_type?.replace(/_/g, " ")}
                                            </p>

                                            <div className="mt-3 flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <UsersIcon className="size-3.5" />
                                                    <span>{venue.capacity}</span>
                                                </div>
                                                {venue.average_rating && (
                                                    <div className="flex items-center gap-1">
                                                        <StarIcon className="size-3.5 fill-yellow-400 text-yellow-400" />
                                                        <span className="font-medium">
                                                            {Number(venue.average_rating).toFixed(1)}
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            ({venue.total_reviews})
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                                                <MapPinIcon className="size-3.5 shrink-0" />
                                                <span className="line-clamp-1">{venue.address}</span>
                                            </div>

                                            {venue.price_per_hour && (
                                                <p className="mt-2 text-sm font-medium">
                                                    ${Number(venue.price_per_hour).toFixed(0)}/hr
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {venues.last_page > 1 && (
                        <div className="mt-8 flex justify-center gap-1">
                            {venues.links.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
