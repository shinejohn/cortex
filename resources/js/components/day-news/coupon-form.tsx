import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
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
    discount_type: "percentage" | "fixed_amount" | "buy_one_get_one" | "free_item";
    valid_from: string;
    valid_until: string;
    category_id: string;
    image: File | null;
    terms: string;
}

interface Props {
    categories: Category[];
    initialData?: {
        id?: number;
        title?: string;
        description?: string;
        code?: string;
        discount_value?: string | number;
        discount_type?: string;
        valid_from?: string;
        valid_until?: string;
        expires_at?: string;
        category_id?: string | number;
        terms?: string;
        terms_conditions?: string;
    };
    mode: "create" | "edit";
}

export function CouponForm({ categories, initialData = {}, mode }: Props) {
    const { data, setData, post, put, processing, errors } = useForm<CouponFormData>({
        title: initialData.title ?? "",
        description: initialData.description ?? "",
        code: initialData.code ?? "",
        discount_value: initialData.discount_value ? String(initialData.discount_value) : "",
        discount_type: (initialData.discount_type as CouponFormData["discount_type"]) ?? "percentage",
        valid_from: initialData.valid_from ?? new Date().toISOString().split("T")[0],
        valid_until: initialData.valid_until ?? initialData.expires_at ?? "",
        category_id: initialData.category_id ? String(initialData.category_id) : "",
        image: null,
        terms: initialData.terms ?? initialData.terms_conditions ?? "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === "edit" && initialData.id) {
            put(route("daynews.coupons.update", { coupon: initialData.id }));
        } else {
            post(route("daynews.coupons.store"));
        }
    };

    const needsDiscountValue = data.discount_type === "percentage" || data.discount_type === "fixed_amount";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-display font-black tracking-tight">Coupon Details</CardTitle>
                    <CardDescription>Enter the basic information about the coupon.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            placeholder="e.g., 20% off your first order"
                            maxLength={255}
                        />
                        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="discount_type">Discount Type *</Label>
                            <Select
                                value={data.discount_type}
                                onValueChange={(val) => setData("discount_type", val as CouponFormData["discount_type"])}
                            >
                                <SelectTrigger id="discount_type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage Off</SelectItem>
                                    <SelectItem value="fixed_amount">Fixed Amount Off</SelectItem>
                                    <SelectItem value="buy_one_get_one">Buy One Get One</SelectItem>
                                    <SelectItem value="free_item">Free Item</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.discount_type && <p className="text-sm text-destructive">{errors.discount_type}</p>}
                        </div>

                        {needsDiscountValue && (
                            <div className="space-y-2">
                                <Label htmlFor="discount_value">{data.discount_type === "percentage" ? "Percentage *" : "Amount *"}</Label>
                                <div className="relative">
                                    <Input
                                        id="discount_value"
                                        type="number"
                                        min="0"
                                        max={data.discount_type === "percentage" ? "100" : undefined}
                                        step="0.01"
                                        value={data.discount_value}
                                        onChange={(e) => setData("discount_value", e.target.value)}
                                        placeholder={data.discount_type === "percentage" ? "20" : "10.00"}
                                        className="pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        {data.discount_type === "percentage" ? "%" : "$"}
                                    </span>
                                </div>
                                {errors.discount_value && <p className="text-sm text-destructive">{errors.discount_value}</p>}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="code">Coupon Code</Label>
                        <Input
                            id="code"
                            value={data.code}
                            onChange={(e) => setData("code", e.target.value.toUpperCase())}
                            placeholder="e.g., SAVE20"
                            maxLength={50}
                            className="font-mono uppercase"
                        />
                        <p className="text-xs text-muted-foreground">Leave empty if no code is required</p>
                        {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category_id">Category *</Label>
                        <Select value={data.category_id} onValueChange={(val) => setData("category_id", val)}>
                            <SelectTrigger id="category_id">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories &&
                                    categories.map((cat) => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        {errors.category_id && <p className="text-sm text-destructive">{errors.category_id}</p>}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-display font-black tracking-tight">Validity Period</CardTitle>
                    <CardDescription>When is this coupon valid?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="valid_from">Valid From *</Label>
                            <Input
                                id="valid_from"
                                type="date"
                                value={data.valid_from}
                                onChange={(e) => setData("valid_from", e.target.value)}
                            />
                            {errors.valid_from && <p className="text-sm text-destructive">{errors.valid_from}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="valid_until">Valid Until</Label>
                            <Input
                                id="valid_until"
                                type="date"
                                value={data.valid_until ? data.valid_until.split("T")[0] : ""}
                                onChange={(e) => setData("valid_until", e.target.value)}
                                min={data.valid_from}
                            />
                            <p className="text-xs text-muted-foreground">Leave empty for no expiration</p>
                            {errors.valid_until && <p className="text-sm text-destructive">{errors.valid_until}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-display font-black tracking-tight">Additional Information</CardTitle>
                    <CardDescription>Add more details about the coupon.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            placeholder="Describe the offer..."
                            rows={3}
                            maxLength={2000}
                        />
                        <p className="text-xs text-muted-foreground text-right">{data.description.length}/2000</p>
                        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="terms">Terms & Conditions</Label>
                        <Textarea
                            id="terms"
                            value={data.terms}
                            onChange={(e) => setData("terms", e.target.value)}
                            placeholder="Any restrictions or conditions..."
                            rows={3}
                            maxLength={2000}
                        />
                        <p className="text-xs text-muted-foreground text-right">{data.terms.length}/2000</p>
                        {errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image">Coupon Image (Optional)</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData("image", e.target.files ? e.target.files[0] : null)}
                        />
                        {errors.image && <p className="text-sm text-destructive">{errors.image}</p>}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {mode === "create" ? "Submit Coupon" : "Update Coupon"}
                </Button>
            </div>
        </form>
    );
}
