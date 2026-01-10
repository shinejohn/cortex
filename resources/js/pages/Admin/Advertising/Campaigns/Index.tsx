import { Head, Link, router } from "@inertiajs/react";
import { FilterIcon, PlusIcon, SearchIcon } from "lucide-react";
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Advertising Campaigns" />
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Advertising Campaigns</h1>
                        <p className="text-muted-foreground mt-1">Manage your advertising campaigns</p>
                    </div>
                    <Link href={route("admin.advertising.campaigns.create")}>
                        <Button>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            New Campaign
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Filter campaigns by status or advertiser</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[200px]">
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
                                <SelectTrigger className="w-[200px]">
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
                            <Button onClick={handleFilter}>
                                <FilterIcon className="mr-2 h-4 w-4" />
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Campaigns ({campaigns.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {campaigns.data.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No campaigns found. Create your first campaign to get started.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {campaigns.data.map((campaign) => (
                                        <Link
                                            key={campaign.id}
                                            href={route("admin.advertising.campaigns.show", campaign.id)}
                                            className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold">{campaign.name}</h3>
                                                        <Badge variant={getStatusBadgeVariant(campaign.status)}>{campaign.status}</Badge>
                                                        <Badge variant="outline">{campaign.type}</Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">{campaign.advertiser.name}</p>
                                                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                                                        <span>Budget: ${campaign.budget.toLocaleString()}</span>
                                                        <span>Spent: ${campaign.spent.toLocaleString()}</span>
                                                        <span>Remaining: ${(campaign.budget - campaign.spent).toLocaleString()}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {new Date(campaign.start_date).toLocaleDateString()} -{" "}
                                                        {new Date(campaign.end_date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {campaigns.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                <Button
                                    variant="outline"
                                    disabled={campaigns.current_page === 1}
                                    onClick={() => router.get(route("admin.advertising.campaigns.index"), { page: campaigns.current_page - 1 })}
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-4">
                                    Page {campaigns.current_page} of {campaigns.last_page}
                                </span>
                                <Button
                                    variant="outline"
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
