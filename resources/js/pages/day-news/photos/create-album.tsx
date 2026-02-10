import { Head, Link, useForm } from "@inertiajs/react";
import {
    ArrowLeft,
    FolderOpen,
    Image as ImageIcon,
    Info,
    Plus,
    Upload,
} from "lucide-react";
import { useState } from "react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface CreateAlbumPageProps {
    auth?: Auth;
}

export default function CreateAlbum({ auth }: CreateAlbumPageProps) {
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const form = useForm({
        title: "",
        description: "",
        cover_image: null as File | null,
        visibility: "public",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route("daynews.photos.album.store") as any, {
            forceFormData: true,
        });
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            form.setData("cover_image", file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-[#FDFCFB]">
                <Head title="Create Album - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Create Album - Day News",
                        description: "Create a new photo album",
                        url: "/photos/albums/create",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Navigation */}
                    <div className="mb-10">
                        <Link
                            href="/photos/albums"
                            className="flex items-center gap-2 text-[10px] font-black text-muted-foreground hover:text-primary transition-colors group uppercase tracking-widest"
                        >
                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                            Back to Albums
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                        {/* Form Section */}
                        <div className="lg:col-span-8">
                            <div className="mb-10">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                        <Plus className="size-6" />
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="bg-primary/5 border-primary/10 text-primary font-black uppercase tracking-widest text-[10px] px-3"
                                    >
                                        New Album
                                    </Badge>
                                </div>
                                <h1 className="font-display text-4xl font-black tracking-tight text-zinc-900 md:text-5xl">
                                    Create an Album
                                </h1>
                                <p className="mt-4 max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground">
                                    Organize your photos into a collection for the community to enjoy.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-10">
                                {/* Basic Information */}
                                <section className="space-y-8 rounded-3xl border bg-white p-8 shadow-sm">
                                    <div className="mb-6">
                                        <h2 className="flex items-center gap-2 text-xl font-black text-zinc-900 mb-1">
                                            <Info className="size-5 text-primary" />
                                            Album Details
                                        </h2>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Give your album a name and description.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label
                                            htmlFor="title"
                                            className="text-[10px] font-black uppercase tracking-widest text-zinc-500"
                                        >
                                            Album Title *
                                        </Label>
                                        <Input
                                            id="title"
                                            className="h-12 border-zinc-200 bg-zinc-50/50 focus:bg-white transition-colors rounded-xl font-bold"
                                            value={form.data.title}
                                            onChange={(e) => form.setData("title", e.target.value)}
                                            placeholder="Enter a descriptive album title"
                                            required
                                        />
                                        {form.errors.title && (
                                            <p className="text-[11px] font-bold uppercase tracking-widest text-destructive">
                                                {form.errors.title}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <Label
                                            htmlFor="description"
                                            className="text-[10px] font-black uppercase tracking-widest text-zinc-500"
                                        >
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            className="min-h-[120px] border-zinc-200 bg-zinc-50/50 focus:bg-white transition-colors rounded-xl font-medium"
                                            value={form.data.description}
                                            onChange={(e) => form.setData("description", e.target.value)}
                                            placeholder="Describe what this album is about..."
                                        />
                                        {form.errors.description && (
                                            <p className="text-[11px] font-bold uppercase tracking-widest text-destructive">
                                                {form.errors.description}
                                            </p>
                                        )}
                                    </div>
                                </section>

                                {/* Cover Image */}
                                <section className="space-y-8 rounded-3xl border bg-white p-8 shadow-sm">
                                    <div className="mb-6">
                                        <h2 className="flex items-center gap-2 text-xl font-black text-zinc-900 mb-1">
                                            <ImageIcon className="size-5 text-primary" />
                                            Cover Image
                                        </h2>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Upload a cover image that represents this album.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label
                                            htmlFor="cover_image"
                                            className="text-[10px] font-black uppercase tracking-widest text-zinc-500"
                                        >
                                            Cover Image
                                        </Label>
                                        <div className="relative">
                                            {coverPreview ? (
                                                <div className="relative aspect-video overflow-hidden rounded-2xl border-2 border-dashed border-primary/20">
                                                    <img
                                                        src={coverPreview}
                                                        alt="Cover preview"
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                                                        <label
                                                            htmlFor="cover_image"
                                                            className="cursor-pointer rounded-xl bg-white px-4 py-2 text-sm font-bold text-zinc-900 shadow-lg"
                                                        >
                                                            Change Image
                                                        </label>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label
                                                    htmlFor="cover_image"
                                                    className="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-12 transition-all hover:border-primary/40 hover:bg-primary/5"
                                                >
                                                    <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                        <Upload className="size-7" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-bold text-zinc-700">
                                                            Click to upload cover image
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            PNG, JPG or WebP up to 10MB
                                                        </p>
                                                    </div>
                                                </label>
                                            )}
                                            <input
                                                type="file"
                                                id="cover_image"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleCoverChange}
                                            />
                                        </div>
                                        {form.errors.cover_image && (
                                            <p className="text-[11px] font-bold uppercase tracking-widest text-destructive">
                                                {form.errors.cover_image}
                                            </p>
                                        )}
                                    </div>
                                </section>

                                {/* Submit */}
                                <div className="flex items-center gap-4">
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                        className="h-14 gap-3 px-8 text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20 rounded-xl"
                                    >
                                        <FolderOpen className="size-5" />
                                        {form.processing ? "Creating..." : "Create Album"}
                                    </Button>
                                    <Link
                                        href="/photos/albums"
                                        className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        </div>

                        {/* Sidebar Tips */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24 space-y-6">
                                <div className="overflow-hidden rounded-2xl border-none bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 font-display text-lg font-black tracking-tight">
                                        Album Tips
                                    </h3>
                                    <ul className="space-y-4 text-sm text-muted-foreground">
                                        <li className="flex gap-3">
                                            <div className="mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black text-primary">
                                                1
                                            </div>
                                            <p>
                                                Choose a descriptive title so others can easily find your album.
                                            </p>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black text-primary">
                                                2
                                            </div>
                                            <p>
                                                A good cover image helps your album stand out in the gallery.
                                            </p>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black text-primary">
                                                3
                                            </div>
                                            <p>
                                                You can add photos to your album after creating it.
                                            </p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </LocationProvider>
    );
}
