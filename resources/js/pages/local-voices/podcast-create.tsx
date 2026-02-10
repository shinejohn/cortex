import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Headphones, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { SEO } from "@/components/common/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import GoLocalVoicesLayout from "@/layouts/go-local-voices-layout";
import type { Auth } from "@/types";

interface PodcastCreatePageProps {
    auth?: Auth;
    profile: {
        id: string;
        display_name: string;
    };
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

export default function PodcastCreate() {
    const { auth } = usePage<PodcastCreatePageProps>().props;
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
        form.post("/podcasts", {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <GoLocalVoicesLayout auth={auth}>
            <Head title="Create Podcast - Go Local Voices" />
            <SEO
                type="website"
                site="go-local-voices"
                data={{
                    title: "Create Podcast - Go Local Voices",
                    description: "Create a new podcast",
                    url: "/podcasts/create",
                }}
            />

            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white py-12 lg:py-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h1 className="font-display text-4xl font-black tracking-tight mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Create Podcast
                        </h1>
                        <p className="text-muted-foreground">Start sharing your voice with the community</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-2xl border-none p-8 shadow-sm">
                        {/* Cover Image */}
                        <div>
                            <Label className="text-base font-semibold">Cover Image (Optional)</Label>
                            <div className="mt-3">
                                {coverPreview ? (
                                    <div className="relative inline-block">
                                        <img src={coverPreview} alt="Cover preview" className="h-64 w-64 rounded-2xl object-cover shadow-md" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute right-2 top-2 rounded-full h-8 w-8 p-0"
                                            onClick={() => {
                                                setCoverPreview(null);
                                                form.setData("cover_image", null);
                                                if (coverInputRef.current) {
                                                    coverInputRef.current.value = "";
                                                }
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => coverInputRef.current?.click()}
                                        className="flex h-64 w-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-200 transition-colors hover:border-purple-400 hover:bg-purple-50/50"
                                    >
                                        <Upload className="mb-3 h-12 w-12 text-purple-300" />
                                        <p className="text-sm font-medium text-muted-foreground">Upload cover image</p>
                                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                                    </div>
                                )}
                                <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-base font-semibold">Podcast Title *</Label>
                            <Input
                                id="title"
                                value={form.data.title}
                                onChange={(e) => form.setData("title", e.target.value)}
                                className="h-11 rounded-xl border focus:border-purple-500 focus:ring-purple-500"
                                required
                            />
                            {form.errors.title && <p className="text-sm text-destructive">{form.errors.title}</p>}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-base font-semibold">Description</Label>
                            <Textarea
                                id="description"
                                value={form.data.description}
                                onChange={(e) => form.setData("description", e.target.value)}
                                className="rounded-xl border focus:border-purple-500 focus:ring-purple-500"
                                rows={6}
                                placeholder="Tell listeners what your podcast is about..."
                            />
                            {form.errors.description && <p className="text-sm text-destructive">{form.errors.description}</p>}
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-base font-semibold">Category</Label>
                            <Select value={form.data.category} onValueChange={(value) => form.setData("category", value)}>
                                <SelectTrigger className="h-11 rounded-xl border focus:border-purple-500 focus:ring-purple-500">
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
                            <div className="rounded-xl border border-destructive/20 bg-red-50 p-5">
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
                        <div className="flex gap-4 pt-2">
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                <Headphones className={`mr-2 h-4 w-4 ${form.processing ? "animate-spin" : ""}`} />
                                {form.processing ? "Creating..." : "Create Podcast"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit("/")}
                                disabled={form.processing}
                                className="rounded-xl border"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </GoLocalVoicesLayout>
    );
}
