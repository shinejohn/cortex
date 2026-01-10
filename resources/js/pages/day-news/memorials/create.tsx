import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Flower, Upload, X } from "lucide-react";
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
            <div className="min-h-screen bg-background">
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

                <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    <h1 className="mb-8 text-4xl font-bold">Create Memorial</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload */}
                        <div>
                            <Label>Photo (Optional)</Label>
                            <div className="mt-2">
                                {preview ? (
                                    <div className="relative">
                                        <img src={preview} alt="Preview" className="h-48 w-48 rounded-full border object-cover" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute right-2 top-2"
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
                                        className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50"
                                    >
                                        <Upload className="size-8 text-muted-foreground" />
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(e) => form.setData("name", e.target.value)}
                                className="mt-2"
                                required
                            />
                            {form.errors.name && <p className="mt-1 text-sm text-destructive">{form.errors.name}</p>}
                        </div>

                        {/* Years */}
                        <div>
                            <Label htmlFor="years">Years *</Label>
                            <Input
                                id="years"
                                value={form.data.years}
                                onChange={(e) => form.setData("years", e.target.value)}
                                className="mt-2"
                                placeholder="e.g., 1932 - 2023"
                                required
                            />
                            {form.errors.years && <p className="mt-1 text-sm text-destructive">{form.errors.years}</p>}
                        </div>

                        {/* Date of Passing */}
                        <div>
                            <Label htmlFor="date_of_passing">Date of Passing *</Label>
                            <Input
                                id="date_of_passing"
                                type="date"
                                value={form.data.date_of_passing}
                                onChange={(e) => form.setData("date_of_passing", e.target.value)}
                                className="mt-2"
                                required
                            />
                            {form.errors.date_of_passing && <p className="mt-1 text-sm text-destructive">{form.errors.date_of_passing}</p>}
                        </div>

                        {/* Location */}
                        <div>
                            <Label htmlFor="location">Location (Optional)</Label>
                            <Input
                                id="location"
                                value={form.data.location}
                                onChange={(e) => form.setData("location", e.target.value)}
                                className="mt-2"
                                placeholder="e.g., Clearwater, FL"
                            />
                        </div>

                        {/* Obituary */}
                        <div>
                            <Label htmlFor="obituary">Obituary *</Label>
                            <Textarea
                                id="obituary"
                                value={form.data.obituary}
                                onChange={(e) => form.setData("obituary", e.target.value)}
                                className="mt-2"
                                rows={8}
                                required
                            />
                            {form.errors.obituary && <p className="mt-1 text-sm text-destructive">{form.errors.obituary}</p>}
                        </div>

                        {/* Service Information */}
                        <div className="rounded-lg border bg-muted p-4">
                            <h3 className="mb-4 font-semibold">Service Information (Optional)</h3>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="service_date">Service Date</Label>
                                    <Input
                                        id="service_date"
                                        type="date"
                                        value={form.data.service_date}
                                        onChange={(e) => form.setData("service_date", e.target.value)}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="service_location">Service Location</Label>
                                    <Input
                                        id="service_location"
                                        value={form.data.service_location}
                                        onChange={(e) => form.setData("service_location", e.target.value)}
                                        className="mt-2"
                                        placeholder="e.g., First Baptist Church, Clearwater"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="service_details">Service Details</Label>
                                    <Textarea
                                        id="service_details"
                                        value={form.data.service_details}
                                        onChange={(e) => form.setData("service_details", e.target.value)}
                                        className="mt-2"
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Error Display */}
                        {Object.keys(form.errors).length > 0 && (
                            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                                <p className="mb-2 font-semibold text-destructive">Please fix the following errors:</p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
                                    {Object.entries(form.errors).map(([field, error]) => (
                                        <li key={field}>
                                            <strong>{field}:</strong> {error as string}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex gap-4">
                            <Button type="submit" disabled={form.processing}>
                                <Flower className={`mr-2 size-4 ${form.processing ? "animate-spin" : ""}`} />
                                {form.processing ? "Creating..." : "Create Memorial"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.visit("/memorials")} disabled={form.processing}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </LocationProvider>
    );
}
