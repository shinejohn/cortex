import { Head, Link, router } from "@inertiajs/react";
import { FilterIcon, Mail, Send } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

interface EmailCampaign {
    id: number;
    subject: string;
    type: string;
    status: string;
    recipients_count: number;
    delivered_count: number;
    opened_count: number;
    clicked_count: number;
    scheduled_at: string | null;
    sent_at: string | null;
    created_at: string;
    community: {
        id: number;
        name: string;
    } | null;
}

interface EmailCampaignsIndexProps {
    campaigns: {
        data: EmailCampaign[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        community_id?: string;
        type?: string;
        status?: string;
    };
    communities: Array<{ id: number; name: string }>;
    types: string[];
    statuses: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Email", href: "/admin/email" },
    { title: "Campaigns", href: "/admin/email/campaigns" },
];

function getStatusBadgeVariant(status: string) {
    switch (status) {
        case "sent":
            return "default" as const;
        case "sending":
            return "default" as const;
        case "scheduled":
            return "secondary" as const;
        case "draft":
            return "outline" as const;
        case "cancelled":
            return "destructive" as const;
        default:
            return "outline" as const;
    }
}

export default function EmailCampaignsIndex({ campaigns, filters, communities, types, statuses }: EmailCampaignsIndexProps) {
    const [communityFilter, setCommunityFilter] = useState(filters.community_id || "");
    const [typeFilter, setTypeFilter] = useState(filters.type || "");
    const [statusFilter, setStatusFilter] = useState(filters.status || "");

    const handleFilter = () => {
        router.get(
            route("admin.email.campaigns.index"),
            {
                community_id: communityFilter || undefined,
                type: typeFilter || undefined,
                status: statusFilter || undefined,
            },
            { preserveState: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Email Campaigns" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div>
                    <h1 className="font-display text-3xl font-black tracking-tight text-foreground">Email Campaigns</h1>
                    <p className="text-muted-foreground mt-1">Manage email campaigns and digests</p>
                </div>

                <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="font-display tracking-tight text-base">Filters</CardTitle>
                        <CardDescription>Filter campaigns by community, type, or status</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-5">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Select value={communityFilter} onValueChange={setCommunityFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="All Communities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Communities</SelectItem>
                                    {communities.map((community) => (
                                        <SelectItem key={community.id} value={community.id.toString()}>
                                            {community.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Types</SelectItem>
                                    {types.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
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
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleFilter} className="gap-2">
                                <FilterIcon className="h-4 w-4" />
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="font-display tracking-tight">Campaigns ({campaigns.total})</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {campaigns.data.length === 0 ? (
                            <div className="text-center py-16">
                                <Mail className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                                <p className="text-muted-foreground text-lg font-medium">No email campaigns found</p>
                                <p className="text-muted-foreground text-sm mt-1">Campaigns will appear here once they are created.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Community</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Recipients</TableHead>
                                        <TableHead>Delivered</TableHead>
                                        <TableHead>Opened</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {campaigns.data.map((campaign) => (
                                        <TableRow key={campaign.id}>
                                            <TableCell>
                                                <Link
                                                    href={route("admin.email.campaigns.show", campaign.id)}
                                                    className="font-medium text-primary hover:underline"
                                                >
                                                    {campaign.subject}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{campaign.community?.name ?? "--"}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {campaign.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(campaign.status)}>
                                                    {campaign.status === "sending" && <Send className="mr-1 h-3 w-3 animate-pulse" />}
                                                    {campaign.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{campaign.recipients_count.toLocaleString()}</TableCell>
                                            <TableCell className="text-muted-foreground">{campaign.delivered_count.toLocaleString()}</TableCell>
                                            <TableCell className="text-muted-foreground">{campaign.opened_count.toLocaleString()}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {campaign.sent_at
                                                    ? new Date(campaign.sent_at).toLocaleDateString()
                                                    : campaign.scheduled_at
                                                      ? `Scheduled: ${new Date(campaign.scheduled_at).toLocaleDateString()}`
                                                      : new Date(campaign.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        {campaigns.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-8 pb-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={campaigns.current_page === 1}
                                    onClick={() => router.get(route("admin.email.campaigns.index"), { page: campaigns.current_page - 1 })}
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
                                    onClick={() => router.get(route("admin.email.campaigns.index"), { page: campaigns.current_page + 1 })}
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
