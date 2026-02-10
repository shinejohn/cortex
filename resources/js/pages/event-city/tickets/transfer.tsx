import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowRightIcon, SendIcon, TicketIcon } from "lucide-react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FormLayout from "@/layouts/form-layout";

interface TicketPlan {
    id: string;
    name: string;
    price: number;
}

interface Event {
    id: string;
    title: string;
    event_date: string;
    venue?: { name: string };
}

interface TicketOrder {
    id: string;
    event: Event;
}

interface TicketOrderItem {
    id: string;
    quantity: number;
    ticket_code: string;
    ticketPlan: TicketPlan;
    ticketOrder: TicketOrder;
}

interface Props {
    ticketOrderItem: TicketOrderItem;
}

export default function TransferTicket({ ticketOrderItem }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        to_email: "",
        message: "",
        expires_at: "",
    });

    const event = ticketOrderItem.ticketOrder?.event;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("tickets.transfer.store", ticketOrderItem.id) as string);
    };

    return (
        <FormLayout
            title="Transfer Ticket"
            description="Send this ticket to someone else"
            backHref={route("tickets.my-tickets") as string}
            backLabel="Back to My Tickets"
        >
            {/* Ticket Summary */}
            <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm mb-6">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-primary/10 p-3">
                            <TicketIcon className="size-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-display text-lg font-bold tracking-tight">
                                {event?.title || "Event"}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {ticketOrderItem.ticketPlan?.name} - {ticketOrderItem.quantity} ticket{ticketOrderItem.quantity > 1 ? "s" : ""}
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
                    </div>
                </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <SendIcon className="size-4" />
                            Transfer Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="to_email">Recipient Email *</Label>
                            <Input
                                id="to_email"
                                type="email"
                                value={data.to_email}
                                onChange={(e) => setData("to_email", e.target.value)}
                                placeholder="recipient@example.com"
                                className="mt-1"
                                required
                            />
                            {errors.to_email && <p className="mt-1 text-sm text-destructive">{errors.to_email}</p>}
                        </div>
                        <div>
                            <Label htmlFor="message">Message (optional)</Label>
                            <Textarea
                                id="message"
                                value={data.message}
                                onChange={(e) => setData("message", e.target.value)}
                                rows={3}
                                className="mt-1"
                                placeholder="Add a personal message..."
                                maxLength={500}
                            />
                        </div>
                        <div>
                            <Label htmlFor="expires_at">Transfer Expires</Label>
                            <Input
                                id="expires_at"
                                type="datetime-local"
                                value={data.expires_at}
                                onChange={(e) => setData("expires_at", e.target.value)}
                                className="mt-1"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">Leave blank for default 7-day expiration.</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" asChild>
                        <Link href={route("tickets.my-tickets") as string}>Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? "Sending..." : "Send Transfer"}
                        <ArrowRightIcon className="ml-2 size-4" />
                    </Button>
                </div>
            </form>
        </FormLayout>
    );
}
