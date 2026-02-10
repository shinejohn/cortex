import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Camera, ImagePlus, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface Album {
    id: string;
    title: string;
}

interface PhotoCreatePageProps {
    auth?: Auth;
    albums: Album[];
}

export default function PhotoCreate() {
    const { auth, albums } = usePage<PhotoCreatePageProps>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const form = useForm({
        title: "",
        description: "",
        image: null as File | null,
        category: "",
        album_id: "",
        region_ids: [] as string[],
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData("image", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post("/photos", {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const categories = [
        { value: "", label: "Select Category" },
        { value: "Nature", label: "Nature" },
        { value: "Events", label: "Events" },
        { value: "Recreation", label: "Recreation" },
        { value: "Community", label: "Community" },
        { value: "Sports", label: "Sports" },
        { value: "Environment", label: "Environment" },
        { value: "Other", label: "Other" },
    ];

    return (
        <LocationProvider>
            <div className="min-h-screen bg-[#F8F9FB]">
                <Head title="Upload Photo - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Upload Photo - Day News",
                        description: "Upload a photo to the gallery",
                        url: "/photos/create",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-2 flex items-center gap-2 text-primary">
                        <Camera className="size-4 fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Photo Gallery</span>
                    </div>
                    <h1 className="mb-8 font-display text-4xl font-black tracking-tight">Upload Photo</h1>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Image Upload */}
                        <div className="overflow-hidden rounded-2xl border-none bg-white p-6 shadow-sm">
                            <Label className="mb-3 block font-bold">Photo</Label>
                            <div>
                                {preview ? (
                                    <div className="relative">
                                        <img src={preview} alt="Preview" className="h-72 w-full rounded-xl object-cover" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute right-3 top-3 rounded-full"
                                            onClick={() => {
                                                setPreview(null);
                                                form.setData("image", null);
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = "";
                                                }
                                            }}
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex h-72 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 transition-all hover:border-primary/40 hover:bg-primary/5"
                                    >
                                        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                                            <ImagePlus className="size-8 text-primary" />
                                        </div>
                                        <p className="mt-4 font-bold text-zinc-700">Click to upload photo</p>
                                        <p className="mt-1 text-sm text-muted-foreground">Max 10MB &middot; JPG, PNG, GIF</p>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" required />
                            </div>
                            {form.errors.image && <p className="mt-2 text-sm text-destructive">{form.errors.image}</p>}
                        </div>

                        {/* Title & Description */}
                        <div className="overflow-hidden rounded-2xl border-none bg-white p-6 shadow-sm space-y-6">
                            <div>
                                <Label htmlFor="title" className="font-bold">Title *</Label>
                                <Input
                                    id="title"
                                    value={form.data.title}
                                    onChange={(e) => form.setData("title", e.target.value)}
                                    className="mt-2 h-11 border-none bg-zinc-50 ring-1 ring-zinc-200"
                                    required
                                />
                                {form.errors.title && <p className="mt-1 text-sm text-destructive">{form.errors.title}</p>}
                            </div>

                            <div>
                                <Label htmlFor="description" className="font-bold">Description</Label>
                                <Textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) => form.setData("description", e.target.value)}
                                    className="mt-2 border-none bg-zinc-50 ring-1 ring-zinc-200"
                                    rows={4}
                                />
                                {form.errors.description && <p className="mt-1 text-sm text-destructive">{form.errors.description}</p>}
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="category" className="font-bold">Category</Label>
                                    <Select value={form.data.category} onValueChange={(value) => form.setData("category", value)}>
                                        <SelectTrigger className="mt-2 h-11 border-none bg-zinc-50 ring-1 ring-zinc-200">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {albums.length > 0 && (
                                    <div>
                                        <Label htmlFor="album_id" className="font-bold">Album (Optional)</Label>
                                        <Select value={form.data.album_id} onValueChange={(value) => form.setData("album_id", value)}>
                                            <SelectTrigger className="mt-2 h-11 border-none bg-zinc-50 ring-1 ring-zinc-200">
                                                <SelectValue placeholder="Select album" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">None</SelectItem>
                                                {albums.map((album) => (
                                                    <SelectItem key={album.id} value={album.id}>
                                                        {album.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Error Display */}
                        {Object.keys(form.errors).length > 0 && (
                            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                                <p className="mb-2 font-bold text-destructive">Please fix the following errors:</p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
                                    {Object.entries(form.errors).map(([field, error]) => (
                                        <li key={field}>
                                            <strong>{field}:</strong> {error as string}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex gap-4">
                            <Button type="submit" disabled={form.processing} className="gap-2 rounded-xl px-8 font-bold shadow-lg shadow-primary/20">
                                <Upload className={`size-4 ${form.processing ? "animate-spin" : ""}`} />
                                {form.processing ? "Uploading..." : "Upload Photo"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.visit("/photos")} disabled={form.processing} className="rounded-xl font-bold">
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </LocationProvider>
    );
}
