import { Head, router, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, ArrowRight, Calendar, DollarSign } from "lucide-react";
import { useState } from "react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface SelectTimeframeProps {
    auth?: Auth;
    classified: {
        id: string;
        title: string;
    };
    regionIds: string[];
    regions: Array<{
        id: string;
        name: string;
    }>;
}

export default function SelectTimeframe() {
    const { auth, classified, regionIds, regions } = usePage<SelectTimeframeProps>().props;
    const [days, setDays] = useState(7);

    const form = useForm({
        days: 7,
    });

    // Calculate cost (simplified - should come from backend)
    const baseCostPerDay = 5;
    const regionCount = regionIds.length;
    const subtotal = baseCostPerDay * days * regionCount;
    const discount = days >= 30 ? subtotal * 0.2 : days >= 14 ? subtotal * 0.1 : 0;
    const total = subtotal - discount;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.setData("days", days);
        form.post(`/classifieds/${classified.id}/timeframe`, {
            onSuccess: () => {
                // Will redirect to Stripe checkout
            },
        });
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title="Select Timeframe - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Select Timeframe - Day News",
                        url: `/classifieds/${classified.id}/select-timeframe`,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <Button variant="ghost" onClick={() => router.visit(`/classifieds/${classified.id}/select-regions`)} className="mb-6">
                        <ArrowLeft className="mr-2 size-4" />
                        Back
                    </Button>

                    <h1 className="mb-6 text-3xl font-bold">Select Duration</h1>
                    <p className="mb-8 text-muted-foreground">How long would you like your listing to be active?</p>

                    {/* Selected Regions */}
                    {regions.length > 0 && (
                        <div className="mb-6 rounded-lg border bg-muted p-4">
                            <p className="mb-2 text-sm font-medium">Selected Regions:</p>
                            <div className="flex flex-wrap gap-2">
                                {regions.map((region) => (
                                    <Badge key={region.id} variant="secondary">
                                        {region.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="rounded-lg border bg-card p-6">
                            <Label htmlFor="days">Number of Days</Label>
                            <div className="mt-2 flex items-center gap-4">
                                <Input
                                    id="days"
                                    type="number"
                                    min="1"
                                    max="90"
                                    value={days}
                                    onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                                    className="w-32"
                                />
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="size-4" />
                                    <span>Your listing will be active for {days} days</span>
                                </div>
                            </div>

                            {/* Quick Select Buttons */}
                            <div className="mt-4 flex gap-2">
                                {[7, 14, 30, 60, 90].map((dayOption) => (
                                    <Button
                                        key={dayOption}
                                        type="button"
                                        variant={days === dayOption ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setDays(dayOption)}
                                    >
                                        {dayOption} days
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Pricing Summary */}
                        <div className="rounded-lg border bg-card p-6">
                            <h3 className="mb-4 font-semibold">Pricing Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>
                                        Base cost ({days} days × {regionCount} regions)
                                    </span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount ({days >= 30 ? "20%" : "10%"})</span>
                                        <span>-${discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="mt-4 flex items-center justify-between border-t pt-4 text-lg font-bold">
                                    <span>Total</span>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="size-5" />
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => router.visit("/classifieds")}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                Proceed to Payment
                                <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </LocationProvider>
    );
}
