import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@inertiajs/react";
import React from "react";

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

interface PostFormProps {
    initialData?: Partial<PostFormData>;
    regions: Region[];
    isEditing?: boolean;
    onSubmit: (data: PostFormData) => void;
}

const POST_TYPES = [
    { value: "article", label: "Article" },
    { value: "announcement", label: "Announcement" },
    { value: "notice", label: "Notice" },
    { value: "ad", label: "Advertisement" },
    { value: "schedule", label: "Schedule" },
];

const CATEGORIES = [
    { value: "demise", label: "Demise (Free)" },
    { value: "missing_person", label: "Missing Person (Free)" },
    { value: "emergency", label: "Emergency (Free)" },
];

const AD_PLACEMENTS = [
    { value: "sidebar", label: "Sidebar" },
    { value: "banner", label: "Banner" },
    { value: "inline", label: "Inline" },
    { value: "featured", label: "Featured" },
];

export default function PostForm({ initialData, regions, isEditing = false, onSubmit }: PostFormProps) {
    const { data, setData, post, processing, errors } = useForm<PostFormData>({
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
        setData(
            "region_ids",
            data.region_ids.includes(regionId) ? data.region_ids.filter((id) => id !== regionId) : [...data.region_ids, regionId],
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Post Details</CardTitle>
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
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category && <p className="mt-1 text-sm text-destructive">{errors.category}</p>}
                    </div>

                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            placeholder="Enter post title"
                        />
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
                                <p className="mt-1 text-sm text-muted-foreground">$5 per day</p>
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

            <Card>
                <CardHeader>
                    <CardTitle>Regions</CardTitle>
                    <CardDescription>Select the regions where this post should appear</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                        {regions.map((region) => (
                            <label key={region.id} className="flex items-center gap-2 rounded border p-3 hover:bg-accent cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.region_ids.includes(region.id)}
                                    onChange={() => toggleRegion(region.id)}
                                    className="size-4"
                                />
                                <span className="text-sm">{region.name}</span>
                            </label>
                        ))}
                    </div>
                    {errors.region_ids && <p className="mt-2 text-sm text-destructive">{errors.region_ids}</p>}
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button type="submit" disabled={processing}>
                    {processing ? "Saving..." : isEditing ? "Update Draft" : "Create Draft"}
                </Button>
            </div>
        </form>
    );
}
