import { Head, Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsProps {
    dateRange: string;
}

export default function Analytics({ dateRange }: AnalyticsProps) {
    return (
        <>
            <Head title="Moderation Analytics" />
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-6xl">
                    <Link href={route("daynews.admin.moderation.index")} className="text-primary hover:underline">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold">Moderation Analytics</h1>
                    <p className="mt-1 text-muted-foreground">
                        Trend charts: fail rate over time, volume, model performance
                    </p>

                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Analytics</CardTitle>
                            <CardDescription>
                                Date range: {dateRange}. Charts and trend data can be added here.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Analytics dashboard placeholder. Integrate with your preferred charting library
                                (e.g. Recharts) to display fail rate over time, volume by content type, and
                                model performance metrics.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
