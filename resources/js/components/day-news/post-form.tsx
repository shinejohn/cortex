import { useForm } from "@inertiajs/react";
import { CheckCircle2, DollarSign } from "lucide-react";
import React, { useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Region {
    id: number;
    name: string;
    type: string;
}

interface PostFormData {
    type: string;
    category: string | null;
    title: string;
    content: string;
    excerpt: string;
    featured_image: File | null;
    region_ids: number[];
    metadata: {
        ad_days?: number;
        ad_placement?: string;
    };
}

interface Pricing {
    is_first_post: boolean;
    post_price: number;
    ad_price_per_day: number;
    free_categories: string[];
}

interface PostFormProps {
    initialData?: Partial<PostFormData>;
    regions: Region[];
    isEditing?: boolean;
    onSubmit: (data: PostFormData) => void;
    pricing?: Pricing;
}

const POST_TYPES = [
    { value: "article", label: "Article" },
    { value: "announcement", label: "Announcement" },
    { value: "notice", label: "Notice" },
    { value: "ad", label: "Advertisement" },
    { value: "schedule", label: "Schedule" },
];

const CATEGORIES = [
    { value: "obituary", label: "Obituary / Demise", free: true },
    { value: "missing_person", label: "Missing Person", free: true },
    { value: "emergency", label: "Emergency", free: true },
    { value: "public_notice", label: "Public Notice", free: false },
    { value: "community", label: "Community", free: false },
    { value: "local_news", label: "Local News", free: false },
    { value: "business", label: "Business", free: false },
    { value: "events", label: "Events", free: false },
    { value: "other", label: "Other", free: false },
];

const AD_PLACEMENTS = [
    { value: "sidebar", label: "Sidebar" },
    { value: "banner", label: "Banner" },
    { value: "inline", label: "Inline" },
    { value: "featured", label: "Featured" },
];

export default function PostForm({ initialData, regions, isEditing = false, onSubmit, pricing }: PostFormProps) {
    const { data, setData, processing, errors } = useForm<PostFormData>({
        type: initialData?.type || "article",
        category: initialData?.category || null,
        title: initialData?.title || "",
        content: initialData?.content || "",
        excerpt: initialData?.excerpt || "",
        featured_image: null,
        region_ids: initialData?.region_ids || [],
        metadata: initialData?.metadata || {},
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(data);
    };

    const toggleRegion = (regionId: number) => {
        setData("region_ids", data.region_ids.includes(regionId) ? data.region_ids.filter((id) => id !== regionId) : [...data.region_ids, regionId]);
    };

    const currentPricing = useMemo(() => {
        if (!pricing) return null;

        // First post is always free
        if (pricing.is_first_post) {
            return { isFree: true, reason: "First post is free" };
        }

        // Ads are never free (charged per day)
        if (data.type === "ad") {
            const days = data.metadata.ad_days || 0;
            const cost = days * pricing.ad_price_per_day;
            return {
                isFree: false,
                cost,
                reason: days > 0 ? `$${cost.toFixed(2)} for ${days} day${days !== 1 ? "s" : ""}` : "Select duration to see cost",
            };
        }

        // Free categories
        if (data.category && pricing.free_categories.includes(data.category)) {
            const categoryLabel = CATEGORIES.find((c) => c.value === data.category)?.label || data.category;
            return { isFree: true, reason: `${categoryLabel} posts are free` };
        }

        // Regular paid post
        return {
            isFree: false,
            cost: pricing.post_price,
            reason: `$${pricing.post_price.toFixed(2)}`,
        };
    }, [pricing, data.type, data.category, data.metadata.ad_days]);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="font-display font-black tracking-tight">Post Details</CardTitle>
                    <CardDescription>Fill in the details for your post</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="type">Post Type</Label>
                        <Select value={data.type} onValueChange={(value) => setData("type", value)} disabled={isEditing}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {POST_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.type && <p className="mt-1 text-sm text-destructive">{errors.type}</p>}
                    </div>

                    <div>
                        <Label htmlFor="category">Category (Optional)</Label>
                        <Select value={data.category || "none"} onValueChange={(value) => setData("category", value === "none" ? null : value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                        {cat.free && " (Free)"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category && <p className="mt-1 text-sm text-destructive">{errors.category}</p>}
                    </div>

                    {/* Dynamic Pricing Display */}
                    {currentPricing && !isEditing && (
                        <Alert
                            variant="default"
                            className={currentPricing.isFree ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : ""}
                        >
                            {currentPricing.isFree ? (
                                <CheckCircle2 className="size-4 text-green-600" />
                            ) : (
                                <DollarSign className="size-4" />
                            )}
                            <AlertDescription>
                                <span className={currentPricing.isFree ? "text-green-700 dark:text-green-300" : ""}>
                                    {currentPricing.isFree ? "Free: " : "Cost: "}
                                    {currentPricing.reason}
                                </span>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={data.title} onChange={(e) => setData("title", e.target.value)} placeholder="Enter post title" />
                        {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
                    </div>

                    <div>
                        <Label htmlFor="excerpt">Excerpt</Label>
                        <Textarea
                            id="excerpt"
                            value={data.excerpt}
                            onChange={(e) => setData("excerpt", e.target.value)}
                            placeholder="Brief summary of your post"
                            rows={2}
                        />
                        {errors.excerpt && <p className="mt-1 text-sm text-destructive">{errors.excerpt}</p>}
                    </div>

                    <div>
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                            id="content"
                            value={data.content}
                            onChange={(e) => setData("content", e.target.value)}
                            placeholder="Write your post content here"
                            rows={10}
                        />
                        {errors.content && <p className="mt-1 text-sm text-destructive">{errors.content}</p>}
                    </div>

                    <div>
                        <Label htmlFor="featured_image">Featured Image</Label>
                        <Input
                            id="featured_image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData("featured_image", e.target.files?.[0] || null)}
                        />
                        {errors.featured_image && <p className="mt-1 text-sm text-destructive">{errors.featured_image}</p>}
                    </div>

                    {data.type === "ad" && (
                        <>
                            <div>
                                <Label htmlFor="ad_days">Advertisement Duration (Days)</Label>
                                <Input
                                    id="ad_days"
                                    type="number"
                                    min="1"
                                    max="90"
                                    value={data.metadata.ad_days || ""}
                                    onChange={(e) =>
                                        setData("metadata", {
                                            ...data.metadata,
                                            ad_days: parseInt(e.target.value) || undefined,
                                        })
                                    }
                                    placeholder="Number of days to run ad"
                                />
                                <p className="mt-1 text-sm text-muted-foreground">
                                    ${pricing?.ad_price_per_day?.toFixed(2) ?? "5.00"} per day
                                </p>
                                {errors["metadata.ad_days"] && <p className="mt-1 text-sm text-destructive">{errors["metadata.ad_days"]}</p>}
                            </div>

                            <div>
                                <Label htmlFor="ad_placement">Ad Placement</Label>
                                <Select
                                    value={data.metadata.ad_placement || ""}
                                    onValueChange={(value) =>
                                        setData("metadata", {
                                            ...data.metadata,
                                            ad_placement: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select placement" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {AD_PLACEMENTS.map((placement) => (
                                            <SelectItem key={placement.value} value={placement.value}>
                                                {placement.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors["metadata.ad_placement"] && (
                                    <p className="mt-1 text-sm text-destructive">{errors["metadata.ad_placement"]}</p>
                                )}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="font-display font-black tracking-tight">Regions</CardTitle>
                    <CardDescription>Select the regions where this post should appear</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                        {regions.map((region) => (
                            <label key={region.id} className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={data.region_ids.includes(region.id)}
                                    onChange={() => toggleRegion(region.id)}
                                    className="size-4"
                                />
                                <span className="text-sm font-medium">{region.name}</span>
                            </label>
                        ))}
                    </div>
                    {errors.region_ids && <p className="mt-2 text-sm text-destructive">{errors.region_ids}</p>}
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button type="submit" disabled={processing} className="font-black uppercase tracking-wider text-xs">
                    {processing ? "Saving..." : isEditing ? "Save Changes" : "Create Post"}
                </Button>
            </div>
        </form>
    );
}
