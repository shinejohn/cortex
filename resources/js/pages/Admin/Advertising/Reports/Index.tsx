import { Head, router } from "@inertiajs/react";
import { BarChart3, DollarSign, Eye, MousePointerClick, TrendingUp } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

interface ReportStats {
    total_impressions: number;
    total_clicks: number;
    total_revenue: number;
    ctr: number;
}

interface ReportsIndexProps {
    stats: ReportStats;
    filters: {
        date_from?: string;
        date_to?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Advertising", href: "/admin/advertising" },
    { title: "Reports", href: "/admin/advertising/reports" },
];

function formatNumber(value: number): string {
    return new Intl.NumberFormat("en-US").format(value);
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function ReportsIndex({ stats, filters }: ReportsIndexProps) {
    const [dateFrom, setDateFrom] = useState(filters.date_from || "");
    const [dateTo, setDateTo] = useState(filters.date_to || "");

    const handleFilter = () => {
        router.get(
            route("admin.advertising.reports.index"),
            {
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            { preserveState: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Advertising Reports" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div>
                    <h1 className="font-display text-3xl font-black tracking-tight text-foreground">Advertising Reports</h1>
                    <p className="text-muted-foreground mt-1">Overview of advertising performance</p>
                </div>

                <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="font-display tracking-tight text-base">Date Range</CardTitle>
                        <CardDescription>Select a date range for reporting</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-5">
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="date_from">From</Label>
                                <Input id="date_from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date_to">To</Label>
                                <Input id="date_to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                            </div>
                            <Button onClick={handleFilter} className="gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Update Report
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500/10 p-2.5">
                                    <Eye className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Impressions</p>
                                    <p className="text-2xl font-bold">{formatNumber(stats.total_impressions)}</p>
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
                                    <p className="text-sm text-muted-foreground">Total Clicks</p>
                                    <p className="text-2xl font-bold">{formatNumber(stats.total_clicks)}</p>
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
                                    <p className="text-sm text-muted-foreground">Overall CTR</p>
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
                                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                                    <p className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="font-display tracking-tight">Performance Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">Click-Through Rate</span>
                                    <span className="font-medium">{stats.ctr}%</span>
                                </div>
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all"
                                        style={{ width: `${Math.min(stats.ctr * 10, 100)}%` }}
                                    />
                                </div>
                            </div>
                            {stats.total_impressions > 0 && (
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-muted-foreground">Revenue per 1000 Impressions (eCPM)</span>
                                        <span className="font-medium">
                                            {formatCurrency((stats.total_revenue / stats.total_impressions) * 1000)}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {stats.total_clicks > 0 && (
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-muted-foreground">Revenue per Click (eCPC)</span>
                                        <span className="font-medium">
                                            {formatCurrency(stats.total_revenue / stats.total_clicks)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
