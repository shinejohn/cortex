import { Head, Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import AlphasiteCrmLayout from "@/layouts/alphasite-crm-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, Zap, Activity, UserPlus, HelpCircle, FileText, Bot } from "lucide-react";

interface Interaction {
    id: string;
    interaction_type: string;
    channel: string;
    outcome: string;
    created_at: string;
    customer?: { first_name?: string; last_name?: string; email?: string };
}

interface Customer {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    health_score: number | null;
}

interface DashboardData {
    total_customers: number;
    new_leads_today: number;
    interactions_today: number;
    ai_handled_rate: number;
    average_health_score: number;
    recent_interactions: Interaction[];
    customers_needing_attention: Customer[];
    call_stats?: Record<string, unknown>;
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
    dashboard: DashboardData;
    fourCallsIntegration: Record<string, unknown> | null;
    subscriptionDetails: Record<string, unknown> | null;
}

function HealthBar({ score }: { score: number | null }) {
    if (score === null) return <span className="text-muted-foreground">—</span>;
    const pct = Math.min(100, Math.max(0, score));
    const color =
        pct < 30 ? "bg-red-500" : pct < 60 ? "bg-amber-500" : "bg-emerald-500";
    return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
                {pct}%
            </span>
        </div>
    );
}

export default function CrmDashboard({
    business,
    subscription,
    dashboard,
    fourCallsIntegration,
}: Props) {
    return (
        <AlphasiteCrmLayout
            business={business}
            subscription={subscription}
            title="Dashboard"
        >
            <Head title={`Dashboard | ${business.name}`} />
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-display font-black tracking-tight text-foreground">
                        Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Overview of your business performance.</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboard.total_customers}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">New Leads Today</CardTitle>
                            <UserPlus className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboard.new_leads_today}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">AI Handled Rate</CardTitle>
                            <Bot className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboard.ai_handled_rate}%</div>
                            <p className="text-xs text-muted-foreground">Last 30 days</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Health Score</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboard.average_health_score.toFixed(1)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                    <Button asChild>
                        <Link href={route("alphasite.crm.customers")}>
                            <UserPlus className="mr-2 h-4 w-4" /> Add Customer
                        </Link>
                    </Button>
                    <Button variant="secondary" asChild>
                        <Link href={route("alphasite.crm.faqs")}>
                            <HelpCircle className="mr-2 h-4 w-4" /> Create FAQ
                        </Link>
                    </Button>
                    <Button variant="secondary" asChild>
                        <Link href={route("alphasite.crm.surveys")}>
                            <FileText className="mr-2 h-4 w-4" /> Send Survey
                        </Link>
                    </Button>
                    <Button variant="secondary" asChild>
                        <Link href={route("alphasite.crm.ai")}>
                            <Bot className="mr-2 h-4 w-4" /> View AI Services
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Interactions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Interactions</CardTitle>
                            <CardDescription>Latest touchpoints with your customers.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {dashboard.recent_interactions.length === 0 ? (
                                    <p className="px-6 py-8 text-muted-foreground text-sm text-center">
                                        No interactions yet.
                                    </p>
                                ) : (
                                    dashboard.recent_interactions.map((i) => (
                                        <div
                                            key={i.id}
                                            className="px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {i.customer
                                                        ? `${i.customer.first_name ?? ""} ${i.customer.last_name ?? ""}`.trim() ||
                                                        i.customer.email ||
                                                        "Unknown"
                                                        : "Anonymous"}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {i.interaction_type} · {i.channel}{" "}
                                                    · {i.outcome}
                                                </p>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(
                                                    i.created_at
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-4 border-t border-border">
                                <Button variant="link" className="p-0 h-auto" asChild>
                                    <Link href={route("alphasite.crm.interactions")}>
                                        View all interactions →
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customers Needing Attention */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customers Needing Attention</CardTitle>
                            <CardDescription>Accounts that may need your help.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {dashboard.customers_needing_attention.length === 0 ? (
                                    <p className="px-6 py-8 text-muted-foreground text-sm text-center">
                                        All customers look healthy.
                                    </p>
                                ) : (
                                    dashboard.customers_needing_attention.map(
                                        (c) => (
                                            <Link
                                                key={c.id}
                                                href={route(
                                                    "alphasite.crm.customer.show",
                                                    c.id
                                                )}
                                                className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">
                                                        {[c.first_name, c.last_name]
                                                            .filter(Boolean)
                                                            .join(" ") || c.email || "Unknown"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {c.email ?? "No email"}
                                                    </p>
                                                </div>
                                                <HealthBar score={c.health_score} />
                                            </Link>
                                        )
                                    )
                                )}
                            </div>
                            <div className="p-4 border-t border-border">
                                <Button variant="link" className="p-0 h-auto" asChild>
                                    <Link href={route("alphasite.crm.customers")}>
                                        View all customers →
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 4Calls Integration */}
                {fourCallsIntegration && (
                    <Card>
                        <CardHeader>
                            <CardTitle>4Calls.ai Integration</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs text-muted-foreground overflow-auto bg-muted p-4 rounded-md">
                                {JSON.stringify(fourCallsIntegration, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AlphasiteCrmLayout>
    );
}
