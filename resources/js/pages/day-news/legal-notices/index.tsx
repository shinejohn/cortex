import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { Calendar, Gavel, Plus, Search } from "lucide-react";

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
            foreclosure: "bg-indigo-100 text-indigo-700",
            probate: "bg-green-100 text-green-700",
            name_change: "bg-amber-100 text-amber-700",
            business_formation: "bg-blue-100 text-blue-700",
            public_hearing: "bg-purple-100 text-purple-700",
        };
        return colors[type] || "bg-gray-100 text-gray-700";
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
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

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold">Legal Notices</h1>
                            <p className="mt-2 text-muted-foreground">Public legal notices and court announcements</p>
                        </div>
                        {auth && (
                            <Button onClick={() => router.visit("/legal-notices/create")}>
                                <Plus className="mr-2 size-4" />
                                Submit Notice
                            </Button>
                        )}
                    </div>

                    {/* Search and Filters */}
                    <form onSubmit={handleSearch} className="mb-6 space-y-4">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={searchForm.data.search}
                                    onChange={(e) => searchForm.setData("search", e.target.value)}
                                    placeholder="Search notices..."
                                    className="pl-10"
                                />
                            </div>
                            <Button type="submit" disabled={searchForm.processing}>
                                Search
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {Object.entries(typeLabels).map(([value, label]) => (
                                <Button
                                    key={value}
                                    type="button"
                                    variant={searchForm.data.type === value ? "default" : "outline"}
                                    size="sm"
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
                    </form>

                    {/* Notices List */}
                    {notices.data.length === 0 ? (
                        <div className="py-12 text-center">
                            <Gavel className="mx-auto mb-4 size-12 text-muted-foreground" />
                            <p className="text-muted-foreground">No legal notices found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notices.data.map((notice) => (
                                <div
                                    key={notice.id}
                                    className="cursor-pointer rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
                                    onClick={() => router.visit(`/legal-notices/${notice.id}`)}
                                >
                                    <div className="mb-2 flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge className={getTypeColor(notice.type)}>{typeLabels[notice.type] || notice.type}</Badge>
                                            {notice.case_number && <span className="text-sm text-muted-foreground">Case: {notice.case_number}</span>}
                                        </div>
                                        <Badge variant={notice.status === "active" ? "default" : "secondary"}>
                                            {notice.status.replace("_", " ").toUpperCase()}
                                        </Badge>
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold">{notice.title}</h3>
                                    <p className="mb-4 line-clamp-2 text-muted-foreground">{notice.content}</p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        {notice.court && (
                                            <div className="flex items-center gap-1">
                                                <Gavel className="size-4" />
                                                {notice.court}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Calendar className="size-4" />
                                            Published: {new Date(notice.publish_date).toLocaleDateString()}
                                        </div>
                                        {notice.expiry_date && <div>Expires: {new Date(notice.expiry_date).toLocaleDateString()}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {notices.links && notices.links.length > 3 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {notices.links.map((link: any, index: number) => (
                                <Button
                                    key={index}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => link.url && router.visit(link.url)}
                                    disabled={!link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </LocationProvider>
    );
}
