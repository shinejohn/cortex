import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeftIcon, Eye, ExternalLink, MousePointerClick, PencilIcon, TrendingUp } from "lucide-react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

interface AdCreative {
    id: number;
    name: string;
    format: string;
    status: string;
    headline: string | null;
    body: string | null;
    image_url: string | null;
    video_url: string | null;
    audio_url: string | null;
    click_url: string;
    cta_text: string | null;
    width: number | null;
    height: number | null;
    created_at: string;
    updated_at: string;
    campaign: {
        id: number;
        name: string;
    } | null;
}

interface CreativeStats {
    impressions: number;
    clicks: number;
    ctr: number;
}

interface CreativeShowProps {
    creative: AdCreative;
    stats: CreativeStats;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Advertising", href: "/admin/advertising" },
    { title: "Creatives", href: "/admin/advertising/creatives" },
    { title: "Details", href: "#" },
];

function getStatusBadgeVariant(status: string) {
    switch (status) {
        case "active":
        case "approved":
            return "default" as const;
        case "paused":
        case "pending_review":
            return "secondary" as const;
        case "rejected":
            return "destructive" as const;
        default:
            return "outline" as const;
    }
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat("en-US").format(value);
}

export default function CreativeShow({ creative, stats }: CreativeShowProps) {
    const handleStatusChange = (status: string) => {
        router.put(route("admin.advertising.creatives.update-status", creative.id), { status }, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Creative: ${creative.name}`} />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route("admin.advertising.creatives.index")}>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                                <ArrowLeftIcon className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="font-display text-3xl font-black tracking-tight text-foreground">{creative.name}</h1>
                                <Badge variant={getStatusBadgeVariant(creative.status)}>
                                    {creative.status.replace(/_/g, " ")}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground mt-1">
                                Campaign: {creative.campaign?.name ?? "Unassigned"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={creative.status} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Change Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending_review">Pending Review</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="paused">Paused</SelectItem>
                            </SelectContent>
                        </Select>
                        <Link href={route("admin.advertising.creatives.edit", creative.id)}>
                            <Button className="gap-2">
                                <PencilIcon className="h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500/10 p-2.5">
                                    <Eye className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Impressions</p>
                                    <p className="text-2xl font-bold">{formatNumber(stats.impressions)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-green-500/10 p-2.5">
                                    <MousePointerClick className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Clicks</p>
                                    <p className="text-2xl font-bold">{formatNumber(stats.clicks)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-purple-500/10 p-2.5">
                                    <TrendingUp className="h-5 w-5 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">CTR</p>
                                    <p className="text-2xl font-bold">{stats.ctr}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="font-display tracking-tight">Creative Details</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Format</p>
                                    <p className="mt-1">
                                        <Badge variant="outline">{creative.format.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</Badge>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Dimensions</p>
                                    <p className="mt-1 text-foreground">
                                        {creative.width && creative.height ? `${creative.width} x ${creative.height} px` : "Not specified"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                                    <p className="mt-1 text-foreground">{new Date(creative.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Updated</p>
                                    <p className="mt-1 text-foreground">{new Date(creative.updated_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {creative.headline && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Headline</p>
                                    <p className="mt-1 text-foreground font-medium">{creative.headline}</p>
                                </div>
                            )}

                            {creative.body && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Body</p>
                                    <p className="mt-1 text-foreground">{creative.body}</p>
                                </div>
                            )}

                            {creative.cta_text && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">CTA Text</p>
                                    <p className="mt-1 text-foreground">{creative.cta_text}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="font-display tracking-tight">Media & Links</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Click URL</p>
                                <a
                                    href={creative.click_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1 text-primary hover:underline inline-flex items-center gap-1.5 text-sm"
                                >
                                    {creative.click_url}
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            </div>

                            {creative.image_url && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Image</p>
                                    <div className="rounded-lg border overflow-hidden bg-muted/20">
                                        <img src={creative.image_url} alt={creative.name} className="max-w-full h-auto max-h-48 object-contain mx-auto" />
                                    </div>
                                </div>
                            )}

                            {creative.video_url && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Video URL</p>
                                    <a
                                        href={creative.video_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1 text-primary hover:underline inline-flex items-center gap-1.5 text-sm"
                                    >
                                        {creative.video_url}
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            )}

                            {creative.audio_url && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Audio URL</p>
                                    <a
                                        href={creative.audio_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1 text-primary hover:underline inline-flex items-center gap-1.5 text-sm"
                                    >
                                        {creative.audio_url}
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
