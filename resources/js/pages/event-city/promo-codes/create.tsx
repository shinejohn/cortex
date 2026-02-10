import { Head, Link, useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import FormLayout from "@/layouts/form-layout";

export default function CreatePromoCode() {
    const { data, setData, post, processing, errors } = useForm({
        code: "",
        description: "",
        type: "percentage",
        value: "",
        min_purchase: "",
        max_discount: "",
        usage_limit: "",
        is_active: true,
        starts_at: "",
        expires_at: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("promo-codes.store") as string);
    };

    return (
        <FormLayout
            title="Create Promo Code"
            description="Create a new discount code for your events"
            backHref={route("promo-codes.index") as string}
            backLabel="Back to Promo Codes"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle>Code Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="code">Promo Code</Label>
                            <Input
                                id="code"
                                value={data.code}
                                onChange={(e) => setData("code", e.target.value.toUpperCase())}
                                placeholder="Leave blank to auto-generate"
                                className="mt-1 font-mono"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">Leave blank to auto-generate a unique code.</p>
                            {errors.code && <p className="mt-1 text-sm text-destructive">{errors.code}</p>}
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData("description", e.target.value)}
                                rows={2}
                                className="mt-1"
                                placeholder="Internal description for this promo code"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle>Discount</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Discount Type *</Label>
                                <Select value={data.type} onValueChange={(v) => setData("type", v)}>
                                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="mt-1 text-sm text-destructive">{errors.type}</p>}
                            </div>
                            <div>
                                <Label htmlFor="value">Value *</Label>
                                <Input
                                    id="value"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.value}
                                    onChange={(e) => setData("value", e.target.value)}
                                    className="mt-1"
                                    placeholder={data.type === "percentage" ? "e.g., 15" : "e.g., 10.00"}
                                />
                                {errors.value && <p className="mt-1 text-sm text-destructive">{errors.value}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="min_purchase">Min. Purchase Amount</Label>
                                <Input id="min_purchase" type="number" step="0.01" min="0" value={data.min_purchase} onChange={(e) => setData("min_purchase", e.target.value)} className="mt-1" placeholder="0.00" />
                            </div>
                            <div>
                                <Label htmlFor="max_discount">Max Discount Amount</Label>
                                <Input id="max_discount" type="number" step="0.01" min="0" value={data.max_discount} onChange={(e) => setData("max_discount", e.target.value)} className="mt-1" placeholder="No limit" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle>Limits & Schedule</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="usage_limit">Usage Limit</Label>
                            <Input id="usage_limit" type="number" min="1" value={data.usage_limit} onChange={(e) => setData("usage_limit", e.target.value)} className="mt-1" placeholder="Unlimited" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="starts_at">Start Date</Label>
                                <Input id="starts_at" type="datetime-local" value={data.starts_at} onChange={(e) => setData("starts_at", e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="expires_at">Expiry Date</Label>
                                <Input id="expires_at" type="datetime-local" value={data.expires_at} onChange={(e) => setData("expires_at", e.target.value)} className="mt-1" />
                                {errors.expires_at && <p className="mt-1 text-sm text-destructive">{errors.expires_at}</p>}
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData("is_active", !!checked)} />
                            <Label htmlFor="is_active" className="cursor-pointer">Active immediately</Label>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" asChild>
                        <Link href={route("promo-codes.index") as string}>Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? "Creating..." : "Create Promo Code"}
                    </Button>
                </div>
            </form>
        </FormLayout>
    );
}
