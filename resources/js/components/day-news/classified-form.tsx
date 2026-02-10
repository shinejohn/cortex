import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { router } from "@inertiajs/react";
import axios from "axios";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { route } from "ziggy-js";

interface Category {
    id: number;
    name: string;
    children?: Category[];
}

interface Condition {
    value: string;
    label: string;
}

interface PriceType {
    value: string;
    label: string;
}

interface ClassifiedSpecification {
    id: string;
    key: string;
    name: string;
    type: string;
    is_required: boolean;
    options?: string[];
}

interface CustomAttribute {
    key: string;
    value: string;
}

interface ClassifiedImage {
    id: string;
    url: string;
}

interface ExistingImage {
    id: string;
    url: string;
}

interface Props {
    categories: Category[];
    conditions: Condition[];
    priceTypes: PriceType[];
    initialData?: {
        id?: string;
        title?: string;
        description?: string;
        price?: number;
        price_type?: string;
        condition?: string;
        contact_email?: string;
        contact_phone?: string;
        category_id?: string;
        classified_category_id?: string;
        images?: ClassifiedImage[];
        region_ids?: string[];
        location?: string;
        specifications?: Record<string, string>;
        custom_attributes?: CustomAttribute[];
    };
    categorySpecifications?: ClassifiedSpecification[];
    mode: "create" | "edit";
}

