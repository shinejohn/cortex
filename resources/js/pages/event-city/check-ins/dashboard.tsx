import { Head, Link, usePage } from "@inertiajs/react";
import { ArrowLeft, User } from "lucide-react";
import Header from "@/components/common/header";
import { Button } from "@/components/ui/button";

interface DashboardPageProps {
    event: {
        id: string;
        title: string;
        venue?: { name: string };
    };
    totalTickets: number;
    checkedIn: number;
    recentCheckIns: Array<{
        id: string;
        user: { name: string };
        checked_in_at: string;
    }>;
    auth: { user?: { id: string; name: string } };
}

export default function CheckInDashboard() {
    const { event, totalTickets, checkedIn, recentCheckIns, auth } = usePage<DashboardPageProps>().props;
    const rate = totalTickets > 0 ? Math.round((checkedIn / totalTickets) * 100) : 0;

    return (
        <>
            <Head title={`Check-In Dashboard - ${event.title}`} />
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

                    <h1 className="text-2xl font-bold text-foreground mb-2">{event.title}</h1>
                    <p className="text-muted-foreground mb-8">{event.venue?.name}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-card rounded-lg p-6 text-center">
                            <div className="text-3xl font-bold text-foreground">{totalTickets}</div>
                            <div className="text-sm text-muted-foreground">Tickets Sold</div>
                        </div>
                        <div className="bg-card rounded-lg p-6 text-center">
                            <div className="text-3xl font-bold text-primary">{checkedIn}</div>
                            <div className="text-sm text-muted-foreground">Checked In</div>
                        </div>
                        <div className="bg-card rounded-lg p-6 text-center">
                            <div className="text-3xl font-bold text-foreground">{rate}%</div>
                            <div className="text-sm text-muted-foreground">Check-In Rate</div>
                        </div>
                    </div>

                    <div className="flex gap-4 mb-8">
                        <Link href={route("events.checkin.scanner", event.id) as string}>
                            <Button>Open Scanner</Button>
                        </Link>
                    </div>

                    <div className="bg-card rounded-lg p-6">
                        <h2 className="font-semibold text-foreground mb-4">Recent Check-Ins</h2>
                        {recentCheckIns.length === 0 ? (
                            <p className="text-muted-foreground">No check-ins yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {recentCheckIns.map((ci) => (
                                    <div
                                        key={ci.id}
                                        className="flex items-center gap-3 py-3 border-b last:border-0"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{ci.user?.name ?? "Guest"}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {new Date(ci.checked_in_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
