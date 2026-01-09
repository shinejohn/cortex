import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { Camera, Grid, List, Plus, Search } from "lucide-react";
import { useState } from "react";

interface Photo {
    id: string;
    title: string;
    description: string | null;
    image_url: string;
    thumbnail_url: string | null;
    category: string | null;
    views_count: number;
    likes_count: number;
    comments_count: number;
    created_at: string;
    user: {
        id: string;
        name: string;
        avatar: string | null;
    };
    album: {
        id: string;
        title: string;
    } | null;
}

interface PhotosPageProps {
    auth?: Auth;
    photos: {
        data: Photo[];
        links: any;
        meta: any;
    };
    filters: {
        category: string;
        search: string;
    };
}

export default function PhotosIndex() {
    const { auth, photos, filters } = usePage<PhotosPageProps>().props;
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const searchForm = useForm({
        search: filters.search || "",
        category: filters.category || "all",
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchForm.get("/photos", {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const categories = [
        { value: "all", label: "All" },
        { value: "Nature", label: "Nature" },
        { value: "Events", label: "Events" },
        { value: "Recreation", label: "Recreation" },
        { value: "Community", label: "Community" },
        { value: "Sports", label: "Sports" },
        { value: "Environment", label: "Environment" },
    ];

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title="Photo Gallery - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Photo Gallery - Day News",
                        description: "Community photos and galleries",
                        url: "/photos",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold">Photo Gallery</h1>
                            <p className="mt-2 text-muted-foreground">Community photos and memories</p>
                        </div>
                        {auth && (
                            <Button onClick={() => router.visit("/photos/create")}>
                                <Plus className="mr-2 size-4" />
                                Upload Photo
                            </Button>
                        )}
                    </div>

                    {/* Search and Filters */}
                    <div className="mb-6">
                        <form onSubmit={handleSearch} className="mb-4 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={searchForm.data.search}
                                    onChange={(e) => searchForm.setData("search", e.target.value)}
                                    placeholder="Search photos..."
                                    className="pl-10"
                                />
                            </div>
                            <Button type="submit" disabled={searchForm.processing}>
                                {searchForm.processing ? "Searching..." : "Search"}
                            </Button>
                        </form>

                        <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <Button
                                        key={cat.value}
                                        variant={searchForm.data.category === cat.value ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => {
                                            searchForm.setData("category", cat.value);
                                            searchForm.get("/photos", {
                                                preserveState: true,
                                                preserveScroll: true,
                                            });
                                        }}
                                    >
                                        {cat.label}
                                    </Button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
                                    <Grid className="size-4" />
                                </Button>
                                <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
                                    <List className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Photos Grid/List */}
                    {photos.data.length === 0 ? (
                        <div className="py-12 text-center">
                            <Camera className="mx-auto mb-4 size-12 text-muted-foreground" />
                            <p className="text-muted-foreground">No photos found.</p>
                            {auth && (
                                <Button className="mt-4" onClick={() => router.visit("/photos/create")}>
                                    Upload First Photo
                                </Button>
                            )}
                        </div>
                    ) : viewMode === "grid" ? (
                        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {photos.data.map((photo) => (
                                <div
                                    key={photo.id}
                                    className="group cursor-pointer overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
                                    onClick={() => router.visit(`/photos/${photo.id}`)}
                                >
                                    <div className="relative aspect-square overflow-hidden">
                                        <img
                                            src={photo.thumbnail_url || photo.image_url}
                                            alt={photo.title}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                                    </div>
                                    <div className="p-3">
                                        <h3 className="mb-1 line-clamp-1 font-semibold">{photo.title}</h3>
                                        <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">{photo.description}</p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{photo.user.name}</span>
                                            <span>{photo.views_count} views</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {photos.data.map((photo) => (
                                <div
                                    key={photo.id}
                                    className="flex cursor-pointer gap-4 rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
                                    onClick={() => router.visit(`/photos/${photo.id}`)}
                                >
                                    <img
                                        src={photo.thumbnail_url || photo.image_url}
                                        alt={photo.title}
                                        className="h-32 w-32 flex-shrink-0 rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                        <h3 className="mb-2 text-lg font-semibold">{photo.title}</h3>
                                        {photo.description && <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{photo.description}</p>}
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>{photo.user.name}</span>
                                            {photo.category && (
                                                <Badge variant="outline" className="text-xs">
                                                    {photo.category}
                                                </Badge>
                                            )}
                                            <span>{photo.views_count} views</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {photos.links && photos.links.length > 3 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {photos.links.map((link: any, index: number) => (
                                <Button
                                    key={index}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => link.url && router.visit(link.url)}
                                    disabled={!link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </LocationProvider>
    );
}
