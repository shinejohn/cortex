import { Head, Link, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { useEffect, useState } from "react";
import AlphasiteCrmLayout from "@/layouts/alphasite-crm-layout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    ArrowUpRight,
    CheckCircle2,
    ClipboardList,
    Clock,
    Command,
    ExternalLink,
    HelpCircle,
    Info,
    LayoutDashboard,
    MessageSquare,
    Sparkles,
    Users,
    Zap
} from "lucide-react";

interface Metric {
    key: string;
    value: string | number;
    label: string;
    subtitle?: string;
    trend?: "up" | "down" | "neutral";
}

interface AlertType {
    id: string;
    type: "critical" | "warning" | "info";
    title: string;
    message: string;
    action_url?: string;
    action_label?: string;
    created_at: string;
}

interface ActivityItem {
    id: string;
    type: string;
    title: string;
    subtitle?: string;
    created_at: string;
    url?: string;
}

interface QuickAction {
    label: string;
    url: string;
    icon: string;
}

interface CommandCenterData {
    metrics: Record<string, unknown> & {
        total_customers?: number;
        new_leads_today?: number;
        interactions_today?: number;
        interactions_this_week?: number;
        ai_chat_sessions_today?: number;
        ai_handled_rate?: number;
        average_health_score?: number;
        escalated_this_week?: number;
    };
    alerts: AlertType[];
    activity: ActivityItem[];
    quick_actions: QuickAction[];
}

interface Props {
    business: {
        id: string;
        name: string;
        slug: string;
        alphasite_subdomain: string | null;
        subscription_tier: string;
        city: string | null;
        state: string | null;
    };
    subscription: {
        tier: string;
        status: string;
        trial_expires_at: string | null;
        ai_services_enabled: string[];
    } | null;
    commandCenter: CommandCenterData;
    fourCallsIntegration: Record<string, unknown> | null;
}

const REFRESH_INTERVAL_MS = 30_000;

