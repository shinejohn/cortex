import { Head, router, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, ArrowRight, Info, MapPin } from "lucide-react";
import { useState } from "react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface Region {
    id: string;
    name: string;
    type: string;
    full_name: string;
}

interface SelectRegionsProps {
    auth?: Auth;
    classified: {
        id: string;
        title: string;
    };
    regions: Region[];
    currentRegion?: Region | null;
}

export default function SelectRegions() {
    const { auth, classified, regions, currentRegion } = usePage<SelectRegionsProps>().props;
    const [selectedRegions, setSelectedRegions] = useState<string[]>(currentRegion ? [currentRegion.id] : []);

    const form = useForm({
        region_ids: [] as string[],
    });

    const handleRegionToggle = (regionId: string) => {
        setSelectedRegions((prev) => (prev.includes(regionId) ? prev.filter((id) => id !== regionId) : [...prev, regionId]));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.setData("region_ids", selectedRegions);
        form.post(`/classifieds/${classified.id}/regions`, {
            onSuccess: () => {
                router.visit(`/classifieds/${classified.id}/select-timeframe`);
            },
        });
    };

    const availableRegions = regions;

    return (
        <LocationProvider>
            <div className="min-h-screen bg-gray-50">
                <Head title="Select Regions - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Select Regions - Day News",
                        url: `/classifieds/${classified.id}/select-regions`,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.visit(`/classifieds/${classified.id}`)}
                        className="mb-6 text-indigo-600 hover:text-indigo-700"
                    >
                        <ArrowLeft className="mr-2 size-4" />
                        Back
                    </Button>

                    <h1 className="mb-2 font-display text-2xl font-black tracking-tight text-gray-900">
                        Select Communities
                    </h1>
                    <p className="mb-6 text-gray-600">
                        Choose which communities you want your listing to appear in
                    </p>

                    {/* Pricing info */}
                    <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 p-4">
                        <div className="flex items-start">
                            <Info className="mr-2 mt-0.5 size-5 flex-shrink-0 text-blue-500" />
                            <div>
                                <h3 className="mb-1 font-medium text-blue-800">Pricing Information</h3>
                                <p className="text-sm text-blue-700">
                                    Flat rate: $19 for 30 days
                                    <br />
                                    Includes listing in all selected communities
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Communities list */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {availableRegions.map((region) => (
                                <div
                                    key={region.id}
                                    onClick={() => handleRegionToggle(region.id)}
                                    className={`cursor-pointer overflow-hidden rounded-lg border p-4 transition-all ${
                                        selectedRegions.includes(region.id)
                                            ? "border-indigo-500 bg-indigo-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                    role="checkbox"
                                    aria-checked={selectedRegions.includes(region.id)}
                                    tabIndex={0}
                                >
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            checked={selectedRegions.includes(region.id)}
                                            onCheckedChange={() => handleRegionToggle(region.id)}
                                        />
                                        <MapPin className="size-5 text-gray-400" />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{region.name}</div>
                                            <div className="text-sm text-gray-500">{region.full_name}</div>
                                        </div>
                                        <div
                                            className={`flex size-5 items-center justify-center rounded-full border ${
                                                selectedRegions.includes(region.id)
                                                    ? "border-indigo-600 bg-indigo-600"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {selectedRegions.includes(region.id) && (
                                                <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Selected summary */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-medium text-gray-900">
                                    Selected Communities: {selectedRegions.length}
                                </h3>
                            </div>
                            {selectedRegions.length > 0 && (
                                <div className="mb-4 flex flex-wrap gap-2">
                                    {selectedRegions.map((regionId) => {
                                        const region = availableRegions.find((r) => r.id === regionId);
                                        return region ? (
                                            <span
                                                key={region.id}
                                                className="flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800"
                                            >
                                                {region.name}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRegionToggle(region.id);
                                                    }}
                                                    className="ml-2 text-gray-500 hover:text-gray-700"
                                                >
                                                    &times;
                                                </button>
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between">
                            <Button type="button" variant="outline" onClick={() => router.visit("/classifieds")}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing || selectedRegions.length === 0}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                Continue
                                <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </LocationProvider>
    );
}
