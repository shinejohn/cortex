import { Head, router, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Calendar, Camera, Eye, Heart, MapPin, MessageSquare, Share2, Trash2, User } from "lucide-react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
            <div className="min-h-screen bg-[#F8F9FB]">
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

                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <button
                            onClick={() => router.visit("/photos")}
                            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
                        >
                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                            BACK TO GALLERY
                        </button>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Photo */}
                        <div className="lg:col-span-2">
                            <div className="mb-6 overflow-hidden rounded-2xl border-none bg-white shadow-sm">
                                <img src={photo.image_url} alt={photo.title} className="h-auto w-full object-contain" />
                            </div>

                            {/* Photo Info */}
                            <div className="overflow-hidden rounded-2xl border-none bg-white p-8 shadow-sm">
                                <div className="mb-6 flex items-start justify-between">
                                    <div>
                                        <h1 className="mb-2 font-display text-3xl font-black tracking-tight">{photo.title}</h1>
                                        {photo.description && <p className="text-lg text-muted-foreground leading-relaxed">{photo.description}</p>}
                                    </div>
                                    {auth && auth.user?.id === photo.user.id && (
                                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteForm.processing} className="rounded-xl font-bold">
                                            <Trash2 className="mr-2 size-4" />
                                            Delete
                                        </Button>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        {photo.user.avatar ? (
                                            <img src={photo.user.avatar} alt={photo.user.name} className="size-6 rounded-full object-cover" />
                                        ) : (
                                            <User className="size-4" />
                                        )}
                                        <span className="font-medium">{photo.user.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="size-4" />
                                        {new Date(photo.created_at).toLocaleDateString()}
                                    </div>
                                    {photo.category && (
                                        <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                                            {photo.category}
                                        </span>
                                    )}
                                    {photo.regions.length > 0 && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="size-4 text-primary" />
                                            <span>{photo.regions.map((r) => r.name).join(", ")}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex items-center gap-6 border-t pt-6">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Eye className="size-5" />
                                        <span className="font-bold">{photo.views_count}</span>
                                        <span className="text-sm">views</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Heart className="size-5" />
                                        <span className="font-bold">{photo.likes_count}</span>
                                        <span className="text-sm">likes</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MessageSquare className="size-5" />
                                        <span className="font-bold">{photo.comments_count}</span>
                                        <span className="text-sm">comments</span>
                                    </div>
                                    <div className="ml-auto">
                                        <Button variant="outline" size="sm" className="gap-2 rounded-xl font-bold">
                                            <Share2 className="size-4" />
                                            Share
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Album Info */}
                            {photo.album && (
                                <div className="overflow-hidden rounded-2xl border-none bg-white p-6 shadow-sm">
                                    <h3 className="mb-3 font-display font-black tracking-tight">Album</h3>
                                    <Button variant="link" className="h-auto p-0 font-bold text-primary" onClick={() => router.visit(`/photos/albums/${photo.album!.id}`)}>
                                        {photo.album.title}
                                    </Button>
                                </div>
                            )}

                            {/* Related Photos */}
                            {related.length > 0 && (
                                <div className="overflow-hidden rounded-2xl border-none bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 font-display font-black tracking-tight">Related Photos</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {related.slice(0, 6).map((relatedPhoto) => (
                                            <div
                                                key={relatedPhoto.id}
                                                className="group cursor-pointer overflow-hidden rounded-xl"
                                                onClick={() => router.visit(`/photos/${relatedPhoto.id}`)}
                                            >
                                                <img
                                                    src={relatedPhoto.thumbnail_url || relatedPhoto.image_url}
                                                    alt={relatedPhoto.title}
                                                    className="h-24 w-full object-cover transition-transform duration-300 group-hover:scale-110"
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
