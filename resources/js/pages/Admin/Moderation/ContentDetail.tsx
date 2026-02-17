import { Head, Link, useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ContentDetailProps {
    contentType: string;
    contentId: string;
    logs: Array<{
        id: string;
        trigger: string;
        decision: string;
        violation_section: string | null;
        violation_explanation: string | null;
        ai_model: string;
        created_at: string;
        user?: { id: string; name: string; email: string };
    }>;
    complaints: Array<{
        id: string;
        complaint_reason: string;
        review_decision: string | null;
        created_at: string;
        complainant?: { id: string; name: string; email: string };
    }>;
    interventions: Array<{
        id: string;
        trigger_signal: string;
        outcome: string;
        outcome_reason: string;
        created_at: string;
    }>;
}

export default function ContentDetail({
    contentType,
    contentId,
    logs,
    complaints,
    interventions,
}: ContentDetailProps) {
    const { data, setData, post, processing, errors } = useForm({
        action: "approve",
        reason: "",
    });

    const handleOverride = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("daynews.admin.moderation.override", [contentType, contentId]));
    };

    return (
        <>
            <Head title={`Moderation: ${contentType} ${contentId}`} />
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-4xl">
                    <Link href={route("daynews.admin.moderation.index")} className="text-primary hover:underline">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold">
                        {contentType} #{contentId}
                    </h1>

                    <div className="mt-8 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Moderation History</CardTitle>
                                <CardDescription>All moderation events for this content</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {logs.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No moderation logs</p>
                                ) : (
                                    <div className="space-y-4">
                                        {logs.map((log) => (
                                            <div key={log.id} className="border-b pb-4 last:border-0">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={log.decision === "pass" ? "default" : "destructive"}>
                                                        {log.decision}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">{log.trigger}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {new Date(log.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                {log.violation_explanation && (
                                                    <p className="mt-2 text-sm">{log.violation_explanation}</p>
                                                )}
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Model: {log.ai_model} • {log.user?.name ?? "System"}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Complaints</CardTitle>
                                <CardDescription>User complaints filed against this content</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {complaints.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No complaints</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {complaints.map((c) => (
                                            <li key={c.id} className="flex justify-between">
                                                <span>
                                                    {c.complaint_reason} by {c.complainant?.name ?? "Unknown"}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(c.created_at).toLocaleDateString()}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Manual Override</CardTitle>
                                <CardDescription>Admin override for this content</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleOverride} className="space-y-4">
                                    <div>
                                        <Label>Action</Label>
                                        <Select
                                            value={data.action}
                                            onValueChange={(v) => setData("action", v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="approve">Approve / Restore</SelectItem>
                                                <SelectItem value="reject">Reject</SelectItem>
                                                <SelectItem value="remove">Remove from view</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Reason (required)</Label>
                                        <Textarea
                                            value={data.reason}
                                            onChange={(e) => setData("reason", e.target.value)}
                                            placeholder="Explain the override..."
                                            rows={3}
                                            required
                                        />
                                        {errors.reason && (
                                            <p className="mt-1 text-sm text-destructive">{errors.reason}</p>
                                        )}
                                    </div>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? "Applying..." : "Apply Override"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Interventions</CardTitle>
                                <CardDescription>Automated intervention events</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {interventions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No interventions</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {interventions.map((i) => (
                                            <li key={i.id}>
                                                <Badge variant="outline">{i.outcome}</Badge> — {i.outcome_reason}
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                    {new Date(i.created_at).toLocaleString()}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
