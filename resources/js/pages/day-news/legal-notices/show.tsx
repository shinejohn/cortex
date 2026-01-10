import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { router } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { Calendar, Gavel, MapPin } from "lucide-react";

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
        foreclosure: "bg-accent text-primary",
        probate: "bg-green-100 text-green-700",
        name_change: "bg-amber-100 text-amber-700",
        business_formation: "bg-accent text-primary",
        public_hearing: "bg-accent text-primary",
    };
    return colors[type] || "bg-muted text-foreground";
};

export default function LegalNoticeShow() {
    const { auth, notice } = usePage<LegalNoticeShowPageProps>().props;

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
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

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-4">
                        <Button variant="ghost" onClick={() => router.visit("/legal-notices")}>
                            ← Back to Legal Notices
                        </Button>
                    </div>

                    <div className="rounded-lg border bg-card p-8">
                        {/* Header */}
                        <div className="mb-6 border-b pb-4">
                            <div className="mb-4 flex items-start justify-between">
                                <Badge className={getTypeColor(notice.type)}>{typeLabels[notice.type] || notice.type}</Badge>
                                <Badge variant={notice.status === "active" ? "default" : "secondary"}>
                                    {notice.status.replace("_", " ").toUpperCase()}
                                </Badge>
                            </div>
                            <h1 className="mb-4 text-3xl font-bold">{notice.title}</h1>
                            {notice.case_number && (
                                <p className="mb-2 text-lg font-semibold text-muted-foreground">Case Number: {notice.case_number}</p>
                            )}
                        </div>

                        {/* Content */}
                        <div className="mb-6">
                            <div className="prose max-w-none whitespace-pre-wrap">{notice.content}</div>
                        </div>

                        {/* Metadata */}
                        <div className="space-y-3 border-t pt-6 text-sm text-muted-foreground">
                            {notice.court && (
                                <div className="flex items-center gap-2">
                                    <Gavel className="size-4" />
                                    <span>{notice.court}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar className="size-4" />
                                <span>
                                    Published:{" "}
                                    {new Date(notice.publish_date).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                            {notice.expiry_date && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="size-4" />
                                    <span>
                                        Expires:{" "}
                                        {new Date(notice.expiry_date).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>
                            )}
                            {notice.regions.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="size-4" />
                                    <span>{notice.regions.map((r) => r.name).join(", ")}</span>
                                </div>
                            )}
                            {notice.user && (
                                <div>
                                    <span className="font-medium">Submitted by:</span> {notice.user.name}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </LocationProvider>
    );
}
