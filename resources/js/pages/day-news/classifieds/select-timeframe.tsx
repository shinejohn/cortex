import { Head, router, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, ArrowRight, Calendar, Check, Clock, DollarSign, Info } from "lucide-react";
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

    const getDiscountPercentage = () => {
        if (days >= 30) return 20;
        if (days >= 14) return 10;
        return 0;
    };

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
            <div className="min-h-screen bg-gray-50">
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

                <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    <Button variant="ghost" onClick={() => router.visit(`/classifieds/${classified.id}/select-regions`)} className="mb-6 text-indigo-600 hover:text-indigo-700">
                        <ArrowLeft className="mr-2 size-4" />
                        Back to Regions
                    </Button>

                    <div className="overflow-hidden rounded-lg border-none bg-white shadow-sm">
                        <div className="p-6">
                            <h1 className="mb-2 font-display text-3xl font-black tracking-tight text-gray-900">Select Duration</h1>
                            <p className="mb-6 text-gray-600">Choose how long you want your classified ad to run</p>

                            {/* Ad Summary */}
                            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <h3 className="mb-2 font-medium text-gray-900">Ad Summary</h3>
                                <p className="mb-1 text-gray-700">
                                    <strong>Title:</strong> {classified?.title}
                                </p>
                                <p className="mb-1 text-gray-700">
                                    <strong>Regions:</strong> {regionIds?.length ?? 0}
                                </p>
                            </div>

                            {/* Selected Regions */}
                            {regions.length > 0 && (
                                <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <p className="mb-2 text-sm font-medium text-gray-900">Selected Regions:</p>
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
                                {/* Duration Selection */}
                                <div>
                                    <h3 className="mb-3 font-medium text-gray-900">Select Duration</h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {[7, 14, 30, 60, 90].map((dayOption) => {
                                            const optionSubtotal = baseCostPerDay * dayOption * regionCount;
                                            const optionDiscount = dayOption >= 30 ? optionSubtotal * 0.2 : dayOption >= 14 ? optionSubtotal * 0.1 : 0;
                                            const optionTotal = optionSubtotal - optionDiscount;
                                            const optionDiscountPct = dayOption >= 30 ? 20 : dayOption >= 14 ? 10 : 0;
                                            const isSelected = days === dayOption;

                                            return (
                                                <div
                                                    key={dayOption}
                                                    onClick={() => setDays(dayOption)}
                                                    className={`cursor-pointer rounded-lg border p-4 transition-all ${isSelected ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}
                                                    role="radio"
                                                    aria-checked={isSelected}
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" || e.key === " ") {
                                                            setDays(dayOption);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">
                                                                {dayOption} Day{dayOption > 1 ? "s" : ""}
                                                            </h4>
                                                            {optionDiscountPct > 0 && (
                                                                <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                                                                    Save {optionDiscountPct}%
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className={`flex size-5 items-center justify-center rounded-full border ${isSelected ? "border-indigo-600 bg-indigo-600" : "border-gray-300"}`}>
                                                            {isSelected && <Check className="size-3 text-white" />}
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">
                                                        <span className="font-medium text-gray-900">${optionTotal.toFixed(2)}</span>
                                                        {optionDiscount > 0 && (
                                                            <span className="ml-2 text-sm text-gray-500 line-through">${optionSubtotal.toFixed(2)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Custom Days Input */}
                                <div className="rounded-lg border border-gray-200 bg-white p-6">
                                    <Label htmlFor="days">Or enter custom days</Label>
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
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="size-4" />
                                            <span>Your listing will be active for {days} days</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Date Range Info */}
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <div className="flex items-start">
                                        <Info className="mr-2 mt-0.5 size-5 shrink-0 text-blue-500" />
                                        <div>
                                            <h3 className="mb-1 font-medium text-blue-800">Ad Run Period</h3>
                                            <p className="text-sm text-blue-700">
                                                Your ad will run for <strong>{days} days</strong> across{" "}
                                                <strong>{regionCount} region{regionCount > 1 ? "s" : ""}</strong>
                                            </p>
                                            {getDiscountPercentage() > 0 && (
                                                <p className="mt-1 text-sm text-blue-700">
                                                    You're saving {getDiscountPercentage()}% with your {days}-day plan!
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing Summary */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="mb-3 font-medium text-gray-900">Price Summary</h3>
                                    <div className="mb-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                Base cost ({days} days x {regionCount} regions)
                                            </span>
                                            <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>Discount ({getDiscountPercentage()}%)</span>
                                                <span>-${discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-lg font-medium">
                                            <span className="text-gray-900">Total</span>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="size-5 text-indigo-600" />
                                                <span className="text-indigo-600">${total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button type="button" variant="outline" onClick={() => router.visit("/classifieds")} className="border-gray-300 text-gray-700">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={form.processing} className="bg-indigo-600 text-white hover:bg-indigo-700">
                                        Proceed to Payment
                                        <ArrowRight className="ml-2 size-4" />
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </LocationProvider>
    );
}
