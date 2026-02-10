import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    Calendar,
    Camera,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    Heart,
    Image as ImageIcon,
    MessageSquare,
    X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import { cn } from "@/lib/utils";
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
    photos: Photo[];
}

interface AlbumShowPageProps {
    auth?: Auth;
    album: Album;
}

export default function AlbumShow() {
    const { auth, album } = usePage<AlbumShowPageProps>().props;
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const goNext = useCallback(() => {
        setLightboxIndex((prev) =>
            prev < album.photos.length - 1 ? prev + 1 : 0
        );
    }, [album.photos.length]);

    const goPrev = useCallback(() => {
        setLightboxIndex((prev) =>
            prev > 0 ? prev - 1 : album.photos.length - 1
        );
    }, [album.photos.length]);

    useEffect(() => {
        if (!lightboxOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") goNext();
            if (e.key === "ArrowLeft") goPrev();
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [lightboxOpen, goNext, goPrev]);

    const currentPhoto = album.photos[lightboxIndex];

    return (
        <LocationProvider>
            <div className="min-h-screen bg-[#F8F9FB]">
                <Head title={`${album.title} - Photo Album - Day News`} />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: `${album.title} - Photo Album - Day News`,
                        description: album.description || `Photo album by ${album.user.name}`,
                        url: `/photos/albums/${album.id}`,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Navigation */}
                    <div className="mb-8">
                        <Link
                            href="/photos/albums"
                            className="flex items-center gap-2 text-[10px] font-black text-muted-foreground hover:text-primary transition-colors group uppercase tracking-widest"
                        >
                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                            Back to Albums
                        </Link>
                    </div>

                    {/* Album Header */}
                    <div className="mb-10">
                        <div className="mb-3 flex items-center gap-2 text-primary">
                            <Camera className="size-4 fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                Photo Album
                            </span>
                        </div>
                        <h1 className="font-display text-4xl font-black tracking-tight md:text-5xl">
                            {album.title}
                        </h1>
                        {album.description && (
                            <p className="mt-3 max-w-2xl text-lg text-muted-foreground leading-relaxed">
                                {album.description}
                            </p>
                        )}
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <div className="size-6 overflow-hidden rounded-full bg-zinc-200">
                                    {album.user.avatar ? (
                                        <img src={album.user.avatar} alt={album.user.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-zinc-500">
                                            {album.user.name[0]}
                                        </div>
                                    )}
                                </div>
                                <span className="font-medium">{album.user.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <ImageIcon className="size-4" />
                                <span>{album.photos_count} photos</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Eye className="size-4" />
                                <span>{album.views_count} views</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="size-4" />
                                <span>{new Date(album.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Photos Grid */}
                    {album.photos.length === 0 ? (
                        <div className="rounded-3xl border-2 border-dashed p-20 text-center">
                            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
                                <ImageIcon className="size-10 text-muted-foreground" />
                            </div>
                            <h3 className="mt-6 font-display text-xl font-black">
                                No photos in this album
                            </h3>
                            <p className="mt-2 text-muted-foreground">
                                Photos will appear here once they are added to the album.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {album.photos.map((photo, index) => (
                                <div
                                    key={photo.id}
                                    className="group cursor-pointer overflow-hidden rounded-xl border-none bg-card shadow-sm transition-all duration-300 hover:shadow-md"
                                    onClick={() => openLightbox(index)}
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
                                            <div className="ml-auto flex items-center gap-1 text-xs">
                                                <Eye className="size-3.5" />
                                                {photo.views_count}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="line-clamp-1 text-sm font-bold group-hover:text-primary transition-colors">
                                            {photo.title}
                                        </h3>
                                        {photo.category && (
                                            <Badge variant="outline" className="mt-1 text-[9px] font-black uppercase tracking-widest">
                                                {photo.category}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Lightbox */}
                {lightboxOpen && currentPhoto && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
                        onClick={closeLightbox}
                    >
                        {/* Close Button */}
                        <button
                            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                            onClick={closeLightbox}
                        >
                            <X className="size-6" />
                        </button>

                        {/* Previous */}
                        <button
                            className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                            onClick={(e) => {
                                e.stopPropagation();
                                goPrev();
                            }}
                        >
                            <ChevronLeft className="size-6" />
                        </button>

                        {/* Image */}
                        <div
                            className="relative max-h-[85vh] max-w-[90vw]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={currentPhoto.image_url}
                                alt={currentPhoto.title}
                                className="max-h-[85vh] max-w-full rounded-lg object-contain"
                            />
                            <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-gradient-to-t from-black/80 to-transparent p-6">
                                <h3 className="text-lg font-bold text-white">
                                    {currentPhoto.title}
                                </h3>
                                {currentPhoto.description && (
                                    <p className="mt-1 text-sm text-white/70">
                                        {currentPhoto.description}
                                    </p>
                                )}
                                <div className="mt-2 flex items-center gap-4 text-xs text-white/60">
                                    <span>by {currentPhoto.user.name}</span>
                                    <span>
                                        {lightboxIndex + 1} of {album.photos.length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Next */}
                        <button
                            className="absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                            onClick={(e) => {
                                e.stopPropagation();
                                goNext();
                            }}
                        >
                            <ChevronRight className="size-6" />
                        </button>
                    </div>
                )}
            </div>
        </LocationProvider>
    );
}
