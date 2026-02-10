import { Head, Link, router } from "@inertiajs/react";
import { AlertTriangle, FilterIcon, PlusIcon, Shield } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

interface EmergencyAlert {
    id: number;
    title: string;
    priority: string;
    category: string;
    status: string;
    message: string;
    expires_at: string | null;
    created_at: string;
    community: {
        id: number;
        name: string;
    } | null;
}

interface AlertsIndexProps {
    alerts: {
        data: EmergencyAlert[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        community_id?: string;
        priority?: string;
        status?: string;
    };
    communities: Array<{ id: number; name: string }>;
    priorities: string[];
    statuses: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Emergency", href: "/admin/emergency" },
    { title: "Alerts", href: "/admin/emergency/alerts" },
];

function getPriorityBadgeVariant(priority: string) {
    switch (priority) {
        case "critical":
            return "destructive" as const;
        case "urgent":
            return "default" as const;
        case "advisory":
            return "secondary" as const;
        case "info":
            return "outline" as const;
        default:
            return "outline" as const;
    }
}

function getStatusBadgeVariant(status: string) {
    switch (status) {
        case "active":
            return "default" as const;
        case "draft":
            return "outline" as const;
        case "expired":
            return "secondary" as const;
        case "cancelled":
            return "destructive" as const;
        default:
            return "outline" as const;
    }
}

function getPriorityColor(priority: string) {
    switch (priority) {
        case "critical":
            return "border-l-red-500";
        case "urgent":
            return "border-l-orange-500";
        case "advisory":
            return "border-l-yellow-500";
        case "info":
            return "border-l-blue-500";
        default:
            return "border-l-gray-300";
    }
}

export default function AlertsIndex({ alerts, filters, communities, priorities, statuses }: AlertsIndexProps) {
    const [communityFilter, setCommunityFilter] = useState(filters.community_id || "");
    const [priorityFilter, setPriorityFilter] = useState(filters.priority || "");
    const [statusFilter, setStatusFilter] = useState(filters.status || "");

    const handleFilter = () => {
        router.get(
            route("admin.emergency.alerts.index"),
            {
                community_id: communityFilter || undefined,
                priority: priorityFilter || undefined,
                status: statusFilter || undefined,
            },
            { preserveState: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Emergency Alerts" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-black tracking-tight text-foreground">Emergency Alerts</h1>
                        <p className="text-muted-foreground mt-1">Manage emergency alerts and broadcasts</p>
                    </div>
                    <Link href={route("admin.emergency.alerts.create")}>
                        <Button className="gap-2">
                            <PlusIcon className="h-4 w-4" />
                            New Alert
                        </Button>
                    </Link>
                </div>

                <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="font-display tracking-tight text-base">Filters</CardTitle>
                        <CardDescription>Filter alerts by community, priority, or status</CardDescription>
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
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="All Priorities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Priorities</SelectItem>
                                    {priorities.map((priority) => (
                                        <SelectItem key={priority} value={priority}>
                                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
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
                        <CardTitle className="font-display tracking-tight">Alerts ({alerts.total})</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5">
                        {alerts.data.length === 0 ? (
                            <div className="text-center py-16">
                                <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                                <p className="text-muted-foreground text-lg font-medium">No alerts found</p>
                                <p className="text-muted-foreground text-sm mt-1">Emergency alerts will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {alerts.data.map((alert) => (
                                    <Link
                                        key={alert.id}
                                        href={route("admin.emergency.alerts.show", alert.id)}
                                        className={`group block rounded-xl border border-l-4 ${getPriorityColor(alert.priority)} bg-card p-5 hover:shadow-md transition-all`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    {alert.priority === "critical" && (
                                                        <AlertTriangle className="h-4 w-4 text-red-500" />
                                                    )}
                                                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                        {alert.title}
                                                    </h3>
                                                    <Badge variant={getPriorityBadgeVariant(alert.priority)}>{alert.priority}</Badge>
                                                    <Badge variant={getStatusBadgeVariant(alert.status)}>{alert.status}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{alert.message}</p>
                                                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                                                    <span>{alert.community?.name ?? "All Communities"}</span>
                                                    <span className="capitalize">{alert.category}</span>
                                                    <span>{new Date(alert.created_at).toLocaleString()}</span>
                                                    {alert.expires_at && (
                                                        <span>Expires: {new Date(alert.expires_at).toLocaleString()}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {alerts.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={alerts.current_page === 1}
                                    onClick={() => router.get(route("admin.emergency.alerts.index"), { page: alerts.current_page - 1 })}
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-4 text-sm text-muted-foreground">
                                    Page {alerts.current_page} of {alerts.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={alerts.current_page === alerts.last_page}
                                    onClick={() => router.get(route("admin.emergency.alerts.index"), { page: alerts.current_page + 1 })}
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
