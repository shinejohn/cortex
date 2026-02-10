import { Head, router, useForm, usePage } from "@inertiajs/react";
import { ChevronRight, DollarSign, FileText, Gavel, Info, Mail, Phone, User } from "lucide-react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface LegalNoticeCreatePageProps {
    auth?: Auth;
}

const noticeTypes = [
    { value: "foreclosure", label: "Foreclosure Notice" },
    { value: "probate", label: "Probate Notice" },
    { value: "name_change", label: "Name Change Notice" },
    { value: "business_formation", label: "Business Formation Notice" },
    { value: "public_hearing", label: "Public Hearing Notice" },
    { value: "zoning", label: "Zoning Notice" },
    { value: "tax_sale", label: "Tax Sale Notice" },
    { value: "other", label: "Other" },
];

export default function LegalNoticeCreate() {
    const { auth } = usePage<LegalNoticeCreatePageProps>().props;

    const form = useForm({
        type: "",
        case_number: "",
        title: "",
        content: "",
        court: "",
        publish_date: new Date().toISOString().split("T")[0],
        expiry_date: "",
        region_ids: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post("/legal-notices", {
            preserveScroll: true,
        });
    };

    const wordCount = form.data.content.trim().split(/\s+/).filter(Boolean).length;

    return (
        <LocationProvider>
            <div className="min-h-screen bg-gray-50">
                <Head title="Submit Legal Notice - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Submit Legal Notice - Day News",
                        description: "Submit a legal notice for publication",
                        url: "/legal-notices/create",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    <h1 className="mb-2 font-display text-2xl font-black tracking-tight text-gray-900">
                        Create Legal Notice
                    </h1>
                    <p className="mb-6 text-gray-600">Publish legal notices and announcements</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Notice Details Section */}
                        <div className="overflow-hidden rounded-lg border-none bg-white shadow-sm">
                            <div className="p-6">
                                <h2 className="mb-4 text-lg font-medium text-gray-900">Notice Details</h2>
                                <div className="space-y-4">
                                    {/* Notice Type */}
                                    <div>
                                        <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                                            Notice Type *
                                        </Label>
                                        <Select value={form.data.type} onValueChange={(value) => form.setData("type", value)} required>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select notice type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {noticeTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {form.errors.type && <p className="mt-1 text-sm text-red-600">{form.errors.type}</p>}
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                                            Notice Title *
                                        </Label>
                                        <Input
                                            id="title"
                                            value={form.data.title}
                                            onChange={(e) => form.setData("title", e.target.value)}
                                            className="mt-1"
                                            placeholder="e.g., Public Hearing Notice, Fictitious Name Registration"
                                            required
                                        />
                                        {form.errors.title && <p className="mt-1 text-sm text-red-600">{form.errors.title}</p>}
                                    </div>

                                    {/* Case Number */}
                                    <div>
                                        <Label htmlFor="case_number" className="text-sm font-medium text-gray-700">
                                            Case Number (Optional)
                                        </Label>
                                        <Input
                                            id="case_number"
                                            value={form.data.case_number}
                                            onChange={(e) => form.setData("case_number", e.target.value)}
                                            className="mt-1"
                                            placeholder="e.g., 2024-CA-12345"
                                        />
                                        {form.errors.case_number && (
                                            <p className="mt-1 text-sm text-red-600">{form.errors.case_number}</p>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                                            Notice Content *
                                        </Label>
                                        <Textarea
                                            id="content"
                                            value={form.data.content}
                                            onChange={(e) => form.setData("content", e.target.value)}
                                            className="mt-1"
                                            rows={10}
                                            required
                                        />
                                        <div className="mt-1 flex justify-between text-sm text-gray-500">
                                            <span>Word count: {wordCount}</span>
                                            <span>
                                                {wordCount <= 250
                                                    ? "Basic rate"
                                                    : wordCount <= 500
                                                      ? "Standard rate"
                                                      : "Extended rate"}
                                            </span>
                                        </div>
                                        {form.errors.content && <p className="mt-1 text-sm text-red-600">{form.errors.content}</p>}
                                    </div>

                                    {/* Court */}
                                    <div>
                                        <Label htmlFor="court" className="text-sm font-medium text-gray-700">
                                            Court/Jurisdiction (Optional)
                                        </Label>
                                        <Input
                                            id="court"
                                            value={form.data.court}
                                            onChange={(e) => form.setData("court", e.target.value)}
                                            className="mt-1"
                                            placeholder="e.g., Circuit Court, Pinellas County, Florida"
                                        />
                                        {form.errors.court && <p className="mt-1 text-sm text-red-600">{form.errors.court}</p>}
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <Label htmlFor="publish_date" className="text-sm font-medium text-gray-700">
                                                Publish Date *
                                            </Label>
                                            <Input
                                                id="publish_date"
                                                type="date"
                                                value={form.data.publish_date}
                                                onChange={(e) => form.setData("publish_date", e.target.value)}
                                                className="mt-1"
                                                required
                                            />
                                            {form.errors.publish_date && (
                                                <p className="mt-1 text-sm text-red-600">{form.errors.publish_date}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="expiry_date" className="text-sm font-medium text-gray-700">
                                                Expiry Date (Optional)
                                            </Label>
                                            <Input
                                                id="expiry_date"
                                                type="date"
                                                value={form.data.expiry_date}
                                                onChange={(e) => form.setData("expiry_date", e.target.value)}
                                                className="mt-1"
                                                min={form.data.publish_date}
                                            />
                                            {form.errors.expiry_date && (
                                                <p className="mt-1 text-sm text-red-600">{form.errors.expiry_date}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pricing Information */}
                        <div className="overflow-hidden rounded-lg border-none bg-white shadow-sm">
                            <div className="p-6">
                                <h2 className="mb-4 text-lg font-medium text-gray-900">Pricing</h2>
                                <div className="rounded-md bg-gray-50 p-4">
                                    <div className="mb-2 flex justify-between">
                                        <span className="text-gray-700">Under 250 words:</span>
                                        <span className="font-medium">$75</span>
                                    </div>
                                    <div className="mb-2 flex justify-between">
                                        <span className="text-gray-700">250-500 words:</span>
                                        <span className="font-medium">$100</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">Over 500 words:</span>
                                        <span className="font-medium">$150</span>
                                    </div>
                                    <div className="mt-3 text-sm text-gray-500">
                                        Includes affidavit of publication to meet legal requirements
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Error Display */}
                        {Object.keys(form.errors).length > 0 && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                <p className="mb-2 font-semibold text-red-700">Please fix the following errors:</p>
                                <ul className="list-inside list-disc space-y-1 text-sm text-red-600">
                                    {Object.entries(form.errors).map(([field, error]) => (
                                        <li key={field}>
                                            <strong>{field}:</strong> {error as string}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit("/legal-notices")}
                                disabled={form.processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="flex items-center bg-indigo-600 hover:bg-indigo-700"
                            >
                                <Gavel className={`mr-2 size-4 ${form.processing ? "animate-spin" : ""}`} />
                                {form.processing ? "Submitting..." : "Continue to Payment"}
                                <ChevronRight className="ml-1 size-4" />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </LocationProvider>
    );
}
