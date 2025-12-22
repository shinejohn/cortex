import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { useState } from "react";

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
    const [selectedRegions, setSelectedRegions] = useState<string[]>(
        currentRegion ? [currentRegion.id] : []
    );

    const form = useForm({
        region_ids: [] as string[],
    });

    const handleRegionToggle = (regionId: string) => {
        setSelectedRegions((prev) =>
            prev.includes(regionId) ? prev.filter((id) => id !== regionId) : [...prev, regionId]
        );
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
            <div className="min-h-screen bg-background">
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

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <Button variant="ghost" onClick={() => router.visit(`/classifieds/${classified.id}`)} className="mb-6">
                        <ArrowLeft className="mr-2 size-4" />
                        Back
                    </Button>

                    <h1 className="mb-6 text-3xl font-bold">Select Communities</h1>
                    <p className="mb-8 text-muted-foreground">Choose which communities you want your listing to appear in</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3 rounded-lg border bg-card p-6">
                            {availableRegions.map((region) => (
                                <label
                                    key={region.id}
                                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted"
                                >
                                    <Checkbox
                                        checked={selectedRegions.includes(region.id)}
                                        onCheckedChange={() => handleRegionToggle(region.id)}
                                    />
                                    <MapPin className="size-5 text-muted-foreground" />
                                    <div className="flex-1">
                                        <div className="font-medium">{region.name}</div>
                                        <div className="text-sm text-muted-foreground">{region.full_name}</div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => router.visit("/classifieds")}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing || selectedRegions.length === 0}>
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

