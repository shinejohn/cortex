import { Head, router } from "@inertiajs/react";
import { GiftIcon, TicketIcon, UserIcon } from "lucide-react";
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
}

interface Gift {
    id: string;
    gift_token: string;
    recipient_email: string;
    recipient_name: string | null;
    message: string | null;
    expires_at: string | null;
    ticketOrderItem: TicketOrderItem;
    gifter: User;
}

interface Props {
    gift: Gift;
}

export default function RedeemGift({ gift }: Props) {
    const event = gift.ticketOrderItem?.ticketOrder?.event;

    const handleRedeem = () => {
        router.post(route("tickets.gift.complete", gift.id) as string);
    };

    return (
        <AppLayout>
            <Head title="Redeem Gift Ticket" />
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 max-w-lg">
                    <div className="text-center mb-8">
                        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900">
                            <GiftIcon className="size-8 text-pink-600 dark:text-pink-400" />
                        </div>
                        <h1 className="font-display text-2xl font-black tracking-tight">
                            You Got a Gift!
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            {gift.gifter?.name} sent you a ticket.
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
                                    <p className="text-sm font-medium">{gift.gifter?.name}</p>
                                </div>
                            </div>

                            {gift.recipient_name && (
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-muted p-2">
                                        <GiftIcon className="size-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">To</p>
                                        <p className="text-sm font-medium">{gift.recipient_name}</p>
                                    </div>
                                </div>
                            )}

                            {/* Event */}
                            <div className="rounded-lg bg-muted/50 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TicketIcon className="size-4 text-primary" />
                                    <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Event Ticket</span>
                                </div>
                                <h3 className="font-display text-lg font-bold tracking-tight">
                                    {event?.title || "Event Ticket"}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {gift.ticketOrderItem?.ticketPlan?.name}
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
                            {gift.message && (
                                <div className="rounded-lg border p-4 bg-pink-50/50 dark:bg-pink-950/20">
                                    <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-1">Gift Message</p>
                                    <p className="text-sm italic">"{gift.message}"</p>
                                </div>
                            )}

                            {gift.expires_at && (
                                <p className="text-xs text-muted-foreground text-center">
                                    Redeem before {new Date(gift.expires_at).toLocaleDateString("en-US", { dateStyle: "long" })}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        <Button className="w-full" size="lg" onClick={handleRedeem}>
                            <GiftIcon className="mr-2 size-5" />
                            Redeem Gift
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                            Sign in with <strong>{gift.recipient_email}</strong> to redeem.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
