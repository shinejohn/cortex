import { Head, Link, router } from "@inertiajs/react";
import {
    FilterIcon,
    MicIcon,
    PlusIcon,
    SearchIcon,
    StarIcon,
} from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";

interface Performer {
    id: string;
    name: string;
    bio: string;
    genres: string[];
    home_city: string;
    profile_image: string | null;
    average_rating: number | null;
    total_reviews: number;
    total_ratings: number;
    years_active: number;
    shows_played: number;
    status: string;
    is_verified: boolean;
    available_for_booking: boolean;
    base_price: number | null;
    trending_score: number;
    workspace?: { id: string; name: string };
    createdBy?: { id: string; name: string };
    upcomingShows?: any[];
}

interface PaginatedPerformers {
    data: Performer[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface Filters {
    status?: string;
    verified?: string;
    available?: string;
    genres?: string[];
    search?: string;
    rating_min?: string;
    family_friendly?: string;
}

interface Sort {
    sort: string;
    direction: string;
}

interface Props {
    performers: PaginatedPerformers;
    filters: Filters;
    sort: Sort;
    advertisements?: any;
}

export default function PerformersIndex({ performers, filters, sort }: Props) {
    const [search, setSearch] = useState(filters.search || "");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route("performers.index") as string,
            { ...filters, search },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            route("performers.index") as string,
            { ...filters, [key]: value || undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <AppLayout>
            <Head title="Manage Performers" />
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="font-display text-2xl font-black tracking-tight">Manage Performers</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {performers.total} performer{performers.total !== 1 ? "s" : ""} in your workspace
                            </p>
                        </div>
                        <Button asChild>
                            <Link href={route("performers.create") as string}>
                                <PlusIcon className="mr-2 size-4" />
                                Add Performer
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
                                            placeholder="Search performers..."
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
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.available || ""}
                                    onValueChange={(v) => handleFilterChange("available", v)}
                                >
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="Availability" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All</SelectItem>
                                        <SelectItem value="1">Available</SelectItem>
                                        <SelectItem value="0">Unavailable</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {performers.data.length === 0 ? (
                            <div className="col-span-full py-16 text-center">
                                <MicIcon className="mx-auto size-12 text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-medium">No performers found</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Add your first performer to get started.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href={route("performers.create") as string}>
                                        <PlusIcon className="mr-2 size-4" />
                                        Add Performer
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            performers.data.map((performer) => (
                                <Link
                                    key={performer.id}
                                    href={route("performers.show", performer.id) as string}
                                    className="block"
                                >
                                    <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm hover:shadow-md transition-shadow h-full">
                                        <div className="relative aspect-video bg-muted">
                                            {performer.profile_image ? (
                                                <img
                                                    src={performer.profile_image}
                                                    alt={performer.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <MicIcon className="size-12 text-muted-foreground/30" />
                                                </div>
                                            )}
                                            {performer.is_verified && (
                                                <Badge className="absolute top-2 right-2 bg-green-500">Verified</Badge>
                                            )}
                                            {performer.available_for_booking && (
                                                <Badge variant="secondary" className="absolute top-2 left-2">
                                                    Available
                                                </Badge>
                                            )}
                                        </div>

                                        <CardContent className="p-4">
                                            <h3 className="font-display text-lg font-bold tracking-tight line-clamp-1">
                                                {performer.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                {performer.home_city}
                                            </p>

                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {performer.genres?.slice(0, 3).map((genre) => (
                                                    <Badge key={genre} variant="outline" className="text-xs">
                                                        {genre}
                                                    </Badge>
                                                ))}
                                            </div>

                                            <div className="mt-3 flex items-center justify-between text-sm">
                                                {performer.average_rating ? (
                                                    <div className="flex items-center gap-1">
                                                        <StarIcon className="size-3.5 fill-yellow-400 text-yellow-400" />
                                                        <span className="font-medium">
                                                            {Number(performer.average_rating).toFixed(1)}
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            ({performer.total_reviews})
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">No ratings</span>
                                                )}
                                                {performer.base_price && (
                                                    <span className="font-medium">
                                                        From ${Number(performer.base_price).toFixed(0)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                                                <span>{performer.years_active} yrs active</span>
                                                <span>{performer.shows_played} shows</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {performers.last_page > 1 && (
                        <div className="mt-8 flex justify-center gap-1">
                            {performers.links.map((link, i) => (
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
