import DowntownGuideLayout from "@/layouts/downtown-guide-layout";
import { Head, useForm } from "@inertiajs/react";
import { Auth } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { route } from "ziggy-js";

interface CouponCreateProps {
    auth: Auth;
}

export default function CouponCreate({ auth }: CouponCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        description: "",
        code: "",
        discount_type: "percentage",
        discount_value: "",
        valid_from: "",
        valid_until: "",
        usage_limit: "",
        terms: "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('downtown-guide.dashboard.coupons.store'));
    };

    return (
        <DowntownGuideLayout
            auth={auth}
            seo={{
                title: "Create Coupon",
                description: "Create a new coupon or deal",
            }}
        >
            <Head title="Create Coupon" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-xl font-semibold mb-6">Create New Coupon</h2>

                            <form onSubmit={submit} className="space-y-6 max-w-2xl">
                                <div>
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData("title", e.target.value)}
                                        placeholder="e.g., Summer Sale 20% Off"
                                        required
                                    />
                                    {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                                </div>

                                <div>
                                    <Label htmlFor="code">Coupon Code</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData("code", e.target.value.toUpperCase())}
                                        placeholder="SUMMER20"
                                        required
                                    />
                                    {errors.code && <div className="text-red-500 text-sm mt-1">{errors.code}</div>}
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData("description", e.target.value)}
                                        rows={3}
                                        required
                                    />
                                    {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="discount_type">Discount Type</Label>
                                        <Select
                                            value={data.discount_type}
                                            onValueChange={(value) => setData("discount_type", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                                                <SelectItem value="offer">Special Offer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.discount_type && <div className="text-red-500 text-sm mt-1">{errors.discount_type}</div>}
                                    </div>
                                    <div>
                                        <Label htmlFor="discount_value">Value</Label>
                                        <Input
                                            id="discount_value"
                                            type="number"
                                            value={data.discount_value}
                                            onChange={(e) => setData("discount_value", e.target.value)}
                                            placeholder={data.discount_type === 'percentage' ? "20" : "10.00"}
                                            disabled={data.discount_type === 'offer'}
                                        />
                                        {errors.discount_value && <div className="text-red-500 text-sm mt-1">{errors.discount_value}</div>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="valid_from">Valid From</Label>
                                        <Input
                                            id="valid_from"
                                            type="date"
                                            value={data.valid_from}
                                            onChange={(e) => setData("valid_from", e.target.value)}
                                        />
                                        {errors.valid_from && <div className="text-red-500 text-sm mt-1">{errors.valid_from}</div>}
                                    </div>
                                    <div>
                                        <Label htmlFor="valid_until">Valid Until</Label>
                                        <Input
                                            id="valid_until"
                                            type="date"
                                            value={data.valid_until}
                                            onChange={(e) => setData("valid_until", e.target.value)}
                                        />
                                        {errors.valid_until && <div className="text-red-500 text-sm mt-1">{errors.valid_until}</div>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="usage_limit">Usage Limit (Optional)</Label>
                                    <Input
                                        id="usage_limit"
                                        type="number"
                                        value={data.usage_limit}
                                        onChange={(e) => setData("usage_limit", e.target.value)}
                                        placeholder="e.g., 100"
                                    />
                                    {errors.usage_limit && <div className="text-red-500 text-sm mt-1">{errors.usage_limit}</div>}
                                </div>

                                <div>
                                    <Label htmlFor="terms">Terms & Conditions</Label>
                                    <Textarea
                                        id="terms"
                                        value={data.terms}
                                        onChange={(e) => setData("terms", e.target.value)}
                                        rows={3}
                                        placeholder="e.g., One per customer. Cannot be combined with other offers."
                                    />
                                    {errors.terms && <div className="text-red-500 text-sm mt-1">{errors.terms}</div>}
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <Button variant="outline" type="button" onClick={() => window.history.back()}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        Create Coupon
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </DowntownGuideLayout>
    );
}
