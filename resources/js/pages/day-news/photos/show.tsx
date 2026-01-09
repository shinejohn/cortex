import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { Calendar, Camera, Heart, MapPin, MessageSquare, Share2, Trash2, User } from "lucide-react";

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
    regions: Array<{
        id: number;
        name: string;
    }>;
}

interface PhotoShowPageProps {
    auth?: Auth;
    photo: Photo;
    related: Photo[];
}

export default function PhotoShow() {
    const { auth, photo, related } = usePage<PhotoShowPageProps>().props;

    const deleteForm = useForm({});

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this photo?")) {
            deleteForm.delete(`/photos/${photo.id}`, {
                preserveScroll: false,
            });
        }
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title={`${photo.title} - Photo Gallery`} />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: `${photo.title} - Photo Gallery`,
                        description: photo.description || photo.title,
                        image: photo.image_url,
                        url: `/photos/${photo.id}`,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-4">
                        <Button variant="ghost" onClick={() => router.visit("/photos")}>
                            ← Back to Gallery
                        </Button>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Photo */}
                        <div className="lg:col-span-2">
                            <div className="mb-4 overflow-hidden rounded-lg border bg-card">
                                <img src={photo.image_url} alt={photo.title} className="h-auto w-full object-contain" />
                            </div>

                            {/* Photo Info */}
                            <div className="rounded-lg border bg-card p-6">
                                <div className="mb-4 flex items-start justify-between">
                                    <div>
                                        <h1 className="mb-2 text-3xl font-bold">{photo.title}</h1>
                                        {photo.description && <p className="text-muted-foreground">{photo.description}</p>}
                                    </div>
                                    {auth && auth.user?.id === photo.user.id && (
                                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteForm.processing}>
                                            <Trash2 className="mr-2 size-4" />
                                            Delete
                                        </Button>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <User className="size-4" />
                                        {photo.user.name}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="size-4" />
                                        {new Date(photo.created_at).toLocaleDateString()}
                                    </div>
                                    {photo.category && <Badge variant="outline">{photo.category}</Badge>}
                                    {photo.regions.length > 0 && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="size-4" />
                                            {photo.regions.map((r) => r.name).join(", ")}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center gap-6 border-t pt-4">
                                    <div className="flex items-center gap-2">
                                        <Eye className="size-5" />
                                        <span>{photo.views_count} views</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Heart className="size-5" />
                                        <span>{photo.likes_count} likes</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="size-5" />
                                        <span>{photo.comments_count} comments</span>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <Share2 className="mr-2 size-4" />
                                        Share
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Album Info */}
                            {photo.album && (
                                <div className="rounded-lg border bg-card p-4">
                                    <h3 className="mb-2 font-semibold">Album</h3>
                                    <Button variant="link" className="h-auto p-0" onClick={() => router.visit(`/photos/albums/${photo.album!.id}`)}>
                                        {photo.album.title}
                                    </Button>
                                </div>
                            )}

                            {/* Related Photos */}
                            {related.length > 0 && (
                                <div className="rounded-lg border bg-card p-4">
                                    <h3 className="mb-4 font-semibold">Related Photos</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {related.slice(0, 6).map((relatedPhoto) => (
                                            <div
                                                key={relatedPhoto.id}
                                                className="cursor-pointer overflow-hidden rounded-lg"
                                                onClick={() => router.visit(`/photos/${relatedPhoto.id}`)}
                                            >
                                                <img
                                                    src={relatedPhoto.thumbnail_url || relatedPhoto.image_url}
                                                    alt={relatedPhoto.title}
                                                    className="h-24 w-full object-cover transition-transform hover:scale-105"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </LocationProvider>
    );
}
