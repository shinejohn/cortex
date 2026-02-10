import { Head, Link, router } from "@inertiajs/react";
import { FilterIcon, Search, Users } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

interface EmailSubscriber {
    id: number;
    email: string;
    name: string | null;
    type: string;
    status: string;
    created_at: string;
    community: {
        id: number;
        name: string;
    } | null;
}

interface SubscribersIndexProps {
    subscribers: {
        data: EmailSubscriber[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        community_id?: string;
        status?: string;
        type?: string;
        search?: string;
    };
    communities: Array<{ id: number; name: string }>;
    statuses: string[];
    types: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Email", href: "/admin/email" },
    { title: "Subscribers", href: "/admin/email/subscribers" },
];

function getStatusBadgeVariant(status: string) {
    switch (status) {
        case "active":
            return "default" as const;
        case "pending":
            return "secondary" as const;
        case "unsubscribed":
            return "outline" as const;
        case "bounced":
        case "complained":
            return "destructive" as const;
        default:
            return "outline" as const;
    }
}

export default function SubscribersIndex({ subscribers, filters, communities, statuses, types }: SubscribersIndexProps) {
    const [communityFilter, setCommunityFilter] = useState(filters.community_id || "");
    const [statusFilter, setStatusFilter] = useState(filters.status || "");
    const [typeFilter, setTypeFilter] = useState(filters.type || "");
    const [searchTerm, setSearchTerm] = useState(filters.search || "");

    const handleFilter = () => {
        router.get(
            route("admin.email.subscribers.index"),
            {
                community_id: communityFilter || undefined,
                status: statusFilter || undefined,
                type: typeFilter || undefined,
                search: searchTerm || undefined,
            },
            { preserveState: true },
        );
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleFilter();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Email Subscribers" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div>
                    <h1 className="font-display text-3xl font-black tracking-tight text-foreground">Email Subscribers</h1>
                    <p className="text-muted-foreground mt-1">Manage email subscribers across communities</p>
                </div>

                <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="font-display tracking-tight text-base">Filters</CardTitle>
                        <CardDescription>Search and filter subscribers</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-5">
                        <div className="flex flex-col gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    className="pl-10"
                                    placeholder="Search by email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                />
                            </div>
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
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-full sm:w-[200px]">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Types</SelectItem>
                                        {types.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type.toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleFilter} className="gap-2">
                                    <FilterIcon className="h-4 w-4" />
                                    Apply
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="font-display tracking-tight">Subscribers ({subscribers.total})</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {subscribers.data.length === 0 ? (
                            <div className="text-center py-16">
                                <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                                <p className="text-muted-foreground text-lg font-medium">No subscribers found</p>
                                <p className="text-muted-foreground text-sm mt-1">Try adjusting your filters.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Community</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Subscribed</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subscribers.data.map((subscriber) => (
                                        <TableRow key={subscriber.id}>
                                            <TableCell>
                                                <Link
                                                    href={route("admin.email.subscribers.show", subscriber.id)}
                                                    className="font-medium text-primary hover:underline"
                                                >
                                                    {subscriber.email}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{subscriber.name ?? "--"}</TableCell>
                                            <TableCell className="text-muted-foreground">{subscriber.community?.name ?? "--"}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{subscriber.type.toUpperCase()}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(subscriber.status)}>{subscriber.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(subscriber.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        {subscribers.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-8 pb-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={subscribers.current_page === 1}
                                    onClick={() => router.get(route("admin.email.subscribers.index"), { page: subscribers.current_page - 1 })}
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-4 text-sm text-muted-foreground">
                                    Page {subscribers.current_page} of {subscribers.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={subscribers.current_page === subscribers.last_page}
                                    onClick={() => router.get(route("admin.email.subscribers.index"), { page: subscribers.current_page + 1 })}
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
