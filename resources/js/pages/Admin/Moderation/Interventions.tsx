import { Head, Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InterventionsProps {
    interventions: {
        data: Array<{
            id: string;
            content_type: string;
            content_id: string;
            trigger_signal: string;
            outcome: string;
            outcome_reason: string;
            civil_discourse_ratio: number;
            created_at: string;
        }>;
    };
}

export default function Interventions({ interventions }: InterventionsProps) {
    return (
        <>
            <Head title="Moderation Interventions" />
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-6xl">
                    <Link href={route("daynews.admin.moderation.index")} className="text-primary hover:underline">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold">Interventions</h1>
                    <p className="mt-1 text-muted-foreground">Automated intervention events</p>

                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Intervention Log</CardTitle>
                            <CardDescription>Content that triggered intervention thresholds</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {interventions.data.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No interventions</p>
                            ) : (
                                <div className="space-y-4">
                                    {interventions.data.map((i) => (
                                        <div
                                            key={i.id}
                                            className="flex items-center justify-between border-b pb-4 last:border-0"
                                        >
                                            <div>
                                                <Link
                                                    href={route("daynews.admin.moderation.show", [
                                                        i.content_type,
                                                        i.content_id,
                                                    ])}
                                                    className="font-medium hover:underline"
                                                >
                                                    {i.content_type} #{i.content_id}
                                                </Link>
                                                <p className="text-sm text-muted-foreground">{i.outcome_reason}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Signal: {i.trigger_signal} • CDR:{" "}
                                                    {(Number(i.civil_discourse_ratio) * 100).toFixed(0)}% •{" "}
                                                    {new Date(i.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={
                                                    i.outcome === "content_protected"
                                                        ? "default"
                                                        : i.outcome === "removed_from_view"
                                                          ? "destructive"
                                                          : "secondary"
                                                }
                                            >
                                                {i.outcome}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
