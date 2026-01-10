import { Head, router, useForm } from "@inertiajs/react";
import { ArrowLeft, Building, Calendar, Percent, Ticket, Upload } from "lucide-react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface CreateCouponProps {
    auth?: Auth;
}

export default function CreateCoupon({ auth }: CreateCouponProps) {
    const form = useForm({
        title: "",
        description: "",
        discount_type: "percentage",
        discount_value: "",
        terms: "",
        code: "",
        image: null as File | null,
        business_name: "",
        business_id: "",
        business_location: "",
        start_date: "",
        end_date: "",
        usage_limit: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post("/coupons", {
            forceFormData: true,
            onSuccess: () => {
                router.visit("/coupons");
            },
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            form.setData("image", e.target.files[0]);
        }
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title="Create Coupon - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Create Coupon - Day News",
                        description: "Create a coupon or deal",
                        url: "/coupons/create",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <Button variant="ghost" onClick={() => router.visit("/coupons")} className="mb-6">
                        <ArrowLeft className="mr-2 size-4" />
                        Back to Coupons
                    </Button>

                    <div className="mb-6 flex items-center gap-4">
                        <div className="rounded-lg bg-orange-100 p-3">
                            <Ticket className="size-6 text-orange-600" />
                        </div>
                        <h1 className="text-3xl font-bold">Create a Coupon</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-6">
                        {/* Title */}
                        <div>
                            <Label htmlFor="title">Coupon Title *</Label>
                            <Input
                                id="title"
                                value={form.data.title}
                                onChange={(e) => form.setData("title", e.target.value)}
                                placeholder="E.g., '20% Off All Purchases'"
                                required
                            />
                            {form.errors.title && <p className="mt-1 text-sm text-destructive">{form.errors.title}</p>}
                        </div>

                        {/* Business Name */}
                        <div>
                            <Label htmlFor="business_name">Business Name *</Label>
                            <div className="flex items-center">
                                <Building className="mr-2 size-5 text-muted-foreground" />
                                <Input
                                    id="business_name"
                                    value={form.data.business_name}
                                    onChange={(e) => form.setData("business_name", e.target.value)}
                                    placeholder="Enter your business name"
                                    required
                                />
                            </div>
                            {form.errors.business_name && <p className="mt-1 text-sm text-destructive">{form.errors.business_name}</p>}
                        </div>

                        {/* Discount Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="discount_value">Discount Amount *</Label>
                                <div className="flex items-center">
                                    <Percent className="mr-2 size-5 text-muted-foreground" />
                                    <Input
                                        id="discount_value"
                                        type="number"
                                        step="0.01"
                                        value={form.data.discount_value}
                                        onChange={(e) => form.setData("discount_value", e.target.value)}
                                        placeholder="20"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="discount_type">Discount Type *</Label>
                                <Select value={form.data.discount_type} onValueChange={(value) => form.setData("discount_type", value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                        <SelectItem value="fixed_amount">Fixed Amount ($)</SelectItem>
                                        <SelectItem value="buy_one_get_one">Buy One Get One</SelectItem>
                                        <SelectItem value="free_item">Free Item</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={form.data.description}
                                onChange={(e) => form.setData("description", e.target.value)}
                                placeholder="Describe the coupon offer..."
                                rows={4}
                            />
                        </div>

                        {/* Terms */}
                        <div>
                            <Label htmlFor="terms">Terms & Conditions</Label>
                            <Textarea
                                id="terms"
                                value={form.data.terms}
                                onChange={(e) => form.setData("terms", e.target.value)}
                                placeholder="e.g., Valid for new customers only, Cannot be combined with other offers..."
                                rows={3}
                            />
                        </div>

                        {/* Validity Period */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="start_date">Valid From *</Label>
                                <div className="flex items-center">
                                    <Calendar className="mr-2 size-5 text-muted-foreground" />
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={form.data.start_date}
                                        onChange={(e) => form.setData("start_date", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="end_date">Valid Until *</Label>
                                <div className="flex items-center">
                                    <Calendar className="mr-2 size-5 text-muted-foreground" />
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={form.data.end_date}
                                        onChange={(e) => form.setData("end_date", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Business Location */}
                        <div>
                            <Label htmlFor="business_location">Business Location</Label>
                            <Input
                                id="business_location"
                                value={form.data.business_location}
                                onChange={(e) => form.setData("business_location", e.target.value)}
                                placeholder="e.g., 123 Main St, Clearwater, FL"
                            />
                        </div>

                        {/* Usage Limit */}
                        <div>
                            <Label htmlFor="usage_limit">Usage Limit (optional)</Label>
                            <Input
                                id="usage_limit"
                                type="number"
                                value={form.data.usage_limit}
                                onChange={(e) => form.setData("usage_limit", e.target.value)}
                                placeholder="Leave blank for unlimited"
                            />
                        </div>

                        {/* Coupon Code */}
                        <div>
                            <Label htmlFor="code">Coupon Code (optional)</Label>
                            <Input
                                id="code"
                                value={form.data.code}
                                onChange={(e) => form.setData("code", e.target.value.toUpperCase())}
                                placeholder="Leave blank to auto-generate"
                                maxLength={20}
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <Label htmlFor="image">Image (optional)</Label>
                            <div className="mt-2">
                                <label htmlFor="image-upload" className="flex cursor-pointer items-center gap-2 rounded-lg border p-4 hover:bg-muted">
                                    <Upload className="size-5" />
                                    <span>{form.data.image ? form.data.image.name : "Upload Image"}</span>
                                    <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>
                                {form.data.image && (
                                    <img
                                        src={URL.createObjectURL(form.data.image)}
                                        alt="Preview"
                                        className="mt-4 h-32 w-32 rounded-lg object-cover"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => router.visit("/coupons")}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? "Publishing..." : "Publish Coupon"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </LocationProvider>
    );
}
