import { Head, router, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Headphones, ImagePlus, Upload, X } from "lucide-react";
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

interface PodcastCreatePageProps {
    auth?: Auth;
    profile: {
        id: string;
        display_name: string;
    };
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

export default function PodcastCreate() {
    const { auth, profile } = usePage<PodcastCreatePageProps>().props;
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const form = useForm({
        title: "",
        description: "",
        category: "",
        cover_image: null as File | null,
        region_ids: [] as string[],
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
        form.post(route("daynews.local-voices.podcast.store") as any, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-[#F8F9FB]">
                <Head title="Create Podcast - Local Voices" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Create Podcast - Local Voices",
                        description: "Create a new podcast",
                        url: route("daynews.local-voices.podcast.create") as any,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back Navigation */}
                    <button
                        onClick={() => router.visit(route("daynews.local-voices.index") as any)}
                        className="mb-8 flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary group"
                    >
                        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                        BACK TO LOCAL VOICES
                    </button>

                    <div className="mb-2 flex items-center gap-2 text-primary">
                        <Headphones className="size-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">New Podcast</span>
                    </div>
                    <h1 className="mb-8 font-display text-4xl font-black tracking-tight">
                        Create <span className="italic text-primary">Podcast</span>
                    </h1>

                    <div className="overflow-hidden rounded-2xl border-none bg-white p-8 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Cover Image */}
                            <div>
                                <Label className="text-sm font-bold text-zinc-700">Cover Image (Optional)</Label>
                                <div className="mt-3">
                                    {coverPreview ? (
                                        <div className="relative inline-block">
                                            <img src={coverPreview} alt="Cover preview" className="h-64 w-64 rounded-2xl object-cover shadow-lg" />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute right-2 top-2 rounded-full shadow-md"
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
                                            className="flex h-64 w-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 transition-all hover:border-primary hover:bg-primary/5"
                                        >
                                            <ImagePlus className="mb-3 size-12 text-zinc-400" />
                                            <p className="text-sm font-medium text-zinc-500">Upload cover image</p>
                                            <p className="mt-1 text-xs text-zinc-400">Recommended: 1400x1400</p>
                                        </div>
                                    )}
                                    <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <Label htmlFor="title" className="text-sm font-bold text-zinc-700">Podcast Title *</Label>
                                <Input
                                    id="title"
                                    value={form.data.title}
                                    onChange={(e) => form.setData("title", e.target.value)}
                                    className="mt-2 h-12 border-none bg-zinc-50 ring-1 ring-zinc-200 focus-visible:ring-2 focus-visible:ring-primary"
                                    required
                                />
                                {form.errors.title && <p className="mt-1 text-sm text-destructive">{form.errors.title}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <Label htmlFor="description" className="text-sm font-bold text-zinc-700">Description</Label>
                                <Textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) => form.setData("description", e.target.value)}
                                    className="mt-2 border-none bg-zinc-50 ring-1 ring-zinc-200 focus-visible:ring-2 focus-visible:ring-primary"
                                    rows={6}
                                    placeholder="Tell listeners what your podcast is about..."
                                />
                                {form.errors.description && <p className="mt-1 text-sm text-destructive">{form.errors.description}</p>}
                            </div>

                            {/* Category */}
                            <div>
                                <Label htmlFor="category" className="text-sm font-bold text-zinc-700">Category</Label>
                                <Select value={form.data.category} onValueChange={(value) => form.setData("category", value)}>
                                    <SelectTrigger className="mt-2 h-12 border-none bg-zinc-50 ring-1 ring-zinc-200">
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

                            {/* Error Display */}
                            {Object.keys(form.errors).length > 0 && (
                                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                                    <p className="mb-2 font-bold text-destructive">Please fix the following errors:</p>
                                    <ul className="list-inside list-disc space-y-1 text-sm text-destructive">
                                        {Object.entries(form.errors).map(([field, error]) => (
                                            <li key={field}>
                                                <strong>{field}:</strong> {error as string}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Submit */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-xl bg-primary px-8 font-bold shadow-lg shadow-primary/20"
                                >
                                    <Headphones className={`mr-2 size-4 ${form.processing ? "animate-spin" : ""}`} />
                                    {form.processing ? "Creating..." : "Create Podcast"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl font-bold"
                                    onClick={() => router.visit(route("daynews.local-voices.index") as any)}
                                    disabled={form.processing}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </LocationProvider>
    );
}