function MetricCard({
    label,
    value,
    subtitle,
}: {
    label: string;
    value: string | number;
    subtitle?: string;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {label}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold font-display tracking-tight">{value}</div>
                {subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {subtitle}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

function AlertItem({ alert }: { alert: AlertType }) {
    const variant = alert.type === "critical" ? "destructive" : "default"; // Shadcn Alert only has default/destructive
    // Custom styling to match design system colors if needed, but sticking to Shadcn props for now where possible.
    // However, the design system has specific colors for warning/info.
    // We can use the className to override or just use standard Alert.

    const iconMap = {
        critical: AlertCircle,
        warning: AlertTriangle,
        info: Info
    };
    const Icon = iconMap[alert.type];

    // Using custom classes to match the specific color requirements from the prompt
    const colorClasses = {
        critical: "bg-red-50 text-red-900 border-red-200 [&>svg]:text-red-900",
        warning: "bg-amber-50 text-amber-900 border-amber-200 [&>svg]:text-amber-900",
        info: "bg-blue-50 text-blue-900 border-blue-200 [&>svg]:text-blue-900"
    };

    return (
        <Alert className={`${colorClasses[alert.type]} border`}>
            <Icon className="h-4 w-4" />
            <div className="flex items-start justify-between w-full">
                <div>
                    <AlertTitle>{alert.title}</AlertTitle>
                    <AlertDescription className="mt-1 opacity-90">
                        {alert.message}
                    </AlertDescription>
                </div>
                {alert.action_url && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 ml-4 bg-white/50 hover:bg-white/80 text-inherit hover:text-inherit border-transparent"
                        asChild
                    >
                        <Link href={alert.action_url}>
                            {alert.action_label ?? "View"}
                        </Link>
                    </Button>
                )}
            </div>
        </Alert>
    );
}

function ActivityItemRow({ item }: { item: ActivityItem }) {
    return (
        <div className="flex items-center justify-between py-4 group">
            <div className="flex items-center gap-4">
                <div className="bg-muted rounded-full p-2 group-hover:bg-primary/10 transition-colors">
                    <Activity className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                        {item.title}
                    </p>
                    {item.subtitle && (
                        <p className="text-xs text-muted-foreground">
                            {item.subtitle}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{formatTimeAgo(item.created_at)}</span>
                {item.url && (
                    <Button variant="ghost" size="icon" className="size-6" asChild>
                        <Link href={item.url}>
                            <ArrowUpRight className="size-3" />
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}

function formatTimeAgo(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

const ICON_MAP: Record<string, any> = {
    "external-link": ExternalLink,
    "help-circle": HelpCircle,
    users: Users,
    "message-square": MessageSquare,
    sparkles: Sparkles,
    "clipboard-list": ClipboardList,
    command: Command,
};

export default function CommandCenter({
    business,
    subscription,
    commandCenter,
}: Props) {
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    useEffect(() => {
        const id = setInterval(() => {
            router.reload({ only: ["commandCenter"] });
            setLastRefresh(new Date());
        }, REFRESH_INTERVAL_MS);
        return () => clearInterval(id);
    }, []);

    const { metrics, alerts, activity, quick_actions } = commandCenter;

    const metricCards: Metric[] = [
        {
            key: "customers",
            value: metrics.total_customers ?? 0,
            label: "Total Customers",
        },
        {
            key: "active_ai",
            value: (metrics.active_ai_employees as number) ?? 0,
            label: "Active AI Agents",
            subtitle: "Working for you",
        },
        {
            key: "leads",
            value: metrics.new_leads_today ?? 0,
            label: "New Leads Today",
        },
        {
            key: "interactions",
            value: metrics.interactions_today ?? 0,
            label: "Interactions Today",
            subtitle: `${metrics.interactions_this_week ?? 0} this week`,
        },
        {
            key: "ai_sessions",
            value: metrics.ai_chat_sessions_today ?? 0,
            label: "AI Chat Sessions Today",
        },
        {
            key: "ai_rate",
            value: `${metrics.ai_handled_rate ?? 0}%`,
            label: "AI Handled Rate",
            subtitle: "Last 30 days",
        },
        {
            key: "health",
            value: metrics.average_health_score ?? "—",
            label: "Avg Health Score",
        },
        {
            key: "escalated",
            value: metrics.escalated_this_week ?? 0,
            label: "Escalated This Week",
        },
    ];

    return (
        <AlphasiteCrmLayout
            business={business}
            subscription={subscription}
            title="Command Center"
        >
            <Head title={`Command Center | ${business.name}`} />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-black tracking-tight text-foreground">
                            Executive Command Center
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Real-time metrics and alerts for {business.name}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                            Auto-refresh: 30s
                        </span>
                        <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5"
                            title={`Last refresh: ${lastRefresh.toLocaleTimeString()}`}
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Live
                        </Badge>
                    </div>
                </div>

                {/* Alerts */}
                {alerts.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-display font-bold tracking-tight">
                            Alerts
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                            {alerts.map((alert) => (
                                <AlertItem key={alert.id} alert={alert} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Metrics */}
                <div>
                    <h2 className="text-lg font-display font-bold tracking-tight mb-4">
                        Metrics
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                        {metricCards.map((m) => (
                            <MetricCard
                                key={m.key}
                                label={m.label}
                                value={m.value}
                                subtitle={m.subtitle}
                            />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Quick Actions */}
                    <div className="lg:col-span-1">
                        <h2 className="text-lg font-display font-bold tracking-tight mb-4">
                            Quick Actions
                        </h2>
                        <div className="space-y-2">
                            {quick_actions.map((action) => {
                                const isExternal = action.url.startsWith("http");
                                const Icon = ICON_MAP[action.icon] ?? Zap;
                                return (
                                    <Button
                                        key={action.label}
                                        variant="outline"
                                        className="w-full justify-start h-auto py-3 px-4 font-normal"
                                        asChild
                                    >
                                        <a
                                            href={action.url}
                                            target={isExternal ? "_blank" : undefined}
                                            rel={isExternal ? "noopener noreferrer" : undefined}
                                        >
                                            <Icon className="mr-3 size-5 text-muted-foreground" />
                                            <span className="font-medium">
                                                {action.label}
                                            </span>
                                            {isExternal && (
                                                <ArrowUpRight className="ml-auto size-3 text-muted-foreground" />
                                            )}
                                        </a>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-display font-bold tracking-tight">
                                Recent Activity
                            </h2>
                            <Button variant="link" size="sm" className="h-auto p-0 text-primary" asChild>
                                <Link href={route("alphasite.crm.interactions") as string}>
                                    View all →
                                </Link>
                            </Button>
                        </div>
                        <Card>
                            <CardContent className="p-0">
                                {activity.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Clock className="size-10 text-muted-foreground/30 mb-3" />
                                        <p className="text-sm text-muted-foreground">
                                            No recent activity.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y px-6">
                                        {activity.map((item) => (
                                            <ActivityItemRow
                                                key={item.id}
                                                item={item}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AlphasiteCrmLayout>
    );
}