export function ClassifiedForm({
    categories,
    conditions,
    priceTypes,
    initialData,
    categorySpecifications: initialCategorySpecifications,
    mode,
}: Props) {
    // Form state
    const [title, setTitle] = useState(initialData?.title ?? "");
    const [description, setDescription] = useState(initialData?.description ?? "");
    const [categoryId, setCategoryId] = useState(initialData?.classified_category_id ?? initialData?.category_id ?? "");
    const [price, setPrice] = useState(initialData?.price?.toString() ?? "");
    const [priceType, setPriceType] = useState(initialData?.price_type ?? "fixed");
    const [condition, setCondition] = useState(initialData?.condition ?? "");
    const [contactEmail, setContactEmail] = useState(initialData?.contact_email ?? "");
    const [contactPhone, setContactPhone] = useState(initialData?.contact_phone ?? "");
    const [location, setLocation] = useState(initialData?.location ?? "");
    const [specifications, setSpecifications] = useState<Record<string, string>>(initialData?.specifications ?? {});
    const [customAttributes, setCustomAttributes] = useState<CustomAttribute[]>(
        initialData?.custom_attributes ?? [{ key: "", value: "" }],
    );

    // Image handling
    const [existingImages, setExistingImages] = useState<ExistingImage[]>(
        initialData?.images?.map((img) => ({ id: img.id, url: img.url })) ?? [],
    );
    const [deleteImageIds, setDeleteImageIds] = useState<string[]>([]);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

    // Category specifications
    const [categorySpecifications, setCategorySpecifications] = useState<ClassifiedSpecification[]>(
        initialCategorySpecifications ?? [],
    );
    const [loadingSpecs, setLoadingSpecs] = useState(false);

    // Form state
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Flatten categories for select
    const flatCategories: Array<{ id: string | number; name: string; isParent: boolean }> = [];
    categories.forEach((cat) => {
        flatCategories.push({ id: cat.id, name: cat.name, isParent: true });
        cat.children?.forEach((child) => {
            flatCategories.push({ id: child.id, name: `\u2014 ${child.name}`, isParent: false });
        });
    });

    // Fetch specifications when category changes
    useEffect(() => {
        if (!categoryId) {
            setCategorySpecifications([]);
            return;
        }

        const fetchSpecifications = async () => {
            setLoadingSpecs(true);
            try {
                const response = await axios.get(
                    route("daynews.api.classified-categories.specifications", { category: categoryId }),
                );
                setCategorySpecifications(response.data.specifications ?? []);
                const newSpecs: Record<string, string> = { ...specifications };
                (response.data.specifications ?? []).forEach((spec: ClassifiedSpecification) => {
                    if (!(spec.key in newSpecs)) {
                        newSpecs[spec.key] = "";
                    }
                });
                setSpecifications(newSpecs);
            } catch (err) {
                console.error("Failed to load specifications:", err);
            } finally {
                setLoadingSpecs(false);
            }
        };

        if (mode === "create" || categoryId !== (initialData?.classified_category_id ?? initialData?.category_id)) {
            fetchSpecifications();
        }
    }, [categoryId]);

    const remainingExistingCount = existingImages.length - deleteImageIds.length;
    const maxNewFiles = Math.max(0, 10 - remainingExistingCount);

    const handleExistingImageRemove = (imageId: string) => {
        setDeleteImageIds((prev) => [...prev, imageId]);
    };

    const handleSpecificationChange = (key: string, value: string) => {
        setSpecifications((prev) => ({ ...prev, [key]: value }));
    };

    const handleCustomAttributeChange = (index: number, field: "key" | "value", value: string) => {
        setCustomAttributes((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleAddCustomAttribute = () => {
        if (customAttributes.length < 10) {
            setCustomAttributes((prev) => [...prev, { key: "", value: "" }]);
        }
    };

    const handleRemoveCustomAttribute = (index: number) => {
        setCustomAttributes((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        formData.append("title", title);
        formData.append("classified_category_id", String(categoryId));
        formData.append("description", description);
        formData.append("price_type", priceType);

        if (price && (priceType === "fixed" || priceType === "negotiable")) {
            formData.append("price", price);
        }
        if (condition) formData.append("condition", condition);
        if (contactEmail) formData.append("contact_email", contactEmail);
        if (contactPhone) formData.append("contact_phone", contactPhone);
        if (location) formData.append("location", location);

        newImageFiles.forEach((file, i) => {
            formData.append(`images[${i}]`, file);
        });

        if (mode === "edit") {
            deleteImageIds.forEach((id, i) => {
                formData.append(`delete_image_ids[${i}]`, id);
            });
        }

        Object.entries(specifications).forEach(([key, value]) => {
            if (value) formData.append(`specifications[${key}]`, value);
        });

        const validCustomAttrs = customAttributes.filter((attr) => attr.key.trim() && attr.value.trim());
        validCustomAttrs.forEach((attr, i) => {
            formData.append(`custom_attributes[${i}][key]`, attr.key);
            formData.append(`custom_attributes[${i}][value]`, attr.value);
        });

        try {
            if (mode === "edit" && initialData?.id) {
                formData.append("_method", "PUT");
                const response = await axios.post(
                    route("daynews.classifieds.update", { classified: initialData.id }),
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } },
                );
                toast.success("Your listing has been updated!");
                router.visit(route("daynews.classifieds.show", { slug: response.data.classified.slug }));
            } else {
                const response = await axios.post(route("daynews.classifieds.store"), formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success("Your listing has been created!");
                router.visit(route("daynews.classifieds.show", { slug: response.data.classified.slug }));
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response?.status === 422) {
                const validationErrors = err.response.data.errors as Record<string, string[]>;
                const flatErrors: Record<string, string> = {};
                const errorMessages: string[] = [];
                Object.entries(validationErrors).forEach(([key, messages]) => {
                    flatErrors[key] = messages[0];
                    errorMessages.push(messages[0]);
                });
                setErrors(flatErrors);
                if (errorMessages.length > 0) toast.error(errorMessages[0]);
            } else {
                console.error("Failed to submit:", err);
                toast.error("Something went wrong. Please try again.");
            }
        } finally {
            setProcessing(false);
        }
    };

    const needsPrice = priceType === "fixed" || priceType === "negotiable";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-display font-black tracking-tight">Listing Details</CardTitle>
                    <CardDescription>Enter the basic information about your item.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., 2020 Honda Civic EX"
                            maxLength={255}
                        />
                        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select value={String(categoryId)} onValueChange={(val) => setCategoryId(val)}>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {flatCategories.map((cat) => (
                                    <SelectItem
                                        key={cat.id}
                                        value={String(cat.id)}
                                        disabled={cat.isParent}
                                        className={cat.isParent ? "font-semibold" : ""}
                                    >
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.classified_category_id && (
                            <p className="text-sm text-destructive">{errors.classified_category_id}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your item in detail..."
                            rows={5}
                            maxLength={5000}
                        />
                        <p className="text-xs text-muted-foreground text-right">{description.length}/5000</p>
                        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="price_type">Price Type *</Label>
                            <Select value={priceType} onValueChange={setPriceType}>
                                <SelectTrigger id="price_type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {priceTypes.map((pt) => (
                                        <SelectItem key={pt.value} value={pt.value}>
                                            {pt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.price_type && <p className="text-sm text-destructive">{errors.price_type}</p>}
                        </div>

                        {needsPrice && (
                            <div className="space-y-2">
                                <Label htmlFor="price">Price *</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                    <Input
                                        id="price"
                                        type="number"
                                        min="0"
                                        max="9999999.99"
                                        step="0.01"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        className="pl-7"
                                    />
                                </div>
                                {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="condition">Condition</Label>
                        <Select value={condition} onValueChange={setCondition}>
                            <SelectTrigger id="condition">
                                <SelectValue placeholder="Select condition (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                {conditions.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>
                                        {c.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.condition && <p className="text-sm text-destructive">{errors.condition}</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Images */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-display font-black tracking-tight">Photos</CardTitle>
                    <CardDescription>Add up to 10 photos. The first image will be your main photo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {existingImages.length > 0 && (
                        <div className="space-y-2">
                            <Label>Current Photos</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {existingImages.map((image, index) => {
                                    const isMarkedForDeletion = deleteImageIds.includes(image.id);
                                    return (
                                        <div
                                            key={image.id}
                                            className={`relative aspect-square group ${isMarkedForDeletion ? "opacity-40" : ""}`}
                                        >
                                            <img
                                                src={image.url}
                                                alt={`Photo ${index + 1}`}
                                                className="w-full h-full object-cover rounded-lg border"
                                            />
                                            {index === 0 && !isMarkedForDeletion && (
                                                <Badge className="absolute top-1 left-1 text-xs">Main</Badge>
                                            )}
                                            {isMarkedForDeletion ? (
                                                <Badge variant="destructive" className="absolute top-1 right-1 text-xs">
                                                    Will be deleted
                                                </Badge>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleExistingImageRemove(image.id)}
                                                >
                                                    <X className="size-3" />
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {maxNewFiles > 0 && (
                        <div className="space-y-2">
                            <Label htmlFor="images">{existingImages.length > 0 ? "Add New Photos" : "Upload Photos"}</Label>
                            <Input
                                id="images"
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                multiple
                                onChange={(e) => setNewImageFiles(e.target.files ? Array.from(e.target.files).slice(0, maxNewFiles) : [])}
                            />
                        </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                        {remainingExistingCount + newImageFiles.length}/10 photos -- JPEG, PNG, or WebP -- Max 5MB each
                    </p>
                    {errors.images && <p className="text-sm text-destructive">{errors.images}</p>}
                </CardContent>
            </Card>

            {/* Category Specifications */}
            {categoryId && categorySpecifications.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-display font-black tracking-tight">Specifications</CardTitle>
                        <CardDescription>Fill in the details specific to this category.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingSpecs ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {categorySpecifications.map((spec) => (
                                    <div key={spec.id} className="space-y-2">
                                        <Label htmlFor={`spec-${spec.key}`}>
                                            {spec.name}
                                            {spec.is_required && " *"}
                                        </Label>
                                        {spec.type === "select" && spec.options ? (
                                            <Select
                                                value={specifications[spec.key] ?? ""}
                                                onValueChange={(v) => handleSpecificationChange(spec.key, v)}
                                            >
                                                <SelectTrigger id={`spec-${spec.key}`}>
                                                    <SelectValue placeholder={`Select ${spec.name.toLowerCase()}`} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {spec.options.map((opt) => (
                                                        <SelectItem key={opt} value={opt}>
                                                            {opt}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : spec.type === "boolean" ? (
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`spec-${spec.key}`}
                                                    checked={specifications[spec.key] === "true"}
                                                    onCheckedChange={(checked) =>
                                                        handleSpecificationChange(spec.key, checked ? "true" : "false")
                                                    }
                                                />
                                                <Label htmlFor={`spec-${spec.key}`} className="text-sm font-normal">
                                                    Yes
                                                </Label>
                                            </div>
                                        ) : (
                                            <Input
                                                id={`spec-${spec.key}`}
                                                type={spec.type === "number" ? "number" : "text"}
                                                value={specifications[spec.key] ?? ""}
                                                onChange={(e) => handleSpecificationChange(spec.key, e.target.value)}
                                                placeholder={`Enter ${spec.name.toLowerCase()}`}
                                            />
                                        )}
                                        {errors[`specifications.${spec.key}`] && (
                                            <p className="text-sm text-destructive">{errors[`specifications.${spec.key}`]}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Custom Attributes */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-display font-black tracking-tight">Additional Details</CardTitle>
                    <CardDescription>Add any other relevant information about your item.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {customAttributes.map((attr, index) => (
                        <div key={index} className="flex gap-2 items-start">
                            <div className="flex-1 space-y-1">
                                <Input
                                    placeholder="Attribute name (e.g., Color)"
                                    value={attr.key}
                                    onChange={(e) => handleCustomAttributeChange(index, "key", e.target.value)}
                                    maxLength={100}
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <Input
                                    placeholder="Value (e.g., Blue)"
                                    value={attr.value}
                                    onChange={(e) => handleCustomAttributeChange(index, "value", e.target.value)}
                                    maxLength={500}
                                />
                            </div>
                            {customAttributes.length > 1 && (
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveCustomAttribute(index)}>
                                    <Trash2 className="size-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    {customAttributes.length < 10 && (
                        <Button type="button" variant="outline" size="sm" onClick={handleAddCustomAttribute}>
                            <Plus className="size-4 mr-1" />
                            Add More Details
                        </Button>
                    )}
                    {errors.custom_attributes && <p className="text-sm text-destructive">{errors.custom_attributes}</p>}
                </CardContent>
            </Card>

            {/* Location */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-display font-black tracking-tight">Location</CardTitle>
                    <CardDescription>Enter the location for your listing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="location">City/Neighborhood</Label>
                        <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. Downtown"
                        />
                        {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-display font-black tracking-tight">Contact Information</CardTitle>
                    <CardDescription>
                        Provide at least one way for buyers to reach you. This info is only shown to logged-in users.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="contact_email">Email</Label>
                            <Input
                                id="contact_email"
                                type="email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                placeholder="your@email.com"
                            />
                            {errors.contact_email && <p className="text-sm text-destructive">{errors.contact_email}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact_phone">Phone</Label>
                            <Input
                                id="contact_phone"
                                type="tel"
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                                placeholder="(555) 123-4567"
                                maxLength={20}
                            />
                            {errors.contact_phone && <p className="text-sm text-destructive">{errors.contact_phone}</p>}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">At least one contact method is required.</p>
                </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {mode === "create" ? "Post Listing" : "Update Listing"}
                </Button>
            </div>
        </form>
    );
}
