import { Head, Link, useForm } from "@inertiajs/react";
import { CalendarIcon, ClockIcon, DollarSignIcon, UserIcon } from "lucide-react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import FormLayout from "@/layouts/form-layout";

interface Event {
    id: string;
    title: string;
    event_date: string;
    venue_id: string | null;
    performer_id: string | null;
}

interface Venue {
    id: string;
    name: string;
    address: string;
    capacity: number;
    price_per_hour: number | null;
    price_per_event: number | null;
    price_per_day: number | null;
}

interface Performer {
    id: string;
    name: string;
    genres: string[];
    base_price: number | null;
    minimum_booking_hours: number | null;
}

interface Booking {
    id: string;
    booking_number: string;
    booking_type: string;
    event_id: string | null;
    venue_id: string | null;
    performer_id: string | null;
    status: string;
    payment_status: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string | null;
    contact_company: string | null;
    event_date: string;
    start_time: string;
    end_time: string;
    event_type: string;
    expected_guests: number | null;
    total_amount: number;
    currency: string;
    notes: string | null;
}

interface Props {
    booking: Booking;
    events: Event[];
    venues: Venue[];
    performers: Performer[];
}

export default function EditBooking({ booking, events, venues, performers }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        booking_type: booking.booking_type,
        event_id: booking.event_id || "",
        venue_id: booking.venue_id || "",
        performer_id: booking.performer_id || "",
        contact_name: booking.contact_name,
        contact_email: booking.contact_email,
        contact_phone: booking.contact_phone || "",
        contact_company: booking.contact_company || "",
        event_date: booking.event_date?.split("T")[0] || "",
        start_time: booking.start_time || "",
        end_time: booking.end_time || "",
        event_type: booking.event_type,
        expected_guests: booking.expected_guests?.toString() || "",
        total_amount: booking.total_amount?.toString() || "0",
        currency: booking.currency || "USD",
        status: booking.status,
        payment_status: booking.payment_status,
        notes: booking.notes || "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("bookings.update", booking.id) as string);
    };

    return (
        <FormLayout
            title={`Edit Booking ${booking.booking_number}`}
            description="Update booking details"
            backHref={route("bookings.show", booking.id) as string}
            backLabel="Back to Booking"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Status */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle>Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="status">Booking Status *</Label>
                                <Select value={data.status} onValueChange={(v) => setData("status", v)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="payment_status">Payment Status *</Label>
                                <Select value={data.payment_status} onValueChange={(v) => setData("payment_status", v)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="partially_paid">Partially Paid</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Booking Type & Target */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle>Booking Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Booking Type *</Label>
                            <Select value={data.booking_type} onValueChange={(v) => setData("booking_type", v)}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="event">Event</SelectItem>
                                    <SelectItem value="venue">Venue</SelectItem>
                                    <SelectItem value="performer">Performer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {data.booking_type === "event" && (
                            <div>
                                <Label>Event</Label>
                                <Select value={data.event_id} onValueChange={(v) => setData("event_id", v)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select event" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {events.map((event) => (
                                            <SelectItem key={event.id} value={event.id}>
                                                {event.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {data.booking_type === "venue" && (
                            <div>
                                <Label>Venue</Label>
                                <Select value={data.venue_id} onValueChange={(v) => setData("venue_id", v)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select venue" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {venues.map((venue) => (
                                            <SelectItem key={venue.id} value={venue.id}>
                                                {venue.name} - {venue.address}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {data.booking_type === "performer" && (
                            <div>
                                <Label>Performer</Label>
                                <Select value={data.performer_id} onValueChange={(v) => setData("performer_id", v)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select performer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {performers.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Contact */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserIcon className="size-4" />
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="contact_name">Name *</Label>
                                <Input id="contact_name" value={data.contact_name} onChange={(e) => setData("contact_name", e.target.value)} className="mt-1" />
                                {errors.contact_name && <p className="mt-1 text-sm text-destructive">{errors.contact_name}</p>}
                            </div>
                            <div>
                                <Label htmlFor="contact_email">Email *</Label>
                                <Input id="contact_email" type="email" value={data.contact_email} onChange={(e) => setData("contact_email", e.target.value)} className="mt-1" />
                                {errors.contact_email && <p className="mt-1 text-sm text-destructive">{errors.contact_email}</p>}
                            </div>
                            <div>
                                <Label htmlFor="contact_phone">Phone</Label>
                                <Input id="contact_phone" value={data.contact_phone} onChange={(e) => setData("contact_phone", e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="contact_company">Company</Label>
                                <Input id="contact_company" value={data.contact_company} onChange={(e) => setData("contact_company", e.target.value)} className="mt-1" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Date & Time */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="size-4" />
                            Date & Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="event_date">Date *</Label>
                                <Input id="event_date" type="date" value={data.event_date} onChange={(e) => setData("event_date", e.target.value)} className="mt-1" />
                                {errors.event_date && <p className="mt-1 text-sm text-destructive">{errors.event_date}</p>}
                            </div>
                            <div>
                                <Label htmlFor="start_time">Start *</Label>
                                <Input id="start_time" type="time" value={data.start_time} onChange={(e) => setData("start_time", e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="end_time">End *</Label>
                                <Input id="end_time" type="time" value={data.end_time} onChange={(e) => setData("end_time", e.target.value)} className="mt-1" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Event Type *</Label>
                                <Select value={data.event_type} onValueChange={(v) => setData("event_type", v)}>
                                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="private">Private</SelectItem>
                                        <SelectItem value="public">Public</SelectItem>
                                        <SelectItem value="corporate">Corporate</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="expected_guests">Expected Guests</Label>
                                <Input id="expected_guests" type="number" min="1" value={data.expected_guests} onChange={(e) => setData("expected_guests", e.target.value)} className="mt-1" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSignIcon className="size-4" />
                            Pricing
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="total_amount">Total Amount *</Label>
                            <Input id="total_amount" type="number" step="0.01" min="0" value={data.total_amount} onChange={(e) => setData("total_amount", e.target.value)} className="mt-1" />
                            {errors.total_amount && <p className="mt-1 text-sm text-destructive">{errors.total_amount}</p>}
                        </div>
                        <div>
                            <Label>Currency *</Label>
                            <Select value={data.currency} onValueChange={(v) => setData("currency", v)}>
                                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                    <SelectItem value="GBP">GBP</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Notes */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea value={data.notes} onChange={(e) => setData("notes", e.target.value)} rows={4} placeholder="Additional notes..." />
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" asChild>
                        <Link href={route("bookings.show", booking.id) as string}>Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </FormLayout>
    );
}
