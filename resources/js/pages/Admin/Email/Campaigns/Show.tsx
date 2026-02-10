import { Head, Link } from "@inertiajs/react";
import { ArrowLeftIcon, Mail, MousePointerClick, Send, TrendingUp, Users } from "lucide-react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

interface EmailCampaign {
    id: number;
    subject: string;
    preview_text: string | null;
    type: string;
    status: string;
    recipients_count: number;
    delivered_count: number;
    opened_count: number;
    clicked_count: number;
    bounced_count: number;
    unsubscribed_count: number;
    open_rate: number;
    click_rate: number;
    scheduled_at: string | null;
    sent_at: string | null;
    created_at: string;
    community: {
        id: number;
        name: string;
    } | null;
    template: {
        id: number;
        name: string;
    } | null;
}

interface EmailCampaignStats {
    open_rate: number;
    click_rate: number;
    bounce_rate: number;
}

interface EmailCampaignShowProps {
    campaign: EmailCampaign;
    stats: EmailCampaignStats;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Email", href: "/admin/email" },
    { title: "Campaigns", href: "/admin/email/campaigns" },
    { title: "Details", href: "#" },
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

function formatNumber(value: number): string {
    return new Intl.NumberFormat("en-US").format(value);
}

export default function EmailCampaignShow({ campaign, stats }: EmailCampaignShowProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Email Campaign: ${campaign.subject}`} />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex items-center gap-4">
                    <Link href={route("admin.email.campaigns.index")}>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                            <ArrowLeftIcon className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="font-display text-3xl font-black tracking-tight text-foreground">{campaign.subject}</h1>
                            <Badge variant={getStatusBadgeVariant(campaign.status)}>
                                {campaign.status === "sending" && <Send className="mr-1 h-3 w-3 animate-pulse" />}
                                {campaign.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            {campaign.community?.name ?? "All Communities"} &middot;{" "}
                            {campaign.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500/10 p-2.5">
                                    <Users className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Recipients</p>
                                    <p className="text-2xl font-bold">{formatNumber(campaign.recipients_count)}</p>
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
                                    <p className="text-sm text-muted-foreground">Open Rate</p>
                                    <p className="text-2xl font-bold">{stats.open_rate}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-purple-500/10 p-2.5">
                                    <MousePointerClick className="h-5 w-5 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Click Rate</p>
                                    <p className="text-2xl font-bold">{stats.click_rate}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-orange-500/10 p-2.5">
                                    <TrendingUp className="h-5 w-5 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Bounce Rate</p>
                                    <p className="text-2xl font-bold">{stats.bounce_rate}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="font-display tracking-tight">Campaign Details</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {campaign.preview_text && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Preview Text</p>
                                    <p className="mt-1 text-foreground">{campaign.preview_text}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                                    <p className="mt-1 text-foreground capitalize">{campaign.type.replace(/_/g, " ")}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Community</p>
                                    <p className="mt-1 text-foreground">{campaign.community?.name ?? "All"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Template</p>
                                    <p className="mt-1 text-foreground">
                                        {campaign.template ? (
                                            <Link
                                                href={route("admin.email.templates.show", campaign.template.id)}
                                                className="text-primary hover:underline"
                                            >
                                                {campaign.template.name}
                                            </Link>
                                        ) : (
                                            "Custom"
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                                    <p className="mt-1 text-foreground">{new Date(campaign.created_at).toLocaleString()}</p>
                                </div>
                                {campaign.scheduled_at && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                                        <p className="mt-1 text-foreground">{new Date(campaign.scheduled_at).toLocaleString()}</p>
                                    </div>
                                )}
                                {campaign.sent_at && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Sent</p>
                                        <p className="mt-1 text-foreground">{new Date(campaign.sent_at).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="font-display tracking-tight">Delivery Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Delivered</span>
                                    <span className="font-medium">{formatNumber(campaign.delivered_count)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Opened</span>
                                    <span className="font-medium">{formatNumber(campaign.opened_count)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Clicked</span>
                                    <span className="font-medium">{formatNumber(campaign.clicked_count)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Bounced</span>
                                    <span className="font-medium">{formatNumber(campaign.bounced_count)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Unsubscribed</span>
                                    <span className="font-medium">{formatNumber(campaign.unsubscribed_count)}</span>
                                </div>
                            </div>

                            {campaign.delivered_count > 0 && (
                                <div className="pt-4 border-t space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-muted-foreground">Open Rate</span>
                                            <span className="font-medium">{stats.open_rate}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(stats.open_rate, 100)}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-muted-foreground">Click Rate</span>
                                            <span className="font-medium">{stats.click_rate}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(stats.click_rate, 100)}%` }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
