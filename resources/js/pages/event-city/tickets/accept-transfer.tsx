import { Head, Link, router } from "@inertiajs/react";
import { CheckCircleIcon, TicketIcon, UserIcon } from "lucide-react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";

interface Event {
    id: string;
    title: string;
    event_date: string;
    venue?: { name: string };
}

interface TicketPlan {
    id: string;
    name: string;
}

interface TicketOrder {
    id: string;
    event: Event;
}

interface TicketOrderItem {
    id: string;
    quantity: number;
    ticketPlan: TicketPlan;
    ticketOrder: TicketOrder;
}

interface User {
    id: string;
    name: string;
    email: string;
}

interface Transfer {
    id: string;
    transfer_token: string;
    to_email: string;
    message: string | null;
    expires_at: string | null;
    ticketOrderItem: TicketOrderItem;
    fromUser: User;
}

interface Props {
    transfer: Transfer;
}

export default function AcceptTransfer({ transfer }: Props) {
    const event = transfer.ticketOrderItem?.ticketOrder?.event;

    const handleAccept = () => {
        router.post(route("tickets.transfer.complete", transfer.id) as string);
    };

    return (
        <AppLayout>
            <Head title="Accept Ticket Transfer" />
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 max-w-lg">
                    <div className="text-center mb-8">
                        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                            <TicketIcon className="size-8 text-primary" />
                        </div>
                        <h1 className="font-display text-2xl font-black tracking-tight">
                            Ticket Transfer
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            {transfer.fromUser?.name} wants to transfer a ticket to you.
                        </p>
                    </div>

                    <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm mb-6">
                        <CardContent className="p-6 space-y-4">
                            {/* From */}
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-muted p-2">
                                    <UserIcon className="size-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">From</p>
                                    <p className="text-sm font-medium">{transfer.fromUser?.name}</p>
                                </div>
                            </div>

                            {/* Event */}
                            <div className="rounded-lg bg-muted/50 p-4">
                                <h3 className="font-display text-lg font-bold tracking-tight">
                                    {event?.title || "Event Ticket"}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {transfer.ticketOrderItem?.ticketPlan?.name}
                                </p>
                                {event?.event_date && (
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(event.event_date).toLocaleDateString("en-US", { dateStyle: "long" })}
                                    </p>
                                )}
                                {event?.venue?.name && (
                                    <p className="text-sm text-muted-foreground">{event.venue.name}</p>
                                )}
                            </div>

                            {/* Message */}
                            {transfer.message && (
                                <div className="rounded-lg border p-4">
                                    <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-1">Message</p>
                                    <p className="text-sm italic">"{transfer.message}"</p>
                                </div>
                            )}

                            {/* Expiry */}
                            {transfer.expires_at && (
                                <p className="text-xs text-muted-foreground text-center">
                                    This transfer expires on{" "}
                                    {new Date(transfer.expires_at).toLocaleDateString("en-US", { dateStyle: "long" })}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        <Button className="w-full" size="lg" onClick={handleAccept}>
                            <CheckCircleIcon className="mr-2 size-5" />
                            Accept Transfer
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                            You must be logged in with <strong>{transfer.to_email}</strong> to accept this transfer.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
