import { Head, Link, router } from "@inertiajs/react";
import { FilterIcon, PlusIcon, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

interface AdCampaign {
    id: number;
    uuid: string;
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
}

interface CampaignIndexProps {
    campaigns: {
        data: AdCampaign[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        status?: string;
        advertiser_id?: number;
    };
    advertisers: Array<{ id: number; name: string }>;
    statuses: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Advertising", href: "/admin/advertising" },
    { title: "Campaigns", href: "/admin/advertising/campaigns" },
];

export default function CampaignIndex({ campaigns, filters, advertisers, statuses }: CampaignIndexProps) {
    const [_searchTerm, _setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState(filters.status || "");
    const [advertiserFilter, setAdvertiserFilter] = useState(filters.advertiser_id?.toString() || "");

    const handleFilter = () => {
        router.get(
            route("admin.advertising.campaigns.index"),
            {
                status: statusFilter || undefined,
                advertiser_id: advertiserFilter || undefined,
            },
            { preserveState: true },
        );
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "active":
                return "default";
            case "paused":
                return "secondary";
            case "completed":
                return "outline";
            case "cancelled":
                return "destructive";
            default:
                return "outline";
        }
    };

    const getSpentPercentage = (campaign: AdCampaign) => {
        if (!campaign.budget) return 0;
        return Math.min(100, Math.round((campaign.spent / campaign.budget) * 100));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Advertising Campaigns" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-black tracking-tight text-foreground">Advertising Campaigns</h1>
                        <p className="text-muted-foreground mt-1">Manage your advertising campaigns</p>
                    </div>
                    <Link href={route("admin.advertising.campaigns.create")}>
                        <Button className="gap-2">
                            <PlusIcon className="h-4 w-4" />
                            New Campaign
                        </Button>
                    </Link>
                </div>

                <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="font-display tracking-tight text-base">Filters</CardTitle>
                        <CardDescription>Filter campaigns by status or advertiser</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-5">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Statuses</SelectItem>
                                    {statuses.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={advertiserFilter} onValueChange={setAdvertiserFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="All Advertisers" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Advertisers</SelectItem>
                                    {advertisers.map((advertiser) => (
                                        <SelectItem key={advertiser.id} value={advertiser.id.toString()}>
                                            {advertiser.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleFilter} className="gap-2">
                                <FilterIcon className="h-4 w-4" />
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="font-display tracking-tight">
                            Campaigns ({campaigns?.total ?? 0})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5">
                        <div className="space-y-4">
                            {campaigns.data.length === 0 ? (
                                <div className="text-center py-16">
                                    <TrendingUp className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                                    <p className="text-muted-foreground text-lg font-medium">No campaigns found</p>
                                    <p className="text-muted-foreground text-sm mt-1">Create your first campaign to get started.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {campaigns.data.map((campaign) => (
                                        <Link
                                            key={campaign.id}
                                            href={route("admin.advertising.campaigns.show", campaign.id)}
                                            className="group block rounded-xl border bg-card p-5 hover:shadow-md transition-all"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                                            {campaign.name}
                                                        </h3>
                                                        <Badge variant={getStatusBadgeVariant(campaign.status)}>{campaign.status}</Badge>
                                                        <Badge variant="outline">{campaign.type}</Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{campaign?.advertiser?.name}</p>
                                                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <DollarSign className="h-3.5 w-3.5" />
                                                            Budget: ${campaign.budget?.toLocaleString() ?? 0}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <TrendingUp className="h-3.5 w-3.5" />
                                                            Spent: ${campaign.spent?.toLocaleString() ?? 0}
                                                        </span>
                                                        <span>
                                                            Remaining: ${((campaign.budget ?? 0) - (campaign.spent ?? 0)).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(campaign.start_date).toLocaleDateString()} -{" "}
                                                        {new Date(campaign.end_date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className="hidden sm:flex flex-col items-end gap-1">
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        {getSpentPercentage(campaign)}% spent
                                                    </span>
                                                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary rounded-full transition-all"
                                                            style={{ width: `${getSpentPercentage(campaign)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {campaigns.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={campaigns.current_page === 1}
                                    onClick={() => router.get(route("admin.advertising.campaigns.index"), { page: campaigns.current_page - 1 })}
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-4 text-sm text-muted-foreground">
                                    Page {campaigns.current_page} of {campaigns.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={campaigns.current_page === campaigns.last_page}
                                    onClick={() => router.get(route("admin.advertising.campaigns.index"), { page: campaigns.current_page + 1 })}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
