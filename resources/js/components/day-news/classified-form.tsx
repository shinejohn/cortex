import { useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { route } from "ziggy-js";

interface Category {
    id: number;
    name: string;
}

interface Condition {
    value: string;
    label: string;
}

interface PriceType {
    value: string;
    label: string;
}

interface ClassifiedFormData {
    title: string;
    description: string;
    price: string;
    price_type: string;
    condition: string;
    category_id: string;
    location: string;
    contact_email: string;
    contact_phone: string;
    images: File[];
}

interface Props {
    categories: Category[];
    conditions: Condition[];
    priceTypes: PriceType[];
    initialData?: any;
    mode: "create" | "edit";
}

export function ClassifiedForm({ categories, conditions, priceTypes, initialData = {}, mode }: Props) {
    const { data, setData, post, processing, errors } = useForm<ClassifiedFormData>({
        title: initialData.title || "",
        description: initialData.description || "",
        price: initialData.price || "",
        price_type: initialData.price_type || "fixed",
        condition: initialData.condition || "new",
        category_id: initialData.category_id ? String(initialData.category_id) : "",
        location: initialData.location || "",
        contact_email: initialData.contact_email || "",
        contact_phone: initialData.contact_phone || "",
        images: [],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (mode === "create") {
            post(route("daynews.classifieds.store"));
        } else {
            post(route("daynews.classifieds.update", initialData.id), {
                data: {
                    ...data,
                    _method: "put",
                },
            });
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Listing Details</CardTitle>
                    <CardDescription>
                        {mode === "create" ? "Create a new classified listing" : "Edit existing listing"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Listing Title</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            placeholder="e.g. Vintage Bicycle"
                            required
                        />
                        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category_id">Category</Label>
                        <Select
                            value={data.category_id}
                            onValueChange={(val) => setData("category_id", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories && categories.map((cat) => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
                    </div>

                    {/* Price & Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={data.price}
                                onChange={(e) => setData("price", e.target.value)}
                                placeholder="0.00"
                                required
                            />
                            {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price_type">Price Type</Label>
                            <Select
                                value={data.price_type}
                                onValueChange={(val) => setData("price_type", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {priceTypes && priceTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.price_type && <p className="text-sm text-red-500">{errors.price_type}</p>}
                        </div>
                    </div>

                    {/* Condition */}
                    <div className="space-y-2">
                        <Label htmlFor="condition">Item Condition</Label>
                        <Select
                            value={data.condition}
                            onValueChange={(val) => setData("condition", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                                {conditions && conditions.map((cond) => (
                                    <SelectItem key={cond.value} value={cond.value}>
                                        {cond.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.condition && <p className="text-sm text-red-500">{errors.condition}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            placeholder="Describe your item in detail..."
                            required
                            className="min-h-[150px]"
                        />
                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label htmlFor="location">Location (City/Neighborhood)</Label>
                        <Input
                            id="location"
                            value={data.location}
                            onChange={(e) => setData("location", e.target.value)}
                            placeholder="e.g. Downtown"
                            required
                        />
                        {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contact_email">Contact Email</Label>
                            <Input
                                id="contact_email"
                                type="email"
                                value={data.contact_email}
                                onChange={(e) => setData("contact_email", e.target.value)}
                                placeholder="your@email.com"
                                required
                            />
                            {errors.contact_email && <p className="text-sm text-red-500">{errors.contact_email}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact_phone">Contact Phone (Optional)</Label>
                            <Input
                                id="contact_phone"
                                type="tel"
                                value={data.contact_phone}
                                onChange={(e) => setData("contact_phone", e.target.value)}
                                placeholder="(555) 123-4567"
                            />
                            {errors.contact_phone && <p className="text-sm text-red-500">{errors.contact_phone}</p>}
                        </div>
                    </div>

                    {/* Images */}
                    <div className="space-y-2">
                        <Label htmlFor="images">Images (Optional)</Label>
                        <Input
                            id="images"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => setData("images", e.target.files ? Array.from(e.target.files) : [])}
                        />
                        <p className="text-xs text-muted-foreground">Upload up to 5 images.</p>
                        {errors.images && <p className="text-sm text-red-500">{errors.images}</p>}
                    </div>

                    <div className="flex justify-end pt-4 gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? "Saving..." : (mode === 'create' ? "Post Listing" : "Update Listing")}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
