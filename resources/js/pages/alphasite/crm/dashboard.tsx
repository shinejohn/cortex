import { Head, Link } from "@inertiajs/react";
import {
    Users,
    MessageSquare,
    TrendingUp,
    Phone,
    Star,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Bot,
    HelpCircle,
    ClipboardList,
} from "lucide-react";
import Layout from "@/layouts/layout";

interface Business {
    id: string;
    name: string;
    slug: string;
}

interface DashboardStats {
    total_customers: number;
    new_customers_this_month: number;
    total_interactions: number;
    interactions_this_month: number;
    average_rating: number;
    total_reviews: number;
    total_faqs: number;
    total_surveys: number;
    customer_growth_percent?: number;
    interaction_growth_percent?: number;
}

interface CallStats {
    total_calls: number;
    answered_calls: number;
    missed_calls: number;
    avg_duration_seconds: number;
}

interface FourCallsIntegration {
    is_active: boolean;
    phone_number?: string;
    stats?: CallStats;
}

interface Subscription {
    plan: string;
    status: string;
    current_period_end?: string;
    features?: string[];
}

interface DashboardData {
    stats: DashboardStats;
    recent_customers: Array<{
        id: string;
        name: string;
        email?: string;
        created_at: string;
    }>;
    recent_interactions: Array<{
        id: string;
        type: string;
        summary: string;
        created_at: string;
        customer_name?: string;
    }>;
    call_stats?: CallStats;
}

interface Props {
    business: Business;
    dashboard: DashboardData;
    fourCallsIntegration?: FourCallsIntegration | null;
    subscription?: Subscription | null;
}

