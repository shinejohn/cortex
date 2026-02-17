import { Head, Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ComplaintsProps {
    complaints: {
        data: Array<{
            id: string;
            content_type: string;
            content_id: string;
            complaint_reason: string;
            complaint_type: string;
            review_decision: string | null;
            created_at: string;
            complainant?: { id: string; name: string; email: string };
        }>;
    };
}

export default function Complaints({ complaints }: ComplaintsProps) {
    return (
        <>
            <Head title="Moderation Complaints" />
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-6xl">
                    <Link href={route("daynews.admin.moderation.index")} className="text-primary hover:underline">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold">Complaints</h1>
                    <p className="mt-1 text-muted-foreground">All user complaints and creator appeals</p>

                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Complaint List</CardTitle>
                            <CardDescription>Filterable list of all complaints</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {complaints.data.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No complaints</p>
                            ) : (
                                <div className="space-y-4">
                                    {complaints.data.map((c) => (
                                        <div
                                            key={c.id}
                                            className="flex items-center justify-between border-b pb-4 last:border-0"
                                        >
                                            <div>
                                                <Link
                                                    href={route("daynews.admin.moderation.show", [
                                                        c.content_type,
                                                        c.content_id,
                                                    ])}
                                                    className="font-medium hover:underline"
                                                >
                                                    {c.content_type} #{c.content_id}
                                                </Link>
                                                <p className="text-sm text-muted-foreground">
                                                    {c.complaint_reason} • {c.complainant?.name ?? "Unknown"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(c.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            <Badge variant={c.review_decision ? "secondary" : "outline"}>
                                                {c.review_decision ?? "Pending"}
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
