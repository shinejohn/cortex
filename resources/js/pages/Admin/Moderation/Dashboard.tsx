import { Head, Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardProps {
    stats: {
        total_moderated: number;
        total_passed: number;
        total_failed: number;
        fail_rate: number;
        total_complaints: number;
        active_interventions: number;
        ai_failures: number;
    };
    violationBreakdown: Array<{ violation_section: string | null; count: number }>;
    recentFailures: {
        data: Array<{
            id: string;
            content_type: string;
            content_id: string;
            violation_section: string | null;
            violation_explanation: string | null;
            created_at: string;
            user?: { id: string; name: string; email: string };
        }>;
        links: unknown[];
    };
    contentTypeBreakdown: Array<{ content_type: string; decision: string; count: number }>;
    dateRange: string;
}

export default function ModerationDashboard({
    stats,
    violationBreakdown,
    recentFailures,
    contentTypeBreakdown,
    dateRange,
}: DashboardProps) {
    return (
        <>
            <Head title="Moderation Dashboard" />
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Content Moderation Dashboard</h1>
                        <p className="mt-1 text-muted-foreground">
                            Oversight and analytics for automated content moderation
                        </p>
                    </div>

                    <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Moderated</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_moderated}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.total_moderated > 0
                                        ? (100 - stats.fail_rate).toFixed(1)
                                        : 0}
                                    %
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.total_passed} passed / {stats.total_failed} failed
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Complaints</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_complaints}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Active Interventions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.active_interventions}</div>
                                {stats.ai_failures > 0 && (
                                    <p className="text-xs text-amber-600">
                                        {stats.ai_failures} AI failures (fail-open)
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Violation Breakdown</CardTitle>
                                <CardDescription>Top violation categories</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {violationBreakdown.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No violations in this period</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {violationBreakdown.map((v) => (
                                            <li key={v.violation_section ?? "null"} className="flex justify-between">
                                                <span>{v.violation_section ?? "Unspecified"}</span>
                                                <Badge variant="secondary">{v.count}</Badge>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Content Type Breakdown</CardTitle>
                                <CardDescription>Pass/fail by content type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {contentTypeBreakdown.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No data in this period</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {contentTypeBreakdown.map((c) => (
                                            <li key={`${c.content_type}-${c.decision}`} className="flex justify-between">
                                                <span>
                                                    {c.content_type} — {c.decision}
                                                </span>
                                                <Badge variant={c.decision === "pass" ? "default" : "destructive"}>
                                                    {c.count}
                                                </Badge>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Recent Failures</CardTitle>
                            <CardDescription>Latest moderation rejections</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentFailures.data.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No failures in this period</p>
                            ) : (
                                <div className="space-y-4">
                                    {recentFailures.data.map((log) => (
                                        <div
                                            key={log.id}
                                            className="flex items-start justify-between border-b pb-4 last:border-0"
                                        >
                                            <div>
                                                <Link
                                                    href={route("daynews.admin.moderation.show", [
                                                        log.content_type,
                                                        log.content_id,
                                                    ])}
                                                    className="font-medium hover:underline"
                                                >
                                                    {log.content_type} #{log.content_id}
                                                </Link>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {log.violation_explanation ?? log.violation_section ?? "Policy violation"}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {log.user?.name ?? "System"} •{" "}
                                                    {new Date(log.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            <Badge variant="destructive">{log.violation_section ?? "—"}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex gap-4">
                        <Link href={route("daynews.admin.moderation.complaints")}>
                            <span className="text-primary hover:underline">View all complaints →</span>
                        </Link>
                        <Link href={route("daynews.admin.moderation.interventions")}>
                            <span className="text-primary hover:underline">View interventions →</span>
                        </Link>
                        <Link href={route("daynews.admin.moderation.analytics")}>
                            <span className="text-primary hover:underline">Analytics →</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
