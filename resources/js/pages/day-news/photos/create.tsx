import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { Camera, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

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
            <div className="min-h-screen bg-background">
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

                <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    <h1 className="mb-8 text-4xl font-bold">Upload Photo</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload */}
                        <div>
                            <Label>Photo</Label>
                            <div className="mt-2">
                                {preview ? (
                                    <div className="relative">
                                        <img src={preview} alt="Preview" className="h-64 w-full rounded-lg border object-cover" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute right-2 top-2"
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
                                        className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50"
                                    >
                                        <Camera className="mb-4 size-12 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Click to upload photo</p>
                                        <p className="mt-1 text-xs text-muted-foreground">Max 10MB</p>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" required />
                            </div>
                            {form.errors.image && <p className="mt-1 text-sm text-destructive">{form.errors.image}</p>}
                        </div>

                        {/* Title */}
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={form.data.title}
                                onChange={(e) => form.setData("title", e.target.value)}
                                className="mt-2"
                                required
                            />
                            {form.errors.title && <p className="mt-1 text-sm text-destructive">{form.errors.title}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={form.data.description}
                                onChange={(e) => form.setData("description", e.target.value)}
                                className="mt-2"
                                rows={4}
                            />
                            {form.errors.description && <p className="mt-1 text-sm text-destructive">{form.errors.description}</p>}
                        </div>

                        {/* Category */}
                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Select value={form.data.category} onValueChange={(value) => form.setData("category", value)}>
                                <SelectTrigger className="mt-2">
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

                        {/* Album */}
                        {albums.length > 0 && (
                            <div>
                                <Label htmlFor="album_id">Album (Optional)</Label>
                                <Select value={form.data.album_id} onValueChange={(value) => form.setData("album_id", value)}>
                                    <SelectTrigger className="mt-2">
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

                        {/* Error Display */}
                        {Object.keys(form.errors).length > 0 && (
                            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                                <p className="mb-2 font-semibold text-destructive">Please fix the following errors:</p>
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
                            <Button type="submit" disabled={form.processing}>
                                <Upload className={`mr-2 size-4 ${form.processing ? "animate-spin" : ""}`} />
                                {form.processing ? "Uploading..." : "Upload Photo"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.visit("/photos")} disabled={form.processing}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </LocationProvider>
    );
}
