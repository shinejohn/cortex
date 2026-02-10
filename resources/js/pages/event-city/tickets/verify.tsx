import { Head } from "@inertiajs/react";
import { AlertTriangleIcon, CalendarIcon, CheckCircle2Icon, MapPinIcon, TicketIcon, XCircleIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/layouts/app-layout";

interface TicketEvent {
    title: string;
    date: string;
    venue: string | null;
}

interface TicketPlan {
    name: string;
    quantity: number;
}

interface TicketOrder {
    id: string;
    purchased_at: string;
}

interface Ticket {
    code: string;
    event: TicketEvent;
    plan: TicketPlan;
    order: TicketOrder;
    qr_code_url: string | null;
}

interface Props {
    valid: boolean;
    message?: string;
    ticket?: Ticket;
}

export default function VerifyTicket({ valid, message, ticket }: Props) {
    return (
        <AppLayout>
            <Head title="Verify Ticket" />
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 max-w-lg">
                    {valid && ticket ? (
                        <>
                            {/* Valid Ticket */}
                            <div className="text-center mb-8">
                                <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                    <CheckCircle2Icon className="size-10 text-green-600 dark:text-green-400" />
                                </div>
                                <h1 className="font-display text-2xl font-black tracking-tight text-green-700 dark:text-green-300">
                                    Valid Ticket
                                </h1>
                                <p className="mt-2 text-muted-foreground">This ticket has been verified successfully.</p>
                            </div>

                            <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                                <CardContent className="p-6 space-y-4">
                                    {/* QR Code */}
                                    {ticket.qr_code_url && (
                                        <div className="flex justify-center">
                                            <img
                                                src={ticket.qr_code_url}
                                                alt="Ticket QR Code"
                                                className="size-40 rounded-lg"
                                            />
                                        </div>
                                    )}

                                    {/* Ticket Code */}
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Ticket Code</p>
                                        <p className="font-mono text-lg font-bold">{ticket.code}</p>
                                    </div>

                                    <Separator />

                                    {/* Event Info */}
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Event</p>
                                            <p className="font-display text-lg font-bold tracking-tight mt-1">{ticket.event.title}</p>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <CalendarIcon className="size-4" />
                                            {new Date(ticket.event.date).toLocaleDateString("en-US", { dateStyle: "full" })}
                                        </div>

                                        {ticket.event.venue && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPinIcon className="size-4" />
                                                {ticket.event.venue}
                                            </div>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* Plan Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Ticket Type</p>
                                            <p className="text-sm font-medium mt-1">{ticket.plan.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Quantity</p>
                                            <p className="text-sm font-medium mt-1">{ticket.plan.quantity}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Order Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Order ID</p>
                                            <p className="text-xs font-mono mt-1">{ticket.order.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Purchased</p>
                                            <p className="text-sm mt-1">
                                                {new Date(ticket.order.purchased_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <>
                            {/* Invalid Ticket */}
                            <div className="text-center mb-8">
                                <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                                    <XCircleIcon className="size-10 text-red-600 dark:text-red-400" />
                                </div>
                                <h1 className="font-display text-2xl font-black tracking-tight text-red-700 dark:text-red-300">
                                    Invalid Ticket
                                </h1>
                                <p className="mt-2 text-muted-foreground">
                                    {message || "This ticket could not be verified."}
                                </p>
                            </div>

                            <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                                <CardContent className="p-6 text-center">
                                    <AlertTriangleIcon className="mx-auto size-8 text-amber-500 mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        The ticket code you scanned or entered is not valid. It may have expired,
                                        been transferred, or does not exist in our system. Please contact support
                                        if you believe this is an error.
                                    </p>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
