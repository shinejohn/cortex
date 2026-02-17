import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Headphones, Pencil, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { SEO } from "@/components/common/seo";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface PodcastEditPageProps {
    auth?: Auth;
    podcast: {
        id: string;
        title: string;
        slug: string;
        description: string | null;
        cover_image: string | null;
        category: string | null;
        region_ids: string[];
    };
    updateUrl: string;
    destroyUrl: string;
    viewMode?: string;
}

const categories = [
    { value: "", label: "Select Category" },
    { value: "news", label: "News & Politics" },
    { value: "business", label: "Business" },
    { value: "culture", label: "Culture & Arts" },
    { value: "sports", label: "Sports" },
    { value: "education", label: "Education" },
    { value: "entertainment", label: "Entertainment" },
    { value: "technology", label: "Technology" },
    { value: "health", label: "Health & Wellness" },
    { value: "family", label: "Family & Parenting" },
];

export default function PodcastEdit() {
    const { auth, podcast, updateUrl, destroyUrl } = usePage<PodcastEditPageProps>().props;
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(podcast.cover_image);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const form = useForm({
        title: podcast.title,
        description: podcast.description ?? "",
        category: podcast.category ?? "",
        cover_image: null as File | null,
        region_ids: podcast.region_ids,
    });

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData("cover_image", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform((data) => ({
            ...data,
            _method: "patch",
        })).post(updateUrl, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        router.delete(destroyUrl, {
            preserveScroll: false,
            onSuccess: () => {
                setDeleteDialogOpen(false);
            },
        });
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title={`Edit ${podcast.title} - Local Voices`} />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: `Edit ${podcast.title} - Local Voices`,
                        description: "Edit your podcast",
                        url: `/local-voices/podcasts/${podcast.slug}/edit`,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-4 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => router.visit(`/local-voices/podcasts/${podcast.slug}`)}
                        >
                            ← Back to podcast
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            <Trash2 className="mr-2 size-4" />
                            Delete Podcast
                        </Button>
                    </div>

                    <h1 className="mb-8 text-4xl font-bold">Edit Podcast</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label>Cover Image (Optional)</Label>
                            <div className="mt-2">
                                {coverPreview ? (
                                    <div className="relative">
                                        <img src={coverPreview} alt="Cover preview" className="h-64 w-64 rounded-lg border object-cover" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute right-2 top-2"
                                            onClick={() => {
                                                setCoverPreview(null);
                                                form.setData("cover_image", null);
                                                if (coverInputRef.current) {
                                                    coverInputRef.current.value = "";
                                                }
                                            }}
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => coverInputRef.current?.click()}
                                        className="flex h-64 w-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50"
                                    >
                                        <Upload className="mb-2 size-12 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Upload cover image</p>
                                    </div>
                                )}
                                <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="title">Podcast Title *</Label>
                            <Input
                                id="title"
                                value={form.data.title}
                                onChange={(e) => form.setData("title", e.target.value)}
                                className="mt-2"
                                required
                            />
                            {form.errors.title && <p className="mt-1 text-sm text-destructive">{form.errors.title}</p>}
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={form.data.description}
                                onChange={(e) => form.setData("description", e.target.value)}
                                className="mt-2"
                                rows={6}
                                placeholder="Tell listeners what your podcast is about..."
                            />
                            {form.errors.description && <p className="mt-1 text-sm text-destructive">{form.errors.description}</p>}
                        </div>

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

                        <div className="flex gap-4">
                            <Button type="submit" disabled={form.processing}>
                                <Pencil className={`mr-2 size-4 ${form.processing ? "animate-spin" : ""}`} />
                                {form.processing ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(`/local-voices/podcasts/${podcast.slug}`)}
                                disabled={form.processing}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete podcast?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will archive your podcast. It will no longer be visible to listeners. You can restore it later from the dashboard.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </LocationProvider>
    );
}
