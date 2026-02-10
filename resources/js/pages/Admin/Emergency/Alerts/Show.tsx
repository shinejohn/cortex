import { Head, Link, router } from "@inertiajs/react";
import {
    AlertTriangle,
    ArrowLeftIcon,
    Clock,
    ExternalLink,
    Mail,
    MessageSquare,
    Play,
    Send,
    Shield,
    Smartphone,
    User,
    XCircle,
} from "lucide-react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

interface EmergencyAlert {
    id: number;
    title: string;
    priority: string;
    category: string;
    status: string;
    message: string;
    instructions: string | null;
    source: string | null;
    source_url: string | null;
    channels: string[];
    expires_at: string | null;
    published_at: string | null;
    cancelled_at: string | null;
    created_at: string;
    updated_at: string;
    community: {
        id: number;
        name: string;
    } | null;
    creator: {
        id: number;
        name: string;
    } | null;
    municipal_partner: {
        id: number;
        name: string;
    } | null;
}

interface DeliveryStats {
    total_subscribers: number;
    email_sent: number;
    email_delivered: number;
    sms_sent: number;
    sms_delivered: number;
}

interface AuditLog {
    id: number;
    action: string;
    description: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
    } | null;
}

interface AlertShowProps {
    alert: EmergencyAlert;
    deliveryStats: DeliveryStats;
    auditLog: AuditLog[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Emergency", href: "/admin/emergency" },
    { title: "Alerts", href: "/admin/emergency/alerts" },
    { title: "Details", href: "#" },
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

function getPriorityBgClass(priority: string) {
    switch (priority) {
        case "critical":
            return "bg-red-500/10 border-red-500/20";
        case "urgent":
            return "bg-orange-500/10 border-orange-500/20";
        case "advisory":
            return "bg-yellow-500/10 border-yellow-500/20";
        case "info":
            return "bg-blue-500/10 border-blue-500/20";
        default:
            return "bg-muted/30";
    }
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat("en-US").format(value);
}

export default function AlertShow({ alert, deliveryStats, auditLog }: AlertShowProps) {
    const handlePublish = () => {
        router.post(route("admin.emergency.alerts.publish", alert.id), {}, { preserveScroll: true });
    };

    const handleCancel = () => {
        if (confirm("Are you sure you want to cancel this alert?")) {
            router.post(route("admin.emergency.alerts.cancel", alert.id), {}, { preserveScroll: true });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Alert: ${alert.title}`} />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route("admin.emergency.alerts.index")}>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                                <ArrowLeftIcon className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                {alert.priority === "critical" && <AlertTriangle className="h-6 w-6 text-red-500" />}
                                <h1 className="font-display text-3xl font-black tracking-tight text-foreground">{alert.title}</h1>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant={getPriorityBadgeVariant(alert.priority)}>{alert.priority}</Badge>
                                <Badge variant={getStatusBadgeVariant(alert.status)}>{alert.status}</Badge>
                                <span className="text-sm text-muted-foreground capitalize">{alert.category}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {alert.status === "draft" && (
                            <Button onClick={handlePublish} className="gap-2">
                                <Play className="h-4 w-4" />
                                Publish
                            </Button>
                        )}
                        {["draft", "active"].includes(alert.status) && (
                            <Button variant="destructive" onClick={handleCancel} className="gap-2">
                                <XCircle className="h-4 w-4" />
                                Cancel Alert
                            </Button>
                        )}
                    </div>
                </div>

                <Card className={`overflow-hidden border shadow-sm ${getPriorityBgClass(alert.priority)}`}>
                    <CardContent className="pt-6 space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Message</p>
                            <p className="text-foreground text-lg">{alert.message}</p>
                        </div>
                        {alert.instructions && (
                            <div className="rounded-lg bg-background/80 p-4 border">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Instructions</p>
                                <p className="text-foreground font-medium">{alert.instructions}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500/10 p-2.5">
                                    <Send className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Subscribers</p>
                                    <p className="text-2xl font-bold">{formatNumber(deliveryStats.total_subscribers)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-green-500/10 p-2.5">
                                    <Mail className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email Delivered</p>
                                    <p className="text-2xl font-bold">
                                        {formatNumber(deliveryStats.email_delivered)}/{formatNumber(deliveryStats.email_sent)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-purple-500/10 p-2.5">
                                    <Smartphone className="h-5 w-5 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">SMS Delivered</p>
                                    <p className="text-2xl font-bold">
                                        {formatNumber(deliveryStats.sms_delivered)}/{formatNumber(deliveryStats.sms_sent)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-orange-500/10 p-2.5">
                                    <Shield className="h-5 w-5 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Channels</p>
                                    <p className="text-lg font-bold capitalize">{alert.channels?.join(", ") || "None"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="font-display tracking-tight">Alert Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Community</p>
                                    <p className="mt-1 text-foreground">{alert.community?.name ?? "All"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                                    <p className="mt-1 text-foreground capitalize">{alert.category}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5" />
                                        Created By
                                    </p>
                                    <p className="mt-1 text-foreground">{alert.creator?.name ?? "System"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        Created
                                    </p>
                                    <p className="mt-1 text-foreground">{new Date(alert.created_at).toLocaleString()}</p>
                                </div>
                                {alert.published_at && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Published</p>
                                        <p className="mt-1 text-foreground">{new Date(alert.published_at).toLocaleString()}</p>
                                    </div>
                                )}
                                {alert.expires_at && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Expires</p>
                                        <p className="mt-1 text-foreground">{new Date(alert.expires_at).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                            {alert.source && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Source</p>
                                    <p className="mt-1 text-foreground">
                                        {alert.source}
                                        {alert.source_url && (
                                            <>
                                                {" "}
                                                <a
                                                    href={alert.source_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline inline-flex items-center gap-1"
                                                >
                                                    View Source
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </>
                                        )}
                                    </p>
                                </div>
                            )}
                            {alert.municipal_partner && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Municipal Partner</p>
                                    <p className="mt-1 text-foreground">{alert.municipal_partner.name}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                <CardTitle className="font-display tracking-tight">Audit Log</CardTitle>
                            </div>
                            <CardDescription>Recent activity for this alert</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {auditLog && auditLog.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Action</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {auditLog.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell>
                                                    <span className="capitalize font-medium">{log.action.replace(/_/g, " ")}</span>
                                                    {log.description && (
                                                        <p className="text-xs text-muted-foreground mt-0.5">{log.description}</p>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{log.user?.name ?? "System"}</TableCell>
                                                <TableCell className="text-muted-foreground text-xs">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground text-sm">No audit log entries.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
