import { Head, Link, useForm } from "@inertiajs/react";
import { DollarSignIcon, TicketIcon } from "lucide-react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
}

interface TicketOrderItem {
    id: string;
    quantity: number;
    unit_price: number;
    ticketPlan: TicketPlan;
}

interface TicketOrder {
    id: string;
    event: Event;
    items: TicketOrderItem[];
}

interface Props {
    ticketOrders: TicketOrder[];
}

export default function ListForSale({ ticketOrders }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        ticket_order_item_id: "",
        price: "",
        quantity: "1",
        description: "",
        expires_at: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("tickets.marketplace.store") as string);
    };

    const selectedItem = ticketOrders
        .flatMap((o) => o.items.map((item) => ({ ...item, event: o.event })))
        .find((i) => i.id === data.ticket_order_item_id);

    return (
        <FormLayout
            title="List Ticket for Sale"
            description="Sell your ticket on the marketplace"
            backHref={route("tickets.my-tickets") as string}
            backLabel="Back to My Tickets"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Select Ticket */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TicketIcon className="size-4" />
                            Select Ticket
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {ticketOrders.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                                You don't have any tickets available to sell.
                            </p>
                        ) : (
                            <div>
                                <Label>Ticket *</Label>
                                <Select value={data.ticket_order_item_id} onValueChange={(v) => setData("ticket_order_item_id", v)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Choose a ticket to sell" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ticketOrders.map((order) =>
                                            order.items.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {order.event.title} - {item.ticketPlan.name} (x{item.quantity})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.ticket_order_item_id && (
                                    <p className="mt-1 text-sm text-destructive">{errors.ticket_order_item_id}</p>
                                )}
                            </div>
                        )}

                        {selectedItem && (
                            <div className="rounded-lg bg-muted/50 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{selectedItem.event.title}</p>
                                        <p className="text-sm text-muted-foreground">{selectedItem.ticketPlan.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(selectedItem.event.event_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="secondary">{selectedItem.quantity} available</Badge>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Paid: ${Number(selectedItem.unit_price).toFixed(2)} each
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Listing Details */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSignIcon className="size-4" />
                            Listing Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="price">Asking Price per Ticket *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.price}
                                    onChange={(e) => setData("price", e.target.value)}
                                    className="mt-1"
                                    placeholder="0.00"
                                />
                                {errors.price && <p className="mt-1 text-sm text-destructive">{errors.price}</p>}
                            </div>
                            <div>
                                <Label htmlFor="quantity">Quantity *</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    max={selectedItem?.quantity || 1}
                                    value={data.quantity}
                                    onChange={(e) => setData("quantity", e.target.value)}
                                    className="mt-1"
                                />
                                {errors.quantity && <p className="mt-1 text-sm text-destructive">{errors.quantity}</p>}
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="description">Description (optional)</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData("description", e.target.value)}
                                rows={3}
                                className="mt-1"
                                placeholder="Add details about the tickets..."
                            />
                        </div>
                        <div>
                            <Label htmlFor="expires_at">Listing Expires</Label>
                            <Input
                                id="expires_at"
                                type="datetime-local"
                                value={data.expires_at}
                                onChange={(e) => setData("expires_at", e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" asChild>
                        <Link href={route("tickets.my-tickets") as string}>Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={processing || ticketOrders.length === 0}>
                        {processing ? "Listing..." : "List for Sale"}
                    </Button>
                </div>
            </form>
        </FormLayout>
    );
}
