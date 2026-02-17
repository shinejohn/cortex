import { Head, Link, usePage } from "@inertiajs/react";
import { ArrowLeft, User } from "lucide-react";
import Header from "@/components/common/header";
import { QRScanner } from "@/components/check-in/QRScanner";
import { Button } from "@/components/ui/button";

interface ScannerPageProps {
    event: {
        id: string;
        title: string;
        venue?: { name: string };
    };
    checkedIn: number;
    totalTickets: number;
    recentCheckIns: Array<{
        id: string;
        user: { name: string };
        checked_in_at: string;
    }>;
    auth: { user?: { id: string; name: string } };
}

export default function ScannerPage() {
    const { event, checkedIn, totalTickets, recentCheckIns, auth } = usePage<ScannerPageProps>().props;

    return (
        <>
            <Head title={`Check-In Scanner - ${event.title}`} />
            <Header auth={auth} />

            <div className="min-h-screen bg-muted/50">
                <div className="max-w-2xl mx-auto px-4 py-6">
                    <Link
                        href={`/events/${event.id}`}
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Event
                    </Link>

                    <h1 className="text-2xl font-bold text-foreground mb-2">{event.title}</h1>
                    <p className="text-muted-foreground mb-6">{event.venue?.name}</p>

                    <div className="bg-card rounded-lg p-4 mb-6 text-center">
                        <div className="text-3xl font-bold text-primary">
                            {checkedIn} / {totalTickets}
                        </div>
                        <div className="text-sm text-muted-foreground">Checked In</div>
                    </div>

                    <div className="bg-card rounded-lg p-4 mb-6">
                        <h2 className="font-semibold text-foreground mb-4">Scan Ticket</h2>
                        <QRScanner onScan={() => {}} />
                    </div>

                    {recentCheckIns.length > 0 && (
                        <div className="bg-card rounded-lg p-4">
                            <h2 className="font-semibold text-foreground mb-4">Recent Check-Ins</h2>
                            <div className="space-y-2">
                                {recentCheckIns.map((ci) => (
                                    <div
                                        key={ci.id}
                                        className="flex items-center gap-3 py-2 border-b last:border-0"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{ci.user?.name ?? "Guest"}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(ci.checked_in_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
