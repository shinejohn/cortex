import { Head, router, usePage } from "@inertiajs/react";
import { ArrowLeft, BookOpen, Building, Calendar, Clock, Copy, Check, Download, FileText, Gavel, MapPin, Printer, Scale, Share2, Users } from "lucide-react";
import { useState } from "react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface LegalNotice {
    id: string;
    type: string;
    case_number: string | null;
    title: string;
    content: string;
    court: string | null;
    publish_date: string;
    expiry_date: string | null;
    status: string;
    views_count: number;
    regions: Array<{
        id: number;
        name: string;
    }>;
    user: {
        id: string;
        name: string;
    } | null;
}

interface LegalNoticeShowPageProps {
    auth?: Auth;
    notice: LegalNotice;
}

const typeLabels: Record<string, string> = {
    foreclosure: "Foreclosure Notice",
    probate: "Probate Notice",
    name_change: "Name Change Notice",
    business_formation: "Business Formation Notice",
    public_hearing: "Public Hearing Notice",
    zoning: "Zoning Notice",
    tax_sale: "Tax Sale Notice",
    other: "Other Legal Notice",
};

const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
        foreclosure: "bg-indigo-100 text-indigo-800",
        probate: "bg-green-100 text-green-800",
        name_change: "bg-amber-100 text-amber-800",
        business_formation: "bg-blue-100 text-blue-800",
        public_hearing: "bg-purple-100 text-purple-800",
        zoning: "bg-teal-100 text-teal-800",
        tax_sale: "bg-red-100 text-red-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "active":
            return "text-green-600";
        case "expires_soon":
            return "text-amber-600";
        case "expired":
            return "text-red-600";
        default:
            return "text-gray-600";
    }
};

export default function LegalNoticeShow() {
    const { auth, notice } = usePage<LegalNoticeShowPageProps>().props;
    const [copied, setCopied] = useState(false);

    const handleCopyText = () => {
        navigator.clipboard.writeText(notice.content).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-gray-50">
                <Head title={`${notice.title} - Legal Notices`} />
                <SEO
                    type="article"
                    site="day-news"
                    data={{
                        title: `${notice.title} - Legal Notices`,
                        description: notice.content.substring(0, 200),
                        url: `/legal-notices/${notice.id}`,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back button */}
                    <button
                        onClick={() => router.visit("/legal-notices")}
                        className="mb-4 flex items-center text-indigo-600 hover:underline"
                    >
                        <ArrowLeft className="mr-1 size-4" />
                        Back to Legal Notices
                    </button>

                    {/* Notice Header Card */}
                    <div className="mb-6 overflow-hidden rounded-lg border-none bg-white shadow-sm">
                        <div className="p-6">
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <Badge className={`mb-2 inline-block text-xs font-medium ${getTypeColor(notice.type)}`}>
                                        {typeLabels[notice.type] || notice.type}
                                    </Badge>
                                    <h1 className="font-display text-2xl font-black tracking-tight text-gray-900">
                                        {notice.title}
                                    </h1>
                                    {notice.case_number && (
                                        <p className="mt-1 text-gray-600">Case #{notice.case_number}</p>
                                    )}
                                    {notice.court && (
                                        <p className="mt-1 text-gray-600">{notice.court}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        className="rounded-full p-2 text-gray-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                                        onClick={handlePrint}
                                        title="Print Notice"
                                    >
                                        <Printer className="size-5" />
                                    </button>
                                    <button
                                        className="rounded-full p-2 text-gray-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                                        title="Share Notice"
                                    >
                                        <Share2 className="size-5" />
                                    </button>
                                    <button
                                        className="rounded-full p-2 text-gray-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                                        title="Download Notice"
                                    >
                                        <Download className="size-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Metadata Grid */}
                            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex items-start">
                                    <Calendar className="mr-2 mt-0.5 size-5 text-indigo-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Published Date</p>
                                        <p className="font-medium">
                                            {new Date(notice.publish_date).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                                {notice.expiry_date && (
                                    <div className="flex items-start">
                                        <Clock className="mr-2 mt-0.5 size-5 text-indigo-600" />
                                        <div>
                                            <p className="text-sm text-gray-500">Expiry Date</p>
                                            <p className="font-medium">
                                                {new Date(notice.expiry_date).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {notice.regions.length > 0 && (
                                    <div className="flex items-start">
                                        <MapPin className="mr-2 mt-0.5 size-5 text-indigo-600" />
                                        <div>
                                            <p className="text-sm text-gray-500">Location</p>
                                            <p className="font-medium">{notice.regions.map((r) => r.name).join(", ")}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-start">
                                    <Scale className="mr-2 mt-0.5 size-5 text-green-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <p className={`font-medium ${getStatusColor(notice.status)}`}>
                                            {notice.status.replace("_", " ").toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Details */}
                            {notice.user && (
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex items-start">
                                        <Users className="mr-2 mt-0.5 size-5 text-indigo-600" />
                                        <div>
                                            <p className="text-sm text-gray-500">Submitted by</p>
                                            <p className="font-medium">{notice.user.name}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Legal Notice Content */}
                    <div className="mb-6 overflow-hidden rounded-lg border-none bg-white shadow-sm">
                        <div className="p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="flex items-center font-display text-xl font-bold tracking-tight text-gray-900">
                                    <FileText className="mr-2 size-5 text-indigo-600" />
                                    Legal Notice Text
                                </h2>
                                <button
                                    className="flex items-center text-sm text-indigo-600 transition-colors hover:underline"
                                    onClick={handleCopyText}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="mr-1 size-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="mr-1 size-4" />
                                            Copy Text
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 font-mono text-sm whitespace-pre-wrap">
                                {notice.content}
                            </div>
                            <div className="mt-4 flex justify-between text-sm text-gray-500">
                                <div>
                                    Published:{" "}
                                    {new Date(notice.publish_date).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </div>
                                <div>{notice.views_count ?? 0} views</div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="overflow-hidden rounded-lg border-none bg-white shadow-sm">
                        <div className="p-6">
                            <h2 className="mb-2 font-display text-xl font-bold tracking-tight text-gray-900">
                                Need to publish a legal notice?
                            </h2>
                            <p className="mb-4 text-gray-600">
                                Legal notices are an important part of the public record. If you need to publish a legal notice,
                                you can do so through our platform.
                            </p>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Button
                                    onClick={() => router.visit("/legal-notices/create")}
                                    className="bg-indigo-600 px-6 py-3 hover:bg-indigo-700"
                                >
                                    Create a Legal Notice
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => router.visit("/legal-notices")}
                                    className="border-indigo-600 px-6 py-3 text-indigo-600 hover:bg-indigo-50"
                                >
                                    Browse All Legal Notices
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LocationProvider>
    );
}
