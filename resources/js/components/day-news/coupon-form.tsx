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

interface CouponFormData {
    title: string;
    description: string;
    code: string;
    discount_value: string;
    discount_type: "percentage" | "fixed_amount";
    expires_at: string;
    category_id: string;
    image: File | null;
    terms: string | null;
}

interface Props {
    categories: Category[];
    initialData?: any; // Avoiding strict type dependency since coupon.ts is missing
    mode: "create" | "edit";
}

export function CouponForm({ categories, initialData = {}, mode }: Props) {
    const { data, setData, post, processing, errors } = useForm<CouponFormData>({
        title: initialData.title || "",
        description: initialData.description || "",
        code: initialData.code || "",
        discount_value: initialData.discount_value || "",
        discount_type: initialData.discount_type || "percentage",
        expires_at: initialData.expires_at || "",
        category_id: initialData.category_id ? String(initialData.category_id) : "",
        image: null,
        terms: initialData.terms || "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (mode === "create") {
            post(route("daynews.coupons.store"));
        } else {
            // Use POST with _method="put" for file uploads during update
            // Assuming initialData contains the ID
            post(route("daynews.coupons.update", initialData.id), {
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
                    <CardTitle>Coupon Details</CardTitle>
                    <CardDescription>
                        {mode === "create" ? "Create a new coupon" : "Edit existing coupon"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Coupon Title</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            placeholder="e.g. 50% Off Pizza"
                            required
                        />
                        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            placeholder="Details about the offer..."
                            required
                        />
                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                    </div>

                    {/* Code */}
                    <div className="space-y-2">
                        <Label htmlFor="code">Coupon Code</Label>
                        <Input
                            id="code"
                            value={data.code}
                            onChange={(e) => setData("code", e.target.value)}
                            placeholder="e.g. SAVE50"
                            required
                        />
                        {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
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

                    {/* Discount */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="discount_type">Discount Type</Label>
                            <Select
                                value={data.discount_type}
                                onValueChange={(val: "percentage" | "fixed_amount") => setData("discount_type", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                    <SelectItem value="fixed_amount">Fixed Amount ($)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.discount_type && <p className="text-sm text-red-500">{errors.discount_type}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="discount_value">Discount Value</Label>
                            <Input
                                id="discount_value"
                                type="number"
                                step="0.01"
                                value={data.discount_value}
                                onChange={(e) => setData("discount_value", e.target.value)}
                                placeholder="e.g. 50 or 10.00"
                                required
                            />
                            {errors.discount_value && <p className="text-sm text-red-500">{errors.discount_value}</p>}
                        </div>
                    </div>

                    {/* Expiry */}
                    <div className="space-y-2">
                        <Label htmlFor="expires_at">Expiration Date</Label>
                        <Input
                            id="expires_at"
                            type="date"
                            value={data.expires_at ? data.expires_at.split('T')[0] : ''}
                            onChange={(e) => setData("expires_at", e.target.value)}
                            required
                        />
                        {errors.expires_at && <p className="text-sm text-red-500">{errors.expires_at}</p>}
                    </div>

                    {/* Terms */}
                    <div className="space-y-2">
                        <Label htmlFor="terms">Terms & Conditions (Optional)</Label>
                        <Textarea
                            id="terms"
                            value={data.terms || ""}
                            onChange={(e) => setData("terms", e.target.value)}
                            placeholder="e.g. Valid only on weekdays..."
                        />
                        {errors.terms && <p className="text-sm text-red-500">{errors.terms}</p>}
                    </div>

                    {/* Image */}
                    <div className="space-y-2">
                        <Label htmlFor="image">Coupon Image (Optional)</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData("image", e.target.files ? e.target.files[0] : null)}
                        />
                        {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
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
                            {processing ? "Saving..." : (mode === 'create' ? "Create Coupon" : "Update Coupon")}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
