import { Head, Link, router } from "@inertiajs/react";
import {
    ArrowLeftIcon,
    BarChart3,
    Calendar,
    DollarSign,
    Eye,
    MousePointerClick,
    Pause,
    PencilIcon,
    Play,
    TrendingUp,
    XCircle,
} from "lucide-react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

interface AdCreative {
    id: number;
    name: string;
    format: string;
    status: string;
    headline: string | null;
}

interface AdCampaign {
    id: number;
    uuid: string;
    name: string;
    description: string | null;
    status: string;
    type: string;
    budget: number;
    spent: number;
    daily_budget: number | null;
    start_date: string;
    end_date: string;
    platforms: string[];
    targeting: Record<string, unknown> | null;
    advertiser: {
        id: number;
        name: string;
        email?: string;
    };
    creatives: AdCreative[];
    created_at: string;
    updated_at: string;
}

interface CampaignStats {
    impressions: number;
    clicks: number;
    ctr: number;
    spend: number;
    conversions?: number;
}

interface DailyStat {
    date: string;
    impressions: number;
}

interface CampaignShowProps {
    campaign: AdCampaign;
    stats: CampaignStats;
    dailyStats: DailyStat[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Advertising", href: "/admin/advertising" },
    { title: "Campaigns", href: "/admin/advertising/campaigns" },
    { title: "Details", href: "#" },
];

function getStatusBadgeVariant(status: string) {
    switch (status) {
        case "active":
            return "default" as const;
        case "paused":
            return "secondary" as const;
        case "completed":
            return "outline" as const;
        case "cancelled":
            return "destructive" as const;
        case "draft":
            return "outline" as const;
        case "pending":
            return "secondary" as const;
        default:
            return "outline" as const;
    }
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat("en-US").format(value);
}

export default function CampaignShow({ campaign, stats, dailyStats }: CampaignShowProps) {
    const spentPercentage = campaign.budget > 0 ? Math.min(100, Math.round((campaign.spent / campaign.budget) * 100)) : 0;

    const handleStatusChange = (status: string) => {
        router.put(route("admin.advertising.campaigns.update-status", campaign.id), { status }, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Campaign: ${campaign.name}`} />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route("admin.advertising.campaigns.index")}>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                                <ArrowLeftIcon className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="font-display text-3xl font-black tracking-tight text-foreground">{campaign.name}</h1>
                                <Badge variant={getStatusBadgeVariant(campaign.status)}>{campaign.status}</Badge>
                            </div>
                            <p className="text-muted-foreground mt-1">{campaign.advertiser?.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {campaign.status === "active" && (
                            <Button variant="outline" onClick={() => handleStatusChange("paused")} className="gap-2">
                                <Pause className="h-4 w-4" />
                                Pause
                            </Button>
                        )}
                        {campaign.status === "paused" && (
                            <Button variant="outline" onClick={() => handleStatusChange("active")} className="gap-2">
                                <Play className="h-4 w-4" />
                                Resume
                            </Button>
                        )}
                        {["draft", "active", "paused"].includes(campaign.status) && (
                            <Button variant="destructive" size="sm" onClick={() => handleStatusChange("cancelled")} className="gap-2">
                                <XCircle className="h-4 w-4" />
                                Cancel
                            </Button>
                        )}
                        <Link href={route("admin.advertising.campaigns.edit", campaign.id)}>
                            <Button className="gap-2">
                                <PencilIcon className="h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-orange-500/10 p-2.5">
                                    <DollarSign className="h-5 w-5 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Spend</p>
                                    <p className="text-2xl font-bold">{formatCurrency(stats.spend)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="overflow-hidden border-none shadow-sm lg:col-span-2">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="font-display tracking-tight">Campaign Details</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {campaign.description && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                                    <p className="mt-1 text-foreground">{campaign.description}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                                    <p className="mt-1 text-foreground capitalize">{campaign.type.replace(/_/g, " ")}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Advertiser</p>
                                    <p className="mt-1 text-foreground">{campaign.advertiser?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Start Date
                                    </p>
                                    <p className="mt-1 text-foreground">{new Date(campaign.start_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        End Date
                                    </p>
                                    <p className="mt-1 text-foreground">{new Date(campaign.end_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            {campaign.platforms && campaign.platforms.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Platforms</p>
                                    <div className="flex flex-wrap gap-2">
                                        {campaign.platforms.map((platform) => (
                                            <Badge key={platform} variant="outline">
                                                {platform.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="font-display tracking-tight">Budget</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">Spent</span>
                                    <span className="font-medium">{spentPercentage}%</span>
                                </div>
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all"
                                        style={{ width: `${spentPercentage}%` }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Total Budget</span>
                                    <span className="font-medium">{formatCurrency(campaign.budget)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Spent</span>
                                    <span className="font-medium">{formatCurrency(campaign.spent)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Remaining</span>
                                    <span className="font-medium">{formatCurrency(campaign.budget - campaign.spent)}</span>
                                </div>
                                {campaign.daily_budget && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Daily Budget</span>
                                        <span className="font-medium">{formatCurrency(campaign.daily_budget)}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {dailyStats && dailyStats.length > 0 && (
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                <CardTitle className="font-display tracking-tight">Daily Impressions (Last 30 Days)</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex items-end gap-1 h-40">
                                {dailyStats.map((stat) => {
                                    const maxImpressions = Math.max(...dailyStats.map((s) => s.impressions), 1);
                                    const height = (stat.impressions / maxImpressions) * 100;
                                    return (
                                        <div key={stat.date} className="flex-1 group relative" title={`${stat.date}: ${formatNumber(stat.impressions)}`}>
                                            <div
                                                className="bg-primary/70 hover:bg-primary rounded-t transition-colors w-full"
                                                style={{ height: `${Math.max(height, 2)}%` }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="font-display tracking-tight">Creatives ({campaign.creatives?.length ?? 0})</CardTitle>
                        <CardDescription>Ad creatives associated with this campaign</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {campaign.creatives && campaign.creatives.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Format</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Headline</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {campaign.creatives.map((creative) => (
                                        <TableRow key={creative.id}>
                                            <TableCell>
                                                <Link
                                                    href={route("admin.advertising.creatives.show", creative.id)}
                                                    className="font-medium text-primary hover:underline"
                                                >
                                                    {creative.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{creative.format.replace(/_/g, " ")}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(creative.status)}>{creative.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{creative.headline ?? "--"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No creatives yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
