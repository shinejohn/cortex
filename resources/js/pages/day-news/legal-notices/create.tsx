import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Gavel } from "lucide-react";
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

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
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

                <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    <h1 className="mb-8 text-4xl font-bold">Submit Legal Notice</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Notice Type */}
                        <div>
                            <Label htmlFor="type">Notice Type *</Label>
                            <Select value={form.data.type} onValueChange={(value) => form.setData("type", value)} required>
                                <SelectTrigger className="mt-2">
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
                            {form.errors.type && <p className="mt-1 text-sm text-destructive">{form.errors.type}</p>}
                        </div>

                        {/* Case Number */}
                        <div>
                            <Label htmlFor="case_number">Case Number (Optional)</Label>
                            <Input
                                id="case_number"
                                value={form.data.case_number}
                                onChange={(e) => form.setData("case_number", e.target.value)}
                                className="mt-2"
                                placeholder="e.g., 2024-CA-12345"
                            />
                            {form.errors.case_number && <p className="mt-1 text-sm text-destructive">{form.errors.case_number}</p>}
                        </div>

                        {/* Title */}
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={form.data.title}
                                onChange={(e) => form.setData("title", e.target.value)}
                                className="mt-2"
                                required
                            />
                            {form.errors.title && <p className="mt-1 text-sm text-destructive">{form.errors.title}</p>}
                        </div>

                        {/* Content */}
                        <div>
                            <Label htmlFor="content">Notice Content *</Label>
                            <Textarea
                                id="content"
                                value={form.data.content}
                                onChange={(e) => form.setData("content", e.target.value)}
                                className="mt-2"
                                rows={12}
                                required
                            />
                            {form.errors.content && <p className="mt-1 text-sm text-destructive">{form.errors.content}</p>}
                        </div>

                        {/* Court */}
                        <div>
                            <Label htmlFor="court">Court/Jurisdiction (Optional)</Label>
                            <Input
                                id="court"
                                value={form.data.court}
                                onChange={(e) => form.setData("court", e.target.value)}
                                className="mt-2"
                                placeholder="e.g., Circuit Court, Pinellas County, Florida"
                            />
                            {form.errors.court && <p className="mt-1 text-sm text-destructive">{form.errors.court}</p>}
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="publish_date">Publish Date *</Label>
                                <Input
                                    id="publish_date"
                                    type="date"
                                    value={form.data.publish_date}
                                    onChange={(e) => form.setData("publish_date", e.target.value)}
                                    className="mt-2"
                                    required
                                />
                                {form.errors.publish_date && <p className="mt-1 text-sm text-destructive">{form.errors.publish_date}</p>}
                            </div>
                            <div>
                                <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
                                <Input
                                    id="expiry_date"
                                    type="date"
                                    value={form.data.expiry_date}
                                    onChange={(e) => form.setData("expiry_date", e.target.value)}
                                    className="mt-2"
                                    min={form.data.publish_date}
                                />
                                {form.errors.expiry_date && <p className="mt-1 text-sm text-destructive">{form.errors.expiry_date}</p>}
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
                                <Gavel className={`mr-2 size-4 ${form.processing ? "animate-spin" : ""}`} />
                                {form.processing ? "Submitting..." : "Submit Notice"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.visit("/legal-notices")} disabled={form.processing}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </LocationProvider>
    );
}
