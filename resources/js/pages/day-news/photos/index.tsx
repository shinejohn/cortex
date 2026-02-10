import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Camera, Eye, Filter, Grid, Heart, List, MessageSquare, Plus, Search, Upload } from "lucide-react";
import { useState } from "react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

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
            <div className="min-h-screen bg-[#F8F9FB]">
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

                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-primary">
                                <Camera className="size-4 fill-current" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Community Gallery</span>
                            </div>
                            <h1 className="font-display text-4xl font-black tracking-tight md:text-5xl">Photo Gallery</h1>
                            <p className="mt-2 text-lg text-muted-foreground">Community photos and memories</p>
                        </div>
                        {auth && (
                            <Button onClick={() => router.visit("/photos/create")} className="gap-2 rounded-xl font-bold shadow-lg shadow-primary/20">
                                <Upload className="size-4" />
                                Upload Photo
                            </Button>
                        )}
                    </div>

                    {/* Search and Filters */}
                    <div className="mb-8 overflow-hidden rounded-2xl border-none bg-white p-6 shadow-sm">
                        <form onSubmit={handleSearch} className="mb-4 flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={searchForm.data.search}
                                    onChange={(e) => searchForm.setData("search", e.target.value)}
                                    placeholder="Search photos..."
                                    className="h-12 border-none bg-zinc-50 pl-12 ring-1 ring-zinc-200 focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>
                            <Button type="submit" disabled={searchForm.processing} className="h-12 px-6 font-bold">
                                {searchForm.processing ? "Searching..." : "Search"}
                            </Button>
                        </form>

                        <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.value}
                                        className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                                            searchForm.data.category === cat.value
                                                ? "bg-primary text-white shadow-md shadow-primary/20"
                                                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                        }`}
                                        onClick={() => {
                                            searchForm.setData("category", cat.value);
                                            searchForm.get("/photos", {
                                                preserveState: true,
                                                preserveScroll: true,
                                            });
                                        }}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">
                                <button
                                    className={`rounded-md p-2 transition-all ${viewMode === "grid" ? "bg-primary text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
                                    onClick={() => setViewMode("grid")}
                                >
                                    <Grid className="size-4" />
                                </button>
                                <button
                                    className={`rounded-md p-2 transition-all ${viewMode === "list" ? "bg-primary text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
                                    onClick={() => setViewMode("list")}
                                >
                                    <List className="size-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Photos Grid/List */}
                    {photos.data.length === 0 ? (
                        <div className="rounded-3xl border-2 border-dashed p-20 text-center">
                            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
                                <Camera className="size-10 text-muted-foreground" />
                            </div>
                            <h3 className="mt-6 font-display text-xl font-black">No photos found</h3>
                            <p className="mt-2 text-muted-foreground">Try adjusting your filters or upload a new photo.</p>
                            {auth && (
                                <Button className="mt-8 gap-2 font-bold" onClick={() => router.visit("/photos/create")}>
                                    <Plus className="size-4" />
                                    Upload First Photo
                                </Button>
                            )}
                        </div>
                    ) : viewMode === "grid" ? (
                        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                            {photos.data.map((photo) => (
                                <div
                                    key={photo.id}
                                    className="group cursor-pointer overflow-hidden rounded-2xl border-none bg-white shadow-sm transition-all duration-300 hover:shadow-md"
                                    onClick={() => router.visit(`/photos/${photo.id}`)}
                                >
                                    <div className="relative aspect-square overflow-hidden">
                                        <img
                                            src={photo.thumbnail_url || photo.image_url}
                                            alt={photo.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 text-white opacity-0 transition-opacity group-hover:opacity-100">
                                            <div className="flex items-center gap-1 text-xs">
                                                <Heart className="size-3.5" />
                                                {photo.likes_count}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs">
                                                <MessageSquare className="size-3.5" />
                                                {photo.comments_count}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="mb-1 line-clamp-1 font-bold">{photo.title}</h3>
                                        <p className="mb-2 line-clamp-1 text-xs text-muted-foreground">{photo.description}</p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span className="font-medium">{photo.user.name}</span>
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
                                    className="group flex cursor-pointer gap-5 overflow-hidden rounded-2xl border-none bg-white p-4 shadow-sm transition-all hover:shadow-md"
                                    onClick={() => router.visit(`/photos/${photo.id}`)}
                                >
                                    <img
                                        src={photo.thumbnail_url || photo.image_url}
                                        alt={photo.title}
                                        className="size-32 flex-shrink-0 rounded-xl object-cover transition-transform group-hover:scale-[1.02]"
                                    />
                                    <div className="flex-1">
                                        <h3 className="mb-2 font-display text-lg font-black group-hover:text-primary transition-colors">{photo.title}</h3>
                                        {photo.description && <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{photo.description}</p>}
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="font-medium">{photo.user.name}</span>
                                            {photo.category && (
                                                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-primary">
                                                    {photo.category}
                                                </span>
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
                        <div className="mt-12 flex justify-center gap-2">
                            {photos.links.map((link: any, index: number) => (
                                <Button
                                    key={index}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => link.url && router.visit(link.url)}
                                    disabled={!link.url}
                                    className={link.active ? "font-bold shadow-lg shadow-primary/20" : ""}
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
