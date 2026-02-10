import { Head, Link, router } from "@inertiajs/react";
import { FilterIcon, Image, PlusIcon } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

interface AdCreative {
    id: number;
    name: string;
    format: string;
    status: string;
    headline: string | null;
    click_url: string;
    width: number | null;
    height: number | null;
    created_at: string;
    campaign: {
        id: number;
        name: string;
    } | null;
}

interface CreativesIndexProps {
    creatives: {
        data: AdCreative[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        campaign_id?: string;
        status?: string;
    };
    campaigns: Array<{ id: number; name: string }>;
    statuses: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Advertising", href: "/admin/advertising" },
    { title: "Creatives", href: "/admin/advertising/creatives" },
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

export default function CreativesIndex({ creatives, filters, campaigns, statuses }: CreativesIndexProps) {
    const [statusFilter, setStatusFilter] = useState(filters.status || "");
    const [campaignFilter, setCampaignFilter] = useState(filters.campaign_id || "");

    const handleFilter = () => {
        router.get(
            route("admin.advertising.creatives.index"),
            {
                status: statusFilter || undefined,
                campaign_id: campaignFilter || undefined,
            },
            { preserveState: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ad Creatives" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-black tracking-tight text-foreground">Ad Creatives</h1>
                        <p className="text-muted-foreground mt-1">Manage ad creatives across campaigns</p>
                    </div>
                    <Link href={route("admin.advertising.creatives.create")}>
                        <Button className="gap-2">
                            <PlusIcon className="h-4 w-4" />
                            New Creative
                        </Button>
                    </Link>
                </div>

                <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="font-display tracking-tight text-base">Filters</CardTitle>
                        <CardDescription>Filter creatives by campaign or status</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-5">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="All Campaigns" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Campaigns</SelectItem>
                                    {campaigns.map((campaign) => (
                                        <SelectItem key={campaign.id} value={campaign.id.toString()}>
                                            {campaign.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Statuses</SelectItem>
                                    {statuses.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
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
                        <CardTitle className="font-display tracking-tight">Creatives ({creatives.total})</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {creatives.data.length === 0 ? (
                            <div className="text-center py-16">
                                <Image className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                                <p className="text-muted-foreground text-lg font-medium">No creatives found</p>
                                <p className="text-muted-foreground text-sm mt-1">Create your first creative to get started.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Campaign</TableHead>
                                        <TableHead>Format</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {creatives.data.map((creative) => (
                                        <TableRow key={creative.id}>
                                            <TableCell>
                                                <Link
                                                    href={route("admin.advertising.creatives.show", creative.id)}
                                                    className="font-medium text-primary hover:underline"
                                                >
                                                    {creative.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{creative.campaign?.name ?? "--"}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{creative.format.replace(/_/g, " ")}</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {creative.width && creative.height ? `${creative.width}x${creative.height}` : "--"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(creative.status)}>
                                                    {creative.status.replace(/_/g, " ")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(creative.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        {creatives.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-8 pb-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={creatives.current_page === 1}
                                    onClick={() => router.get(route("admin.advertising.creatives.index"), { page: creatives.current_page - 1 })}
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-4 text-sm text-muted-foreground">
                                    Page {creatives.current_page} of {creatives.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={creatives.current_page === creatives.last_page}
                                    onClick={() => router.get(route("admin.advertising.creatives.index"), { page: creatives.current_page + 1 })}
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
