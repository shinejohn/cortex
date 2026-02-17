import { Head, Link, usePage } from "@inertiajs/react";
import { ArrowLeft, Download, DollarSign, Ticket, Users } from "lucide-react";
import Header from "@/components/common/header";

interface EventReportPageProps {
    event: { id: string; title: string; venue?: { name: string } };
    report: {
        ticket_sales: { total_sold: number; revenue: number; by_plan: Array<{ name: string; sold: number; total: number; revenue: number }> };
        attendance: { checked_in: number; total_tickets: number; rate: number };
        engagement: { saves: number; shares: number; follows: number };
    };
    auth: { user?: unknown };
}

export default function EventReportPage() {
    const { event, report, auth } = usePage<EventReportPageProps>().props;

    return (
        <>
            <Head title={`Event Report - ${event.title}`} />
            <Header auth={auth} />

            <div className="min-h-screen bg-muted/50">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <Link
                        href={`/events/${event.id}`}
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Event
                    </Link>

                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
                            <p className="text-muted-foreground">{event.venue?.name}</p>
                        </div>
                        <a
                            href={route("events.report.export", event.id) as string}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-card rounded-lg p-6">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <Ticket className="h-5 w-5" />
                                <span>Tickets Sold</span>
                            </div>
                            <div className="text-2xl font-bold">{report.ticket_sales.total_sold}</div>
                        </div>
                        <div className="bg-card rounded-lg p-6">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <DollarSign className="h-5 w-5" />
                                <span>Revenue</span>
                            </div>
                            <div className="text-2xl font-bold">${Number(report.ticket_sales.revenue).toFixed(2)}</div>
                        </div>
                        <div className="bg-card rounded-lg p-6">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <Users className="h-5 w-5" />
                                <span>Check-In Rate</span>
                            </div>
                            <div className="text-2xl font-bold">{report.attendance.rate}%</div>
                        </div>
                    </div>

                    <div className="bg-card rounded-lg p-6 mb-6">
                        <h2 className="font-semibold text-foreground mb-4">Attendance</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Checked In</div>
                                <div className="text-xl font-semibold">{report.attendance.checked_in}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Total Tickets</div>
                                <div className="text-xl font-semibold">{report.attendance.total_tickets}</div>
                            </div>
                        </div>
                    </div>

                    {report.ticket_sales.by_plan.length > 0 && (
                        <div className="bg-card rounded-lg p-6 mb-6">
                            <h2 className="font-semibold text-foreground mb-4">Sales by Plan</h2>
                            <div className="space-y-3">
                                {report.ticket_sales.by_plan.map((plan) => (
                                    <div key={plan.name} className="flex justify-between items-center py-2 border-b last:border-0">
                                        <span>{plan.name}</span>
                                        <span>
                                            {plan.sold} / {plan.total} (${Number(plan.revenue).toFixed(2)})
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-card rounded-lg p-6">
                        <h2 className="font-semibold text-foreground mb-4">Engagement</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Saves</div>
                                <div className="text-xl font-semibold">{report.engagement.saves}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Share Clicks</div>
                                <div className="text-xl font-semibold">{report.engagement.shares}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Follows</div>
                                <div className="text-xl font-semibold">{report.engagement.follows}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
