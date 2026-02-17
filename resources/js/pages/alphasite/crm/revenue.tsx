import { Head, Link } from "@inertiajs/react";
import AlphasiteCrmLayout from "@/layouts/alphasite-crm-layout";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { route } from "ziggy-js";
import {
    DollarSign,
    Users,
    MessageSquare,
    Zap,
    TrendingUp,
    ArrowUpRight
} from "lucide-react";

interface Props {
    business: any;
    subscription: any;
    metrics: {
        dates: string[];
        interactions: number[];
        leads: number[];
        revenue: number[];
        ai_tasks: number[];
    };
    period: string;
}

export default function RevenueAnalytics({ business, subscription, metrics, period }: Props) {
    const periods = [
        { id: "7d", label: "7 Days" },
        { id: "30d", label: "30 Days" },
        { id: "90d", label: "90 Days" },
        { id: "ytd", label: "YTD" },
    ];

    return (
        <AlphasiteCrmLayout business={business} subscription={subscription} title="Financial Analytics">
            <Head title={`Revenue & Analytics | ${business.name}`} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-black tracking-tight text-foreground">Revenue & Analytics</h1>
                    <p className="text-sm text-muted-foreground mt-1">Deep dive into your business performance.</p>
                </div>
                <div className="flex bg-muted rounded-lg p-1 self-start">
                    {periods.map((p) => (
                        <Link
                            key={p.id}
                            href={route("alphasite.crm.revenue", { period: p.id }) as string}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${period === p.id
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                }`}
                        >
                            {p.label}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Total Revenue"
                    value="$0.00"
                    icon={DollarSign}
                />
                <MetricCard
                    title="New Leads"
                    value={metrics.leads.reduce((a, b) => a + b, 0)}
                    icon={Users}
                />
                <MetricCard
                    title="Total Interactions"
                    value={metrics.interactions.reduce((a, b) => a + b, 0)}
                    icon={MessageSquare}
                />
                <MetricCard
                    title="AI Tasks Completed"
                    value={metrics.ai_tasks.reduce((a, b) => a + b, 0)}
                    icon={Zap}
                />
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Traffic & Conversions</CardTitle>
                    <CardDescription>Visualizing performance over the last {periods.find(p => p.id === period)?.label}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80 flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/20">
                        <div className="text-center space-y-2">
                            <TrendingUp className="size-8 text-muted-foreground/30 mx-auto" />
                            <p className="text-muted-foreground">Chart Visualization Placeholder ({period})</p>
                        </div>
                        {/* In a real implementation, use Recharts or Chart.js here with `metrics` prop */}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <BreakdownItem label="Subscriptions" value="$0.00" percent={0} />
                        <BreakdownItem label="One-time Sales" value="$0.00" percent={0} />
                        <BreakdownItem label="Consultations" value="$0.00" percent={0} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Lead Sources</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <BreakdownItem label="Alphasite Chat (AI)" value="-- leads" percent={0} />
                        <BreakdownItem label="Contact Form" value="-- leads" percent={0} />
                        <BreakdownItem label="Phone Calls" value="-- calls" percent={0} />
                    </CardContent>
                </Card>
            </div>
        </AlphasiteCrmLayout>
    );
}

function MetricCard({ title, value, icon: Icon }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold font-display tracking-tight">{value}</div>
            </CardContent>
        </Card>
    );
}

function BreakdownItem({ label, value, percent }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-foreground font-bold tabular-nums">{value}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${percent}%` }}></div>
            </div>
        </div>
    );
}
