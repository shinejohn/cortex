import { Head, router, useForm, usePage } from "@inertiajs/react";
import { AlertCircle, BookOpen, Calendar, ChevronRight, Clock, FileText, Filter, Gavel, Plus, Scale, Search, X } from "lucide-react";
import { useState } from "react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
}

interface LegalNoticesPageProps {
    auth?: Auth;
    notices: {
        data: LegalNotice[];
        links: any;
        meta: any;
    };
    filters: {
        type: string;
        status: string;
        search: string;
    };
}

export default function LegalNoticesIndex() {
    const { auth, notices, filters } = usePage<LegalNoticesPageProps>().props;
    const [showFilters, setShowFilters] = useState(false);

    const searchForm = useForm({
        search: filters.search || "",
        type: filters.type || "all",
        status: filters.status || "active",
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchForm.get("/legal-notices", {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const typeLabels: Record<string, string> = {
        all: "All Types",
        foreclosure: "Foreclosure",
        probate: "Probate",
        name_change: "Name Change",
        business_formation: "Business Formation",
        public_hearing: "Public Hearing",
        zoning: "Zoning",
        tax_sale: "Tax Sale",
        other: "Other",
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
                return "bg-green-100 text-green-800";
            case "expires_soon":
                return "bg-amber-100 text-amber-800";
            case "expired":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-gray-50">
                <Head title="Legal Notices - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Legal Notices - Day News",
                        description: "Public legal notices and announcements",
                        url: "/legal-notices",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header Card */}
                    <div className="mb-6 overflow-hidden rounded-lg border-none bg-white shadow-sm">
                        <div className="p-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h1 className="flex items-center font-display text-2xl font-black tracking-tight text-gray-900">
                                        <Gavel className="mr-2 size-6 text-indigo-600" />
                                        Legal Notices
                                    </h1>
                                    <p className="mt-1 text-gray-600">
                                        Browse, search, and publish legal notices for your community
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    {auth && (
                                        <Button
                                            onClick={() => router.visit("/legal-notices/create")}
                                            className="bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            <Plus className="mr-1.5 size-4" />
                                            Create Notice
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        <Filter className="mr-1.5 size-4" />
                                        Filters
                                    </Button>
                                </div>
                            </div>

                            {/* Search bar */}
                            <form onSubmit={handleSearch} className="mt-6 flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        type="text"
                                        value={searchForm.data.search}
                                        onChange={(e) => searchForm.setData("search", e.target.value)}
                                        placeholder="Search by case number, address, name, or keyword..."
                                        className="pl-10"
                                    />
                                </div>
                                <Button type="submit" disabled={searchForm.processing} className="bg-indigo-600 hover:bg-indigo-700">
                                    Search
                                </Button>
                            </form>

                            {/* Filters panel */}
                            {showFilters && (
                                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="font-medium text-gray-900">Filter Notices</h3>
                                        <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700">
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Notice Type</label>
                                            <select
                                                value={searchForm.data.type}
                                                onChange={(e) => searchForm.setData("type", e.target.value)}
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            >
                                                {Object.entries(typeLabels).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                                            <select
                                                value={searchForm.data.status}
                                                onChange={(e) => searchForm.setData("status", e.target.value)}
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            >
                                                <option value="all">All Statuses</option>
                                                <option value="active">Active</option>
                                                <option value="expires_soon">Expires Soon</option>
                                                <option value="expired">Expired</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                searchForm.setData({ search: "", type: "all", status: "active" });
                                            }}
                                        >
                                            Clear Filters
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="bg-indigo-600 hover:bg-indigo-700"
                                            onClick={() => {
                                                searchForm.get("/legal-notices", {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                });
                                            }}
                                        >
                                            Apply Filters
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Type filter pills */}
                            <div className="mt-4 flex flex-wrap gap-2">
                                {Object.entries(typeLabels).map(([value, label]) => (
                                    <Button
                                        key={value}
                                        type="button"
                                        variant={searchForm.data.type === value ? "default" : "outline"}
                                        size="sm"
                                        className={searchForm.data.type === value ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                                        onClick={() => {
                                            searchForm.setData("type", value);
                                            searchForm.get("/legal-notices", {
                                                preserveState: true,
                                                preserveScroll: true,
                                            });
                                        }}
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Notices List */}
                    {notices.data.length === 0 ? (
                        <div className="overflow-hidden rounded-lg border-none bg-white p-8 text-center shadow-sm">
                            <Gavel className="mx-auto mb-4 size-12 text-gray-400" />
                            <h3 className="mb-2 text-lg font-medium text-gray-900">No legal notices found</h3>
                            <p className="text-gray-600">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border-none bg-white shadow-sm">
                            <div className="divide-y divide-gray-100 p-6">
                                {notices.data.map((notice) => (
                                    <div
                                        key={notice.id}
                                        className="group cursor-pointer rounded-lg p-4 transition-colors hover:bg-indigo-50/50"
                                        onClick={() => router.visit(`/legal-notices/${notice.id}`)}
                                    >
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                            <div className="flex-1">
                                                <div className="mb-1.5 flex flex-wrap gap-2">
                                                    <Badge className={`text-xs font-medium ${getTypeColor(notice.type)}`}>
                                                        {typeLabels[notice.type] || notice.type}
                                                    </Badge>
                                                    <Badge className={`text-xs font-medium ${getStatusColor(notice.status)}`}>
                                                        {notice.status.replace("_", " ").toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <h3 className="mb-1 font-medium text-gray-900 group-hover:text-indigo-600">
                                                    {notice.title}
                                                </h3>
                                                <p className="mb-2 line-clamp-2 text-sm text-gray-600">{notice.content}</p>
                                                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                                    {notice.case_number && (
                                                        <div className="flex items-center gap-1">
                                                            <FileText className="size-3" />
                                                            <span>Case #{notice.case_number}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="size-3" />
                                                        <span>Published: {new Date(notice.publish_date).toLocaleDateString()}</span>
                                                    </div>
                                                    {notice.expiry_date && (
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="size-3" />
                                                            <span>Expires: {new Date(notice.expiry_date).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                    {notice.court && (
                                                        <div className="flex items-center gap-1">
                                                            <Gavel className="size-3" />
                                                            <span>{notice.court}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="flex items-center text-sm text-indigo-600 group-hover:underline">
                                                    View Notice <ChevronRight className="ml-1 size-4" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {notices.links && notices.links.length > 3 && (
                                <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                                    <div className="text-sm text-gray-500">
                                        Showing {notices.meta?.from ?? 1}-{notices.meta?.to ?? notices.data.length} of{" "}
                                        {notices.meta?.total ?? notices.data.length} results
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {notices.links.map((link: any, index: number) => (
                                            <Button
                                                key={index}
                                                variant={link.active ? "default" : "outline"}
                                                size="sm"
                                                className={link.active ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                                                onClick={() => link.url && router.visit(link.url)}
                                                disabled={!link.url}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Information Section */}
                    <div className="mt-6 overflow-hidden rounded-lg border-none bg-white shadow-sm">
                        <div className="p-6">
                            <div className="flex items-start">
                                <Scale className="mr-3 mt-1 size-6 text-indigo-600" />
                                <div>
                                    <h2 className="mb-2 font-display text-xl font-bold tracking-tight text-gray-900">
                                        About Legal Notices
                                    </h2>
                                    <p className="mb-4 text-gray-600">
                                        Legal notices are official communications required by law to inform the public about
                                        certain actions, proceedings, or events. They are an essential part of maintaining
                                        transparency and providing due process.
                                    </p>
                                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div className="rounded-lg border border-gray-200 p-4">
                                            <div className="mb-2 flex items-center">
                                                <BookOpen className="mr-2 size-5 text-indigo-600" />
                                                <h3 className="font-medium text-gray-900">Types of Notices</h3>
                                            </div>
                                            <ul className="space-y-1 text-sm text-gray-600">
                                                <li>Foreclosure Notices</li>
                                                <li>Probate Notices</li>
                                                <li>Name Change Petitions</li>
                                                <li>Business Formation Notices</li>
                                                <li>Public Hearing Notices</li>
                                            </ul>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 p-4">
                                            <div className="mb-2 flex items-center">
                                                <AlertCircle className="mr-2 size-5 text-indigo-600" />
                                                <h3 className="font-medium text-gray-900">Why They Matter</h3>
                                            </div>
                                            <ul className="space-y-1 text-sm text-gray-600">
                                                <li>Legal requirement for many proceedings</li>
                                                <li>Ensures public transparency</li>
                                                <li>Protects rights of interested parties</li>
                                                <li>Creates an official public record</li>
                                                <li>Allows for public participation</li>
                                            </ul>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 p-4">
                                            <div className="mb-2 flex items-center">
                                                <FileText className="mr-2 size-5 text-indigo-600" />
                                                <h3 className="font-medium text-gray-900">Publishing a Notice</h3>
                                            </div>
                                            <p className="mb-3 text-sm text-gray-600">
                                                Need to publish a legal notice? Our platform makes it easy to create, submit,
                                                and manage your legal notices.
                                            </p>
                                            {auth && (
                                                <Button
                                                    onClick={() => router.visit("/legal-notices/create")}
                                                    className="w-full bg-indigo-600 text-sm hover:bg-indigo-700"
                                                    size="sm"
                                                >
                                                    Create a Notice
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LocationProvider>
    );
}
