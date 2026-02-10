import { Head, router, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Flower, ImagePlus, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface MemorialCreatePageProps {
    auth?: Auth;
}

export default function MemorialCreate() {
    const { auth } = usePage<MemorialCreatePageProps>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const form = useForm({
        name: "",
        years: "",
        date_of_passing: "",
        obituary: "",
        image: null as File | null,
        location: "",
        service_date: "",
        service_location: "",
        service_details: "",
        region_ids: [] as string[],
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData("image", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post("/memorials", {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-[#F8F9FB]">
                <Head title="Create Memorial - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Create Memorial - Day News",
                        description: "Create a memorial for a loved one",
                        url: "/memorials/create",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back Navigation */}
                    <button
                        onClick={() => router.visit("/memorials")}
                        className="mb-8 flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary group"
                    >
                        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                        BACK TO MEMORIALS
                    </button>

                    <div className="mb-2 flex items-center gap-2 text-primary">
                        <Flower className="size-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Create Memorial</span>
                    </div>
                    <h1 className="mb-8 font-display text-4xl font-black tracking-tight">
                        Honor a <span className="italic text-primary">Loved One</span>
                    </h1>

                    <div className="overflow-hidden rounded-2xl border-none bg-white p-8 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Image Upload */}
                            <div>
                                <Label className="text-sm font-bold text-zinc-700">Photo (Optional)</Label>
                                <div className="mt-3">
                                    {preview ? (
                                        <div className="relative inline-block">
                                            <img src={preview} alt="Preview" className="h-48 w-48 rounded-full border-4 border-white object-cover shadow-lg grayscale" />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute right-0 top-0 rounded-full shadow-md"
                                                onClick={() => {
                                                    setPreview(null);
                                                    form.setData("image", null);
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = "";
                                                    }
                                                }}
                                            >
                                                <X className="size-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex h-48 w-48 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-zinc-300 transition-all hover:border-primary hover:bg-primary/5"
                                        >
                                            <ImagePlus className="mb-2 size-8 text-zinc-400" />
                                            <span className="text-xs text-zinc-500">Upload photo</span>
                                        </div>
                                    )}
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <Label htmlFor="name" className="text-sm font-bold text-zinc-700">Name *</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData("name", e.target.value)}
                                    className="mt-2 h-12 border-none bg-zinc-50 ring-1 ring-zinc-200 focus-visible:ring-2 focus-visible:ring-primary"
                                    required
                                />
                                {form.errors.name && <p className="mt-1 text-sm text-destructive">{form.errors.name}</p>}
                            </div>

                            {/* Years and Date in two columns */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="years" className="text-sm font-bold text-zinc-700">Years *</Label>
                                    <Input
                                        id="years"
                                        value={form.data.years}
                                        onChange={(e) => form.setData("years", e.target.value)}
                                        className="mt-2 h-12 border-none bg-zinc-50 ring-1 ring-zinc-200 focus-visible:ring-2 focus-visible:ring-primary"
                                        placeholder="e.g., 1932 - 2023"
                                        required
                                    />
                                    {form.errors.years && <p className="mt-1 text-sm text-destructive">{form.errors.years}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="date_of_passing" className="text-sm font-bold text-zinc-700">Date of Passing *</Label>
                                    <Input
                                        id="date_of_passing"
                                        type="date"
                                        value={form.data.date_of_passing}
                                        onChange={(e) => form.setData("date_of_passing", e.target.value)}
                                        className="mt-2 h-12 border-none bg-zinc-50 ring-1 ring-zinc-200 focus-visible:ring-2 focus-visible:ring-primary"
                                        required
                                    />
                                    {form.errors.date_of_passing && <p className="mt-1 text-sm text-destructive">{form.errors.date_of_passing}</p>}
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <Label htmlFor="location" className="text-sm font-bold text-zinc-700">Location (Optional)</Label>
                                <Input
                                    id="location"
                                    value={form.data.location}
                                    onChange={(e) => form.setData("location", e.target.value)}
                                    className="mt-2 h-12 border-none bg-zinc-50 ring-1 ring-zinc-200 focus-visible:ring-2 focus-visible:ring-primary"
                                    placeholder="e.g., Clearwater, FL"
                                />
                            </div>

                            {/* Obituary */}
                            <div>
                                <Label htmlFor="obituary" className="text-sm font-bold text-zinc-700">Obituary *</Label>
                                <Textarea
                                    id="obituary"
                                    value={form.data.obituary}
                                    onChange={(e) => form.setData("obituary", e.target.value)}
                                    className="mt-2 border-none bg-zinc-50 ring-1 ring-zinc-200 focus-visible:ring-2 focus-visible:ring-primary"
                                    rows={8}
                                    required
                                />
                                {form.errors.obituary && <p className="mt-1 text-sm text-destructive">{form.errors.obituary}</p>}
                            </div>

                            {/* Service Information */}
                            <div className="rounded-2xl bg-zinc-50 p-6">
                                <h3 className="mb-4 font-display font-bold text-zinc-900">Service Information (Optional)</h3>
                                <div className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="service_date" className="text-sm font-bold text-zinc-700">Service Date</Label>
                                            <Input
                                                id="service_date"
                                                type="date"
                                                value={form.data.service_date}
                                                onChange={(e) => form.setData("service_date", e.target.value)}
                                                className="mt-2 h-12 border-none bg-white ring-1 ring-zinc-200 focus-visible:ring-2 focus-visible:ring-primary"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="service_location" className="text-sm font-bold text-zinc-700">Service Location</Label>
                                            <Input
                                                id="service_location"
                                                value={form.data.service_location}
                                                onChange={(e) => form.setData("service_location", e.target.value)}
                                                className="mt-2 h-12 border-none bg-white ring-1 ring-zinc-200 focus-visible:ring-2 focus-visible:ring-primary"
                                                placeholder="e.g., First Baptist Church, Clearwater"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="service_details" className="text-sm font-bold text-zinc-700">Service Details</Label>
                                        <Textarea
                                            id="service_details"
                                            value={form.data.service_details}
                                            onChange={(e) => form.setData("service_details", e.target.value)}
                                            className="mt-2 border-none bg-white ring-1 ring-zinc-200 focus-visible:ring-2 focus-visible:ring-primary"
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Error Display */}
                            {Object.keys(form.errors).length > 0 && (
                                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                                    <p className="mb-2 font-bold text-destructive">Please fix the following errors:</p>
                                    <ul className="list-inside list-disc space-y-1 text-sm text-destructive">
                                        {Object.entries(form.errors).map(([field, error]) => (
                                            <li key={field}>
                                                <strong>{field}:</strong> {error as string}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Submit */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-xl bg-primary px-8 font-bold shadow-lg shadow-primary/20"
                                >
                                    <Flower className={`mr-2 size-4 ${form.processing ? "animate-spin" : ""}`} />
                                    {form.processing ? "Creating..." : "Create Memorial"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl font-bold"
                                    onClick={() => router.visit("/memorials")}
                                    disabled={form.processing}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </LocationProvider>
    );
}
