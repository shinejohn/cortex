import { Head, Link, useForm } from "@inertiajs/react";
import { GiftIcon, TicketIcon } from "lucide-react";
import { route } from "ziggy-js";
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
    ticketPlan: TicketPlan;
    ticketOrder: TicketOrder;
}

interface Props {
    ticketOrderItem: TicketOrderItem;
}

export default function GiftTicket({ ticketOrderItem }: Props) {
    const event = ticketOrderItem.ticketOrder?.event;

    const { data, setData, post, processing, errors } = useForm({
        recipient_email: "",
        recipient_name: "",
        message: "",
        expires_at: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("tickets.gift.store", ticketOrderItem.id) as string);
    };

    return (
        <FormLayout
            title="Gift a Ticket"
            description="Send this ticket as a gift"
            backHref={route("tickets.my-tickets") as string}
            backLabel="Back to My Tickets"
        >
            {/* Ticket Summary */}
            <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm mb-6">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-pink-100 dark:bg-pink-900 p-3">
                            <GiftIcon className="size-6 text-pink-600 dark:text-pink-400" />
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
                            <GiftIcon className="size-4" />
                            Gift Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="recipient_email">Recipient Email *</Label>
                            <Input
                                id="recipient_email"
                                type="email"
                                value={data.recipient_email}
                                onChange={(e) => setData("recipient_email", e.target.value)}
                                placeholder="friend@example.com"
                                className="mt-1"
                                required
                            />
                            {errors.recipient_email && <p className="mt-1 text-sm text-destructive">{errors.recipient_email}</p>}
                        </div>
                        <div>
                            <Label htmlFor="recipient_name">Recipient Name</Label>
                            <Input
                                id="recipient_name"
                                value={data.recipient_name}
                                onChange={(e) => setData("recipient_name", e.target.value)}
                                placeholder="Their name"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="message">Gift Message</Label>
                            <Textarea
                                id="message"
                                value={data.message}
                                onChange={(e) => setData("message", e.target.value)}
                                rows={3}
                                className="mt-1"
                                placeholder="Write a personal gift message..."
                                maxLength={500}
                            />
                        </div>
                        <div>
                            <Label htmlFor="expires_at">Gift Expires</Label>
                            <Input
                                id="expires_at"
                                type="datetime-local"
                                value={data.expires_at}
                                onChange={(e) => setData("expires_at", e.target.value)}
                                className="mt-1"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">Leave blank for 30-day default.</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" asChild>
                        <Link href={route("tickets.my-tickets") as string}>Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? "Sending..." : "Send Gift"}
                        <GiftIcon className="ml-2 size-4" />
                    </Button>
                </div>
            </form>
        </FormLayout>
    );
}
