import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { useForm } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import { ArrowLeft, Camera, DollarSign, MapPin, Upload, X } from "lucide-react";
import { router } from "@inertiajs/react";
import { useState } from "react";

interface CreateClassifiedProps {
    auth?: Auth;
}

export default function CreateClassified({ auth }: CreateClassifiedProps) {
    const [images, setImages] = useState<Array<{ file: File; preview: string }>>([]);

    const form = useForm({
        category: "",
        subcategory: "",
        title: "",
        description: "",
        price: "",
        price_type: "fixed",
        condition: "",
        location: "",
        images: [] as File[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.setData("images", images.map((img) => img.file));
        form.post("/classifieds", {
            forceFormData: true,
            onSuccess: (page) => {
                // Will redirect to select-regions
            },
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files).map((file) => ({
                file,
                preview: URL.createObjectURL(file),
            }));
            if (images.length + newImages.length > 5) {
                alert("You can upload a maximum of 5 images");
                return;
            }
            setImages([...images, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        URL.revokeObjectURL(images[index].preview);
        setImages(images.filter((_, i) => i !== index));
    };

    const categories = [
        { value: "for_sale", label: "For Sale", subcategories: ["vehicles", "electronics", "furniture", "clothing", "other"] },
        { value: "housing", label: "Housing", subcategories: ["apartments", "houses", "rooms", "commercial", "other"] },
        { value: "jobs", label: "Jobs", subcategories: ["full_time", "part_time", "contract", "freelance", "other"] },
        { value: "services", label: "Services", subcategories: ["landscaping", "cleaning", "repair", "tutoring", "other"] },
        { value: "community", label: "Community", subcategories: ["events", "volunteer", "lost_found", "other"] },
        { value: "personals", label: "Personals", subcategories: ["dating", "friendship", "other"] },
    ];

    const selectedCategory = categories.find((c) => c.value === form.data.category);

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title="Post Classified - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Post Classified - Day News",
                        description: "Create a classified listing",
                        url: "/classifieds/create",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <Button variant="ghost" onClick={() => router.visit("/classifieds")} className="mb-6">
                        <ArrowLeft className="mr-2 size-4" />
                        Back to Classifieds
                    </Button>

                    <h1 className="mb-6 text-3xl font-bold">Post a Classified Listing</h1>

                    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-6">
                        {/* Category */}
                        <div>
                            <Label htmlFor="category">Category *</Label>
                            <Select value={form.data.category} onValueChange={(value) => form.setData("category", value)}>
                                <SelectTrigger>
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
                            {form.errors.category && <p className="mt-1 text-sm text-destructive">{form.errors.category}</p>}
                        </div>

                        {/* Subcategory */}
                        {selectedCategory && selectedCategory.subcategories.length > 0 && (
                            <div>
                                <Label htmlFor="subcategory">Subcategory</Label>
                                <Select value={form.data.subcategory} onValueChange={(value) => form.setData("subcategory", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select subcategory" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedCategory.subcategories.map((sub) => (
                                            <SelectItem key={sub} value={sub}>
                                                {sub.replace("_", " ")}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Title */}
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={form.data.title}
                                onChange={(e) => form.setData("title", e.target.value)}
                                placeholder="e.g., 2020 Honda Civic - Excellent Condition"
                                required
                            />
                            {form.errors.title && <p className="mt-1 text-sm text-destructive">{form.errors.title}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                value={form.data.description}
                                onChange={(e) => form.setData("description", e.target.value)}
                                placeholder="Describe your item or service..."
                                rows={6}
                                required
                            />
                            {form.errors.description && <p className="mt-1 text-sm text-destructive">{form.errors.description}</p>}
                        </div>

                        {/* Price */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="price">Price</Label>
                                <div className="flex items-center">
                                    <DollarSign className="mr-2 size-5 text-muted-foreground" />
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={form.data.price}
                                        onChange={(e) => form.setData("price", e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="price_type">Price Type</Label>
                                <Select value={form.data.price_type} onValueChange={(value) => form.setData("price_type", value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">Fixed Price</SelectItem>
                                        <SelectItem value="negotiable">Negotiable</SelectItem>
                                        <SelectItem value="contact_for_pricing">Contact for Pricing</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Condition */}
                        {form.data.category === "for_sale" && (
                            <div>
                                <Label htmlFor="condition">Condition</Label>
                                <Select value={form.data.condition} onValueChange={(value) => form.setData("condition", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select condition" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">New</SelectItem>
                                        <SelectItem value="like_new">Like New</SelectItem>
                                        <SelectItem value="excellent">Excellent</SelectItem>
                                        <SelectItem value="good">Good</SelectItem>
                                        <SelectItem value="fair">Fair</SelectItem>
                                        <SelectItem value="poor">Poor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Location */}
                        <div>
                            <Label htmlFor="location">Location *</Label>
                            <div className="flex items-center">
                                <MapPin className="mr-2 size-5 text-muted-foreground" />
                                <Input
                                    id="location"
                                    value={form.data.location}
                                    onChange={(e) => form.setData("location", e.target.value)}
                                    placeholder="e.g., Downtown Clearwater"
                                    required
                                />
                            </div>
                            {form.errors.location && <p className="mt-1 text-sm text-destructive">{form.errors.location}</p>}
                        </div>

                        {/* Images */}
                        <div>
                            <Label>Images (up to 5)</Label>
                            <div className="mt-2 grid grid-cols-5 gap-4">
                                {images.map((img, index) => (
                                    <div key={index} className="relative">
                                        <img src={img.preview} alt={`Preview ${index + 1}`} className="h-24 w-full rounded-lg object-cover" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute right-1 top-1"
                                            onClick={() => removeImage(index)}
                                        >
                                            <X className="size-3" />
                                        </Button>
                                    </div>
                                ))}
                                {images.length < 5 && (
                                    <label className="flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed hover:bg-muted">
                                        <Upload className="size-6 text-muted-foreground" />
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" multiple />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => router.visit("/classifieds")}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? "Creating..." : "Continue to Region Selection"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </LocationProvider>
    );
}

