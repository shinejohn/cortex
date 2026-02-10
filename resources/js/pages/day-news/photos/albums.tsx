import { Head, router, usePage } from "@inertiajs/react";
import { Camera, Eye, FolderOpen, Image as ImageIcon, Plus } from "lucide-react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import { cn } from "@/lib/utils";
import type { Auth } from "@/types";

interface PhotoPreview {
    id: string;
    title: string;
    image_url: string;
    thumbnail_url: string | null;
}

interface Album {
    id: string;
    title: string;
    description: string | null;
    cover_image: string | null;
    visibility: string;
    photos_count: number;
    views_count: number;
    created_at: string;
    user: {
        id: string;
        name: string;
        avatar: string | null;
    };
    photos: PhotoPreview[];
}

interface AlbumsPageProps {
    auth?: Auth;
    albums: {
        data: Album[];
        links: any[];
        meta: any;
    };
    currentRegion?: {
        id: string;
        name: string;
    };
}

export default function PhotoAlbums() {
    const { auth, albums, currentRegion } = usePage<AlbumsPageProps>().props;

    return (
        <LocationProvider>
            <div className="min-h-screen bg-[#F8F9FB]">
                <Head title="Photo Albums - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Photo Albums - Day News",
                        description: "Browse community photo albums and galleries",
                        url: "/photos/albums",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-primary">
                                <FolderOpen className="size-4 fill-current" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                    Community Albums
                                </span>
                            </div>
                            <h1 className="font-display text-4xl font-black tracking-tight md:text-5xl">
                                Photo Albums
                            </h1>
                            <p className="mt-2 text-lg text-muted-foreground">
                                {currentRegion
                                    ? `Albums from ${currentRegion.name}`
                                    : "Browse community photo collections"}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.visit("/photos")}
                                className="gap-2 rounded-xl font-bold"
                            >
                                <Camera className="size-4" />
                                All Photos
                            </Button>
                            {auth && (
                                <Button
                                    onClick={() => router.visit("/photos/albums/create")}
                                    className="gap-2 rounded-xl font-bold shadow-lg shadow-primary/20"
                                >
                                    <Plus className="size-4" />
                                    Create Album
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Albums Grid */}
                    {albums.data.length === 0 ? (
                        <div className="rounded-3xl border-2 border-dashed p-20 text-center">
                            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
                                <FolderOpen className="size-10 text-muted-foreground" />
                            </div>
                            <h3 className="mt-6 font-display text-xl font-black">
                                No albums yet
                            </h3>
                            <p className="mt-2 text-muted-foreground">
                                Be the first to create a photo album for the community.
                            </p>
                            {auth && (
                                <Button
                                    className="mt-8 gap-2 font-bold"
                                    onClick={() => router.visit("/photos/albums/create")}
                                >
                                    <Plus className="size-4" />
                                    Create First Album
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {albums.data.map((album) => (
                                <div
                                    key={album.id}
                                    className="group cursor-pointer overflow-hidden rounded-xl border-none bg-card shadow-sm transition-all duration-300 hover:shadow-md"
                                    onClick={() => router.visit(`/photos/albums/${album.id}`)}
                                >
                                    {/* Cover Image / Preview Grid */}
                                    <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                                        {album.cover_image ? (
                                            <img
                                                src={album.cover_image}
                                                alt={album.title}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : album.photos.length > 0 ? (
                                            <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5">
                                                {album.photos.slice(0, 4).map((photo, index) => (
                                                    <div
                                                        key={photo.id}
                                                        className={cn(
                                                            "overflow-hidden bg-zinc-200",
                                                            album.photos.length === 1 && "col-span-2 row-span-2",
                                                            album.photos.length === 2 && "row-span-2",
                                                            album.photos.length === 3 && index === 0 && "row-span-2"
                                                        )}
                                                    >
                                                        <img
                                                            src={photo.thumbnail_url || photo.image_url}
                                                            alt={photo.title}
                                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <ImageIcon className="size-12 text-zinc-300" />
                                            </div>
                                        )}

                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                                        {/* Photo count badge */}
                                        <div className="absolute right-3 top-3">
                                            <Badge className="bg-black/60 text-white backdrop-blur-sm border-none text-xs font-bold">
                                                <ImageIcon className="mr-1 size-3" />
                                                {album.photos_count}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="mb-1 line-clamp-1 font-display text-lg font-black tracking-tight group-hover:text-primary transition-colors">
                                            {album.title}
                                        </h3>
                                        {album.description && (
                                            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                                                {album.description}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span className="font-medium">{album.user.name}</span>
                                            <div className="flex items-center gap-1">
                                                <Eye className="size-3" />
                                                {album.views_count}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {albums.meta?.last_page > 1 && (
                        <div className="mt-12 flex justify-center gap-2">
                            {albums.meta.links.map((link: any, index: number) => (
                                <Button
                                    key={index}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => link.url && router.visit(link.url)}
                                    disabled={!link.url}
                                    className={cn(
                                        "rounded-xl font-bold",
                                        link.active && "shadow-lg shadow-primary/20"
                                    )}
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