function StatCard({
    label,
    value,
    icon: Icon,
    changePercent,
    href,
}: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    changePercent?: number;
    href?: string;
}) {
    const content = (
        <div className="bg-card rounded-2xl border-none shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
                {changePercent !== undefined && (
                    <span
                        className={`inline-flex items-center gap-0.5 text-sm font-medium ${
                            changePercent >= 0 ? "text-emerald-600" : "text-red-500"
                        }`}
                    >
                        {changePercent >= 0 ? (
                            <ArrowUpRight className="h-4 w-4" />
                        ) : (
                            <ArrowDownRight className="h-4 w-4" />
                        )}
                        {Math.abs(changePercent)}%
                    </span>
                )}
            </div>
            <div className="text-3xl font-black tracking-tight text-foreground">{value}</div>
            <div className="text-sm text-muted-foreground font-medium mt-1">{label}</div>
        </div>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return content;
}

export default function CrmDashboard({ business, dashboard, fourCallsIntegration, subscription }: Props) {
    const stats = dashboard.stats;

    return (
        <Layout>
            <Head>
                <title>CRM Dashboard - {business.name} - AlphaSite</title>
            </Head>

            <div className="min-h-screen bg-muted/30">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-12 lg:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="font-display text-3xl lg:text-4xl font-black tracking-tight">CRM Dashboard</h1>
                                <p className="text-blue-100/90 mt-2">{business.name}</p>
                            </div>
                            {subscription && (
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                                    <Activity className="h-4 w-4" />
                                    {subscription.plan} Plan
                                    <span
                                        className={`inline-block h-2 w-2 rounded-full ${
                                            subscription.status === "active" ? "bg-emerald-400" : "bg-yellow-400"
                                        }`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            label="Total Customers"
                            value={stats.total_customers?.toLocaleString() ?? 0}
                            icon={Users}
                            changePercent={stats.customer_growth_percent}
                            href="/crm/customers"
                        />
                        <StatCard
                            label="Interactions"
                            value={stats.total_interactions?.toLocaleString() ?? 0}
                            icon={MessageSquare}
                            changePercent={stats.interaction_growth_percent}
                            href="/crm/interactions"
                        />
                        <StatCard
                            label="Average Rating"
                            value={stats.average_rating ? stats.average_rating.toFixed(1) : "N/A"}
                            icon={Star}
                        />
                        <StatCard label="Total Reviews" value={stats.total_reviews?.toLocaleString() ?? 0} icon={TrendingUp} />
                    </div>

                    {/* 4Calls Integration + Quick Links */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Call Stats */}
                        {fourCallsIntegration?.is_active && dashboard.call_stats && (
                            <div className="bg-card rounded-2xl border-none shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950">
                                        <Phone className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">AI Phone Calls</h3>
                                        <p className="text-xs text-muted-foreground">Powered by 4Calls.ai</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-2xl font-bold text-foreground">
                                            {dashboard.call_stats.total_calls}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Total Calls</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-foreground">
                                            {dashboard.call_stats.answered_calls}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Answered</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-foreground">
                                            {dashboard.call_stats.missed_calls}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Missed</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-foreground">
                                            {dashboard.call_stats.avg_duration_seconds
                                                ? `${Math.round(dashboard.call_stats.avg_duration_seconds / 60)}m`
                                                : "N/A"}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Avg Duration</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Links */}
                        <div className={`bg-card rounded-2xl border-none shadow-sm p-6 ${fourCallsIntegration?.is_active ? "" : "lg:col-span-1"}`}>
                            <h3 className="font-semibold text-foreground mb-5">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link
                                    href="/crm/customers"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                                >
                                    <Users className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium">Manage Customers</span>
                                </Link>
                                <Link
                                    href="/crm/interactions"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                                >
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium">View Interactions</span>
                                </Link>
                                <Link
                                    href="/crm/faqs"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                                >
                                    <HelpCircle className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium">Manage FAQs</span>
                                </Link>
                                <Link
                                    href="/crm/surveys"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                                >
                                    <ClipboardList className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium">Surveys</span>
                                </Link>
                                <Link
                                    href="/crm/ai-services"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                                >
                                    <Bot className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium">AI Services</span>
                                </Link>
                            </div>
                        </div>

                        {/* Mini Stats */}
                        <div className="bg-card rounded-2xl border-none shadow-sm p-6">
                            <h3 className="font-semibold text-foreground mb-5">Content Overview</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b last:border-0">
                                    <div className="flex items-center gap-3">
                                        <HelpCircle className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-sm font-medium text-foreground">FAQs</span>
                                    </div>
                                    <span className="text-lg font-bold text-foreground">{stats.total_faqs ?? 0}</span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b last:border-0">
                                    <div className="flex items-center gap-3">
                                        <ClipboardList className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-sm font-medium text-foreground">Surveys</span>
                                    </div>
                                    <span className="text-lg font-bold text-foreground">{stats.total_surveys ?? 0}</span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b last:border-0">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-sm font-medium text-foreground">New This Month</span>
                                    </div>
                                    <span className="text-lg font-bold text-foreground">
                                        {stats.new_customers_this_month ?? 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Customers */}
                        <div className="bg-card rounded-2xl border-none shadow-sm p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-semibold text-foreground">Recent Customers</h3>
                                <Link href="/crm/customers" className="text-sm text-primary font-medium hover:underline">
                                    View all
                                </Link>
                            </div>
                            {dashboard.recent_customers && dashboard.recent_customers.length > 0 ? (
                                <div className="space-y-3">
                                    {dashboard.recent_customers.map((customer) => (
                                        <Link
                                            key={customer.id}
                                            href={`/crm/customers/${customer.id}`}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                                        >
                                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                                {customer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-foreground truncate">
                                                    {customer.name}
                                                </div>
                                                {customer.email && (
                                                    <div className="text-xs text-muted-foreground truncate">{customer.email}</div>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(customer.created_at).toLocaleDateString()}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">No customers yet</p>
                            )}
                        </div>

                        {/* Recent Interactions */}
                        <div className="bg-card rounded-2xl border-none shadow-sm p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-semibold text-foreground">Recent Interactions</h3>
                                <Link href="/crm/interactions" className="text-sm text-primary font-medium hover:underline">
                                    View all
                                </Link>
                            </div>
                            {dashboard.recent_interactions && dashboard.recent_interactions.length > 0 ? (
                                <div className="space-y-3">
                                    {dashboard.recent_interactions.map((interaction) => (
                                        <div key={interaction.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                                            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-muted shrink-0">
                                                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-xs font-medium text-primary capitalize">
                                                        {interaction.type}
                                                    </span>
                                                    {interaction.customer_name && (
                                                        <span className="text-xs text-muted-foreground">
                                                            - {interaction.customer_name}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-foreground truncate">{interaction.summary}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(interaction.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">No interactions yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
