import { Head, Link } from "@inertiajs/react";
import { ArrowLeftIcon, BarChart3, DollarSign, Eye, MousePointerClick, TrendingUp } from "lucide-react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

interface AdCreative {
    id: number;
    name: string;
    format: string;
    status: string;
}

interface AdCampaign {
    id: number;
    name: string;
    status: string;
    type: string;
    budget: number;
    spent: number;
    start_date: string;
    end_date: string;
    advertiser: {
        id: number;
        name: string;
    };
    creatives: AdCreative[];
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

interface CampaignReportProps {
    campaign: AdCampaign;
    stats: CampaignStats;
    dailyStats: DailyStat[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Advertising", href: "/admin/advertising" },
    { title: "Reports", href: "/admin/advertising/reports" },
    { title: "Campaign Report", href: "#" },
];

function formatNumber(value: number): string {
    return new Intl.NumberFormat("en-US").format(value);
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

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
        default:
            return "outline" as const;
    }
}

export default function CampaignReport({ campaign, stats, dailyStats }: CampaignReportProps) {
    const spentPercentage = campaign.budget > 0 ? Math.min(100, Math.round((campaign.spent / campaign.budget) * 100)) : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Report: ${campaign.name}`} />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex items-center gap-4">
                    <Link href={route("admin.advertising.reports.index")}>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                            <ArrowLeftIcon className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="font-display text-3xl font-black tracking-tight text-foreground">{campaign.name}</h1>
                            <Badge variant={getStatusBadgeVariant(campaign.status)}>{campaign.status}</Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            {campaign.advertiser?.name} &middot; {campaign.type.replace(/_/g, " ").toUpperCase()} &middot;{" "}
                            {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                        </p>
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

                <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="font-display tracking-tight">Budget Utilization</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Budget Progress</span>
                                <span className="font-medium">{spentPercentage}% spent</span>
                            </div>
                            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${spentPercentage}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Spent: {formatCurrency(campaign.spent)}</span>
                                <span>Budget: {formatCurrency(campaign.budget)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {dailyStats && dailyStats.length > 0 && (
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                <CardTitle className="font-display tracking-tight">Daily Impressions (Last 30 Days)</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex items-end gap-1 h-48">
                                {dailyStats.map((stat) => {
                                    const maxImpressions = Math.max(...dailyStats.map((s) => s.impressions), 1);
                                    const height = (stat.impressions / maxImpressions) * 100;
                                    return (
                                        <div
                                            key={stat.date}
                                            className="flex-1 group relative"
                                            title={`${stat.date}: ${formatNumber(stat.impressions)} impressions`}
                                        >
                                            <div
                                                className="bg-primary/70 hover:bg-primary rounded-t transition-colors w-full"
                                                style={{ height: `${Math.max(height, 2)}%` }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                {dailyStats.length > 0 && (
                                    <>
                                        <span>{new Date(dailyStats[0].date).toLocaleDateString()}</span>
                                        <span>{new Date(dailyStats[dailyStats.length - 1].date).toLocaleDateString()}</span>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="font-display tracking-tight">Creatives ({campaign.creatives?.length ?? 0})</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {campaign.creatives && campaign.creatives.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Format</TableHead>
                                        <TableHead>Status</TableHead>
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
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No creatives associated with this campaign.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
