import { Footer } from "@/components/common/footer";
import Header from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Auth } from "@/types";
import { Head, Link, useForm } from "@inertiajs/react";
import { ImagePlus, Loader2, Package, X } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    compare_at_price: number | null;
    images: string[] | null;
    quantity: number | null;
    track_inventory: boolean;
    sku: string | null;
    is_active: boolean;
    is_featured: boolean;
}

interface Store {
    id: string;
    name: string;
    slug: string;
    workspace: {
        can_accept_payments: boolean;
    };
}

interface EditProductProps {
    auth: Auth;
    product: Product;
    store: Store;
}

export default function EditProduct({ auth, product, store }: EditProductProps) {
    const [imagePreviews, setImagePreviews] = useState<string[]>(
        product.images?.map((img) => `/storage/${img}`) || []
    );
    const [removedImages, setRemovedImages] = useState<string[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        name: product.name,
        description: product.description || "",
        images: [] as File[],
        price: product.price.toString(),
        compare_at_price: product.compare_at_price?.toString() || "",
        quantity: product.quantity?.toString() || "0",
        track_inventory: product.track_inventory,
        sku: product.sku || "",
        is_active: product.is_active,
        is_featured: product.is_featured,
        _method: "PATCH",
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const currentImages = data.images || [];
        const existingCount = imagePreviews.length - removedImages.length;
        const newImages = [...currentImages, ...files].slice(0, 5 - existingCount);

        setData("images", newImages);

        // Generate previews for new images only
        const previews: string[] = [];
        newImages.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                previews.push(reader.result as string);
                if (previews.length === newImages.length) {
                    setImagePreviews([...imagePreviews, ...previews]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeExistingImage = (index: number, imagePath: string) => {
        setRemovedImages([...removedImages, imagePath]);
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index: number) => {
        const newImages = data.images.filter((_, i) => i !== index - (product.images?.length || 0));
        setData("images", newImages);
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("products.update", { store: store.id, product: product.id }));
    };

    return (
        <>
            <Head title={`Edit ${product.name}`} />

            <Header auth={auth} />

            {/* Page Header */}
            <div className="py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
                <div className="max-w-4xl mx-auto px-3 sm:px-4">
                    <div className="flex items-center gap-2">
                        <Package className="h-8 w-8 text-primary" />
                        <h1 className="text-4xl font-bold text-foreground">Edit Product</h1>
                    </div>
                    <p className="text-lg text-muted-foreground mt-2">{store.name}</p>
                </div>
            </div>

            {/* Form */}
            <div className="py-8">
                <div className="max-w-4xl mx-auto px-3 sm:px-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Information</CardTitle>
                                <CardDescription>Update product details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Product Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        placeholder="Amazing Product"
                                        disabled={processing}
                                        className={errors.name ? "border-destructive" : ""}
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData("description", e.target.value)}
                                        placeholder="Describe your product..."
                                        rows={4}
                                        disabled={processing}
                                        className={errors.description ? "border-destructive" : ""}
                                    />
                                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                                </div>

                                {/* SKU */}
                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU (Optional)</Label>
                                    <Input
                                        id="sku"
                                        value={data.sku}
                                        onChange={(e) => setData("sku", e.target.value)}
                                        placeholder="PRODUCT-SKU-001"
                                        disabled={processing}
                                        className={errors.sku ? "border-destructive" : ""}
                                    />
                                    {errors.sku && <p className="text-sm text-destructive">{errors.sku}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing</CardTitle>
                                <CardDescription>Update product pricing</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {!store.workspace.can_accept_payments && (
                                    <div className="rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4">
                                        <p className="text-sm text-amber-800 dark:text-amber-200">
                                            <strong>Payment restrictions:</strong> Your workspace must be approved for Stripe Connect to set paid pricing. Only free products (price = $0.00) are allowed until approval. Contact support for approval.
                                        </p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Price */}
                                    <div className="space-y-2">
                                        <Label htmlFor="price">
                                            Price <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max={!store.workspace.can_accept_payments ? "0" : undefined}
                                            value={data.price}
                                            onChange={(e) => setData("price", e.target.value)}
                                            placeholder={!store.workspace.can_accept_payments ? "0.00" : "29.99"}
                                            disabled={processing}
                                            className={errors.price ? "border-destructive" : ""}
                                        />
                                        {!store.workspace.can_accept_payments && (
                                            <p className="text-xs text-muted-foreground">Must be $0.00 (free) until workspace is approved</p>
                                        )}
                                        {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                                    </div>

                                    {/* Compare at Price */}
                                    <div className="space-y-2">
                                        <Label htmlFor="compare_at_price">Compare at Price (Optional)</Label>
                                        <Input
                                            id="compare_at_price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.compare_at_price}
                                            onChange={(e) => setData("compare_at_price", e.target.value)}
                                            placeholder="39.99"
                                            disabled={processing || !store.workspace.can_accept_payments}
                                            className={errors.compare_at_price ? "border-destructive" : ""}
                                        />
                                        {errors.compare_at_price && <p className="text-sm text-destructive">{errors.compare_at_price}</p>}
                                        <p className="text-xs text-muted-foreground">Original price to show discount</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory</CardTitle>
                                <CardDescription>Manage product inventory</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Quantity */}
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">
                                        Quantity <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="0"
                                        value={data.quantity}
                                        onChange={(e) => setData("quantity", e.target.value)}
                                        placeholder="100"
                                        disabled={processing}
                                        className={errors.quantity ? "border-destructive" : ""}
                                    />
                                    {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
                                </div>

                                {/* Track Inventory */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="track_inventory"
                                        checked={data.track_inventory}
                                        onCheckedChange={(checked) => setData("track_inventory", checked as boolean)}
                                        disabled={processing}
                                    />
                                    <Label htmlFor="track_inventory" className="cursor-pointer">
                                        Track inventory
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Product Images</CardTitle>
                                <CardDescription>Update product images (up to 5 total)</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Image Previews */}
                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-5 gap-4">
                                        {imagePreviews.map((preview, index) => {
                                            const isExisting = index < (product.images?.length || 0);
                                            const imagePath = isExisting ? product.images![index] : "";

                                            return (
                                                <div
                                                    key={index}
                                                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-border"
                                                >
                                                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-1 right-1 h-6 w-6"
                                                        onClick={() =>
                                                            isExisting ? removeExistingImage(index, imagePath) : removeNewImage(index)
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Upload Input */}
                                {imagePreviews.length < 5 && (
                                    <div>
                                        <Input
                                            id="images"
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                            multiple
                                            onChange={handleImageChange}
                                            disabled={processing}
                                            className={errors.images ? "border-destructive" : ""}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Max 5 images total, up to 5MB each. Formats: JPEG, PNG, GIF, WebP
                                        </p>
                                        {errors.images && <p className="text-sm text-destructive mt-1">{errors.images}</p>}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Product Status</CardTitle>
                                <CardDescription>Control product visibility</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Is Active */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData("is_active", checked as boolean)}
                                        disabled={processing}
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer">
                                        Active (visible in store)
                                    </Label>
                                </div>

                                {/* Is Featured */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_featured"
                                        checked={data.is_featured}
                                        onCheckedChange={(checked) => setData("is_featured", checked as boolean)}
                                        disabled={processing}
                                    />
                                    <Label htmlFor="is_featured" className="cursor-pointer">
                                        Featured product
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit */}
                        <div className="flex items-center justify-between">
                            <Link href={route("stores.show", store.slug)}>
                                <Button type="button" variant="outline" disabled={processing}>
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            <Footer />
        </>
    );
}
